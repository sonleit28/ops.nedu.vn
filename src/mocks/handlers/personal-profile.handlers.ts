import { http, HttpResponse } from 'msw';
import { MOCK_PERSONAL_PROFILE, MOCK_LEADS } from '../../constants/mock-data';
import type { PersonalProfile } from '../../shared/types';

const BASE = '/api';

const profiles: Record<string, PersonalProfile> = {
  p3: MOCK_PERSONAL_PROFILE,
};

export const personalProfileHandlers = [
  http.get(`${BASE}/leads/:id/personal-profile`, ({ params }) => {
    const lead = MOCK_LEADS.find(l => l.id === params.id);
    if (!lead) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }
    const profile = profiles[lead.person.id];
    if (!profile) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Profile not generated yet', request_id: 'req-mock' }, { status: 404 });
    }
    return HttpResponse.json({ data: profile });
  }),

  http.post(`${BASE}/leads/:id/personal-profile/generate`, async ({ params }) => {
    const lead = MOCK_LEADS.find(l => l.id === params.id);
    if (!lead) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newProfile: PersonalProfile = {
      id: `pp-${Date.now()}`,
      person_id: lead.person.id,
      hero_card: {
        quote: `${lead.person.full_name} — người tìm kiếm ý nghĩa và sự kết nối thực sự trong mọi mối quan hệ`,
        nhat_chu: 'Giáp Mộc',
        life_path: 5,
        nine_star: 'Hoàng Thổ Tinh (5 Thổ)',
      },
      core_personality_summary: `${lead.person.full_name} có tư duy chiến lược và khả năng nhìn xa trông rộng. Thường đặt câu hỏi sâu sắc về ý nghĩa cuộc sống và muốn tạo ra giá trị thực sự.`,
      communication_dos: [
        'Lắng nghe chân thành và không phán xét',
        'Chia sẻ tầm nhìn dài hạn của chương trình',
        'Dùng ví dụ thực tế và câu chuyện có chiều sâu',
        'Tôn trọng quá trình suy nghĩ của họ',
      ],
      communication_donts: [
        'Không tạo áp lực quyết định nhanh',
        'Tránh tiếp cận quá thương mại hóa',
        'Không đưa ra quá nhiều lựa chọn cùng lúc',
      ],
      true_needs: 'Được hiểu, được đồng hành, và cộng đồng có cùng giá trị.',
      current_year_timing: '2026 là năm thuận lợi để đầu tư vào bản thân và học hỏi kỹ năng mới.',
      opening_suggestion: `Hãy bắt đầu bằng: "Nhìn vào hành trình của ${lead.person.full_name}, tôi thấy đây là thời điểm quan trọng để..."`,
      generated_by: 'ai-engine-v2',
      generated_at: new Date().toISOString(),
    };

    profiles[lead.person.id] = newProfile;
    return HttpResponse.json({ data: newProfile });
  }),
];
