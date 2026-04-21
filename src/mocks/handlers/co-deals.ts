// src/mocks/handlers/co-deals.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS } from '../data/leads'
import { MOCK_CO_DEALS } from '../data/co-deals'
import type { CoDeal } from '@modules/ops/types'

export const coDealHandlers = [
  http.post('*/api/ops/leads/:id/co-deals', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const leadIdx = MOCK_LEADS.findIndex(l => l.id === params.id)
    if (leadIdx < 0) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && MOCK_LEADS[leadIdx].assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const body = await request.json() as { co_dealer_user_id: string; initiator_ratio: number; co_dealer_ratio: number; note?: string }
    const errors: string[] = []
    if (!body.co_dealer_user_id) errors.push('co_dealer_user_id should not be empty')
    if (body.initiator_ratio === undefined) errors.push('initiator_ratio should not be empty')
    if (body.co_dealer_ratio === undefined) errors.push('co_dealer_ratio should not be empty')
    if (errors.length) return HttpResponse.json({ statusCode: 400, message: errors, error: 'Bad Request' }, { status: 400 })
    if (body.initiator_ratio + body.co_dealer_ratio !== 100) {
      return HttpResponse.json({ statusCode: 400, message: ['Tổng tỷ lệ hoa hồng phải bằng 100'], error: 'Bad Request', code: 'CO_DEAL_RATIO_INVALID' }, { status: 400 })
    }
    const now = new Date().toISOString()
    const codeal: CoDeal = {
      id: crypto.randomUUID(), lead_id: MOCK_LEADS[leadIdx].id,
      initiator_person_id: personId, co_dealer_person_id: body.co_dealer_user_id,
      initiator_ratio: body.initiator_ratio, co_dealer_ratio: body.co_dealer_ratio,
      note: body.note, created_at: now,
    }
    MOCK_CO_DEALS.push(codeal)
    MOCK_LEADS[leadIdx] = { ...MOCK_LEADS[leadIdx], has_co_deal: true, updated_at: now }
    return HttpResponse.json({ data: codeal }, { status: 201 })
  }),
]
