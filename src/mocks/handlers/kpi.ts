// src/mocks/handlers/kpi.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockPerson, unauthorized, forbidden } from '../config'
import { MOCK_KPI, MOCK_KPI_TEAM } from '../data/kpi'

export const kpiHandlers = [
  http.get('*/api/ops/kpi', async () => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!['leader','admin','owner'].includes(person.primary_role)) return forbidden('Chỉ leader / admin / owner')
    return HttpResponse.json({ data: MOCK_KPI })
  }),

  // E-08 — Team leaderboard, mọi ops role đều xem được. Inject is_me theo current user.
  http.get('*/api/ops/kpi/team', async ({ request }) => {
    const person = await getCurrentMockPerson()
    if (!person) return unauthorized()
    if (!['consultant','leader','admin','owner'].includes(person.primary_role)) {
      return forbidden('Bạn không có quyền truy cập ops portal')
    }
    const url = new URL(request.url)
    const month = url.searchParams.get('month') ?? MOCK_KPI_TEAM.month
    const members = MOCK_KPI_TEAM.members.map(m => ({
      ...m,
      is_me: m.user_id === person.id,
    }))
    return HttpResponse.json({ data: { ...MOCK_KPI_TEAM, month, members } })
  }),
]
