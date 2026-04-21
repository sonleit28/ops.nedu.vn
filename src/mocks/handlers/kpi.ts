// src/mocks/handlers/kpi.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockPerson, unauthorized, forbidden } from '../config'
import { MOCK_KPI } from '../data/kpi'

export const kpiHandlers = [
  http.get('*/api/ops/kpi', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!['leader','admin','owner'].includes(person.primary_role)) return forbidden('Chỉ leader / admin / owner')
    return HttpResponse.json({ data: MOCK_KPI })
  }),
]
