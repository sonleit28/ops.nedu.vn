// src/mocks/handlers/pipeline-actions.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS } from '../data/leads'
import { MOCK_PIPELINE_ACTIONS } from '../data/pipeline-actions'

export const pipelineActionHandlers = [
  http.get('*/api/ops/leads/:id/actions', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const lead = MOCK_LEADS.find(l => l.id === params.id)
    if (!lead) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && lead.assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const url = new URL(request.url)
    const page  = Number(url.searchParams.get('page')  ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '50')
    const items = MOCK_PIPELINE_ACTIONS
      .filter(a => a.lead_id === params.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const paged = items.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ data: paged, meta: { page, limit, total: items.length } })
  }),
]
