// src/mocks/data/personal-profiles.ts
import type { PersonalProfile } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'
import { MOCK_LEADS } from './leads'

export const MOCK_PERSONAL_PROFILES: PersonalProfile[] = [
  {
    id: 'profile-0001-aaaa-0001',
    lead_id: MOCK_LEADS[0].id, generated_by_person_id: MOCK_PERSONS[2].id,
    core_personality: 'Canh Kim nhật chủ — thực tế, coi trọng kết quả, quyết đoán khi đủ thông tin.',
    communication_dos: ['Đưa số liệu, kết quả cụ thể.', 'Nói thẳng vào lợi ích.', 'Hỏi về mục tiêu nghề nghiệp.'],
    communication_donts: ['Tránh nói mơ hồ.', 'Không push khi chưa trả lời hết câu hỏi.'],
    real_need: 'Muốn có lộ trình rõ ràng, không muốn mày mò một mình.',
    timing_2026: 'Năm Bính Ngọ — phù hợp bắt đầu chương trình dài hạn.',
    opening_suggestion: 'Chào bạn, tôi thấy bạn đang ở giai đoạn muốn định hướng lại — khóa Là Chính Mình có thể rút ngắn thời gian tự khám phá từ 2–3 năm xuống 6 tháng.',
    life_path_number: 7, nine_star: '4 Mộc', nhut_chu: 'Canh Kim',
    created_at: '2026-04-17T11:00:00.000Z', updated_at: '2026-04-17T11:00:00.000Z',
  },
]

export function getProfileByLeadId(leadId: string) {
  return MOCK_PERSONAL_PROFILES.find(p => p.lead_id === leadId)
}
