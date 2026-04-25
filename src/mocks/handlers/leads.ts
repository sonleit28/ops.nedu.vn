// src/mocks/handlers/leads.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS, getLeadsByPersonId } from '../data/leads'
import { MOCK_PERSONS } from '../data/persons'
import type { Lead, LeadSource, PipelineStage, ProgramSlug } from '@modules/ops/types'

const STAGE_ORDER: PipelineStage[] = ['awareness','interest','consideration','intent','enrolled','retention']

export const leadsHandlers = [

  http.get('*/api/ops/leads', async ({ request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const url = new URL(request.url)
    const page  = Number(url.searchParams.get('page')  ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const stageFilter = url.searchParams.get('stage')
    const slaFilter   = url.searchParams.get('sla_breached')
    const cidFilter   = url.searchParams.get('consultant_id')

    let items: Lead[]
    if (person && ['leader','admin','owner'].includes(person.primary_role)) {
      items = cidFilter ? MOCK_LEADS.filter(l => l.assigned_to_user_id === cidFilter) : [...MOCK_LEADS]
    } else {
      items = getLeadsByPersonId(personId)
    }
    if (stageFilter) items = items.filter(l => l.stage === stageFilter)
    if (slaFilter === 'true') items = items.filter(l => l.sla_breached)
    items = items.sort((a, b) => {
      if (a.sla_breached && !b.sla_breached) return -1
      if (!a.sla_breached && b.sla_breached) return 1
      return b.updated_at.localeCompare(a.updated_at)
    })
    const paged = items.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ data: paged, meta: { page, limit, total: items.length } })
  }),

  http.get('*/api/ops/leads/:id', async ({ params }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const lead = MOCK_LEADS.find(l => l.id === params.id)
    if (!lead) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && lead.assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    return HttpResponse.json({ data: lead })
  }),

  http.patch('*/api/ops/leads/:id', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const idx = MOCK_LEADS.findIndex(l => l.id === params.id)
    if (idx < 0) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && MOCK_LEADS[idx].assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const patch = await request.json() as Partial<Lead>
    MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], ...patch, updated_at: new Date().toISOString() }
    return HttpResponse.json({ data: MOCK_LEADS[idx] })
  }),

  http.patch('*/api/ops/leads/:id/stage', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const idx = MOCK_LEADS.findIndex(l => l.id === params.id)
    if (idx < 0) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && MOCK_LEADS[idx].assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const body = await request.json() as { direction: 'forward' | 'back'; regression_reason?: string }
    if (!body.direction) {
      return HttpResponse.json({ statusCode: 400, message: ['direction should not be empty'], error: 'Bad Request' }, { status: 400 })
    }
    if (body.direction === 'back' && !body.regression_reason) {
      return HttpResponse.json(
        { statusCode: 422, message: 'Lùi stage yêu cầu lý do bắt buộc', error: 'Unprocessable Entity', code: 'STAGE_REGRESSION_REASON_REQUIRED' },
        { status: 422 },
      )
    }
    if (body.direction === 'back' && MOCK_LEADS[idx].stage === 'enrolled') {
      return HttpResponse.json(
        { statusCode: 422, message: 'Không thể lùi stage từ Enrolled', error: 'Unprocessable Entity', code: 'STAGE_REGRESSION_FROM_ENROLLED_FORBIDDEN' },
        { status: 422 },
      )
    }
    const curIdx = STAGE_ORDER.indexOf(MOCK_LEADS[idx].stage)
    const nextIdx = body.direction === 'forward' ? curIdx + 1 : curIdx - 1
    if (nextIdx < 0 || nextIdx >= STAGE_ORDER.length) {
      return HttpResponse.json(
        { statusCode: 422, message: 'Chuyển stage không hợp lệ', error: 'Unprocessable Entity', code: 'INVALID_STAGE_TRANSITION' },
        { status: 422 },
      )
    }
    MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], stage: STAGE_ORDER[nextIdx], updated_at: new Date().toISOString() }
    return HttpResponse.json({ data: MOCK_LEADS[idx] })
  }),

  http.patch('*/api/ops/leads/:id/assignment', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    if (!person || !['leader','admin','owner'].includes(person.primary_role)) {
      return forbidden('Chỉ leader / admin / owner mới reassign được')
    }
    const idx = MOCK_LEADS.findIndex(l => l.id === params.id)
    if (idx < 0) return notFound('Lead not found')
    const body = await request.json() as { new_consultant_person_id: string; reason?: string }
    if (!body.new_consultant_person_id) {
      return HttpResponse.json({ statusCode: 400, message: ['new_consultant_person_id should not be empty'], error: 'Bad Request' }, { status: 400 })
    }
    const newCons = MOCK_PERSONS.find(p => p.id === body.new_consultant_person_id)
    if (!newCons) return notFound('New consultant not found')
    const activeCount = MOCK_LEADS.filter(
      l => l.assigned_to_user_id === body.new_consultant_person_id
        && !['enrolled','retention'].includes(l.stage)
    ).length
    if (activeCount >= 20) {
      return HttpResponse.json(
        { statusCode: 422, message: `Consultant đã có ${activeCount} leads active`, error: 'Unprocessable Entity', code: 'CONSULTANT_OVERLOADED', details: { current_load: activeCount, max_load: 20 } },
        { status: 422 },
      )
    }
    MOCK_LEADS[idx] = { ...MOCK_LEADS[idx], assigned_to_user_id: newCons.id, assigned_to_full_name: newCons.full_name, updated_at: new Date().toISOString() }
    return HttpResponse.json({ data: MOCK_LEADS[idx] })
  }),

  http.post('*/api/internal/leads/ingest', async ({ request }) => {
    const secret = request.headers.get('x-internal-secret')
    if (secret !== 'dev-internal-secret') {
      return HttpResponse.json({ statusCode: 401, message: 'Invalid internal secret', error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json() as { full_name: string; phone: string; email?: string; source: LeadSource; test_score?: number; interested_courses?: string[] }
    const errors: string[] = []
    if (!body.full_name) errors.push('full_name should not be empty')
    if (!body.phone) errors.push('phone should not be empty')
    if (!body.source) errors.push('source should not be empty')
    if (errors.length) return HttpResponse.json({ statusCode: 400, message: errors, error: 'Bad Request' }, { status: 400 })
    const consultants = MOCK_PERSONS.filter(p => p.primary_role === 'consultant')
    const loads = consultants.map(c => ({
      person: c,
      count: MOCK_LEADS.filter(l => l.assigned_to_user_id === c.id && !['enrolled','retention'].includes(l.stage)).length,
    }))
    const assigned = loads.sort((a, b) => a.count - b.count)[0]?.person ?? consultants[0]
    const now = new Date().toISOString()
    const newLead: Lead = {
      id: crypto.randomUUID(),
      full_name: body.full_name, phone: body.phone, email: body.email,
      stage: 'awareness', source: body.source,
      assigned_to_user_id: assigned.id, assigned_to_full_name: assigned.full_name,
      interested_courses: body.interested_courses ?? [],
      test_score: body.test_score,
      sla_breached: false, is_returning: false, has_co_deal: false, profile_completion_pct: 20,
      ai_profile_consent: false,
      created_at: now, updated_at: now,
    }
    MOCK_LEADS.push(newLead)
    return HttpResponse.json({ data: newLead }, { status: 201 })
  }),
]
