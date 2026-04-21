// src/mocks/handlers/transfers.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS } from '../data/leads'
import { MOCK_PERSONS } from '../data/persons'

export const transferHandlers = [
  http.post('*/api/ops/leads/:id/transfers', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const leadIdx = MOCK_LEADS.findIndex(l => l.id === params.id)
    if (leadIdx < 0) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && MOCK_LEADS[leadIdx].assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const body = await request.json() as { to_user_id: string; reason: string }
    const errors: string[] = []
    if (!body.to_user_id) errors.push('to_user_id should not be empty')
    if (!body.reason?.trim()) errors.push('reason should not be empty')
    if (errors.length) return HttpResponse.json({ statusCode: 400, message: errors, error: 'Bad Request' }, { status: 400 })
    const target = MOCK_PERSONS.find(p => p.id === body.to_user_id)
    if (!target) return notFound('Target consultant not found')
    MOCK_LEADS[leadIdx] = { ...MOCK_LEADS[leadIdx], assigned_to_user_id: target.id, assigned_to_full_name: target.full_name, updated_at: new Date().toISOString() }
    return HttpResponse.json({ data: MOCK_LEADS[leadIdx] }, { status: 201 })
  }),
]
