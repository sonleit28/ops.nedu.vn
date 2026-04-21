// src/mocks/handlers/personal-profiles.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS } from '../data/leads'
import { MOCK_PERSONAL_PROFILES, getProfileByLeadId } from '../data/personal-profiles'
import type { PersonalProfile } from '@modules/ops/types'

export const personalProfileHandlers = [

  http.get('*/api/ops/leads/:id/personal-profile', async ({ params }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const lead = MOCK_LEADS.find(l => l.id === params.id)
    if (!lead) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && lead.assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const profile = getProfileByLeadId(params.id as string)
    if (!profile) return notFound('Profile chưa được tạo — nhập ngày sinh và generate trước')
    return HttpResponse.json({ data: profile })
  }),

  http.post('*/api/ops/leads/:id/personal-profile', async ({ params }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const lead = MOCK_LEADS.find(l => l.id === params.id)
    if (!lead) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && lead.assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    if (!lead.birth_date) {
      return HttpResponse.json(
        { statusCode: 422, message: 'Cần có ngày sinh để tạo Personal Profile', error: 'Unprocessable Entity', code: 'MISSING_BIRTH_DATE' },
        { status: 422 },
      )
    }
    if (!lead.ai_profile_consent) {
      return HttpResponse.json(
        { statusCode: 422, message: 'Lead chưa đồng ý cho phép tạo Personal Profile — xin consent trước', error: 'Unprocessable Entity', code: 'AI_PROFILE_CONSENT_REQUIRED', details: { lead_id: lead.id } },
        { status: 422 },
      )
    }
    const existingIdx = MOCK_PERSONAL_PROFILES.findIndex(p => p.lead_id === params.id)
    if (existingIdx >= 0) MOCK_PERSONAL_PROFILES.splice(existingIdx, 1)
    const now = new Date().toISOString()
    const generated: PersonalProfile = {
      id: crypto.randomUUID(), lead_id: lead.id, generated_by_person_id: personId,
      core_personality: 'Mock AI: phân tích BaZi + Numerology tự động.',
      communication_dos: ['Nói trực tiếp vào lợi ích.', 'Dùng số liệu cụ thể.'],
      communication_donts: ['Tránh mơ hồ.', 'Không push quá sớm.'],
      real_need: 'Cần lộ trình rõ ràng.',
      timing_2026: 'Năm phù hợp để bắt đầu.',
      opening_suggestion: `Chào ${lead.full_name}, đây là thời điểm tốt để bạn bắt đầu hành trình của mình.`,
      created_at: now, updated_at: now,
    }
    MOCK_PERSONAL_PROFILES.push(generated)
    return HttpResponse.json({ data: generated }, { status: 201 })
  }),
]
