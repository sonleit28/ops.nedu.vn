// src/mocks/handlers/dashboard.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, unauthorized } from '../config'
import { getLeadsByPersonId } from '../data/leads'

export const dashboardHandlers = [
  http.get('*/api/ops/dashboard/me', async () => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const myLeads = getLeadsByPersonId(personId)
    const active = myLeads.filter(l => !['enrolled','retention'].includes(l.stage))
    const today = new Date().toISOString().slice(0, 10)
    return HttpResponse.json({
      data: {
        person_id: personId,
        active_leads_count: active.length,
        load_pct: Math.round(active.length / 20 * 100),
        urgent_leads_count: active.filter(l => l.sla_breached).length,
        leads_today: myLeads.filter(l => l.created_at.startsWith(today)).length,
      },
    })
  }),
]
