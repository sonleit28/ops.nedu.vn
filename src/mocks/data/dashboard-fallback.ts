import type { Todo, ProfileCard } from '@modules/ops/types'

// Dashboard UI fallback data — chỉ dùng khi MSW mock đang bật
// (env.IS_MOCK=true). Mục đích: dev có thể chạy + edit UI mà không cần
// BE thật. Khi tắt MSW → App bootstrap từ API thật, không touch fallback.
//
// INIT_TODOS: 5 demo lead initial state cho UI list — App.tsx useLeads()
// sau đó override bằng data API.
// PROFILE_CARDS_INIT: 2 demo 5-system profile (id=4 Nam CEO, id=6 Phúc)
// để showcase Hồ sơ AI tab khi chưa fetch /personal-profile.

export const INIT_TODOS: Todo[] = [
  { id: 6, priority: 'urgent', action: 'GỌI NGAY', name: 'Lê Minh Phúc',
    badge: '🔄 Khách cũ 3 năm', badgeColor: 'amber',
    desc: 'Từng hỏi 2022 rồi lặn. Đọc lịch sử trước khi gọi!',
    stage: 1, phone: '0908 777 123', email: 'phuc.lm@gmail.com',
    sourceType: 'inbound', sourceCh: 'nedu.vn/test', color: '#8B5CF6', days: 0,
    testScore: 68, testDesc: 'Điểm tăng 51→68 (2022→2026). Sẵn sàng hơn rồi.',
    note: '', profile: { dob: '19/07/1987', birthTime: '', job: 'Giáo viên THPT', goal: '', pain: '' },
    courses: ['lcm'],
    timeline: [
      { icon: '☑️', action: 'Tick "cho tư vấn" — lần 2', date: '06/04/2026 08:15', who: 'Hệ thống', note: '' },
      { icon: '🧩', action: 'Bài test lần 2 — điểm 68', date: '06/04/2026 08:10', who: 'Hệ thống', note: 'Tăng từ 51 lên 68 sau 3 năm' },
      { isDivider: true, label: '── 3 năm trước · 2022 ──' },
      { icon: '📞', action: 'Tư vấn lần 1 — 2022', date: '15/03/2022 10:00', who: 'Hương Nguyễn', note: 'Nói "chưa sẵn sàng tài chính, để sau". Giọng có áp lực gia đình. Hỏi nhiều về lịch cuối tuần.' },
      { icon: '🧩', action: 'Bài test lần 1 — điểm 51', date: '12/03/2022', who: 'Hệ thống', note: '' },
    ],
    notes: [{ text: 'Khách cũ — lần đầu do áp lực gia đình. Lần này TỰ quay lại. Hỏi ngay: "Điều gì thay đổi trong 3 năm?" trước khi pitch.', date: '06/04/2026', who: 'Hương Nguyễn (2022)' }],
    done: false },

  { id: 1, priority: 'urgent', action: 'GỌI NGAY', name: 'Nguyễn Văn Hùng',
    badge: '⚠ Quá hạn 26h', badgeColor: 'red',
    desc: 'Chưa được liên hệ từ hôm qua.',
    stage: 1, phone: '0987 654 321', email: 'hung.nv@hotmail.com',
    sourceType: 'inbound', sourceCh: 'nedu.vn/test', color: '#EF4444', days: 1,
    testScore: 61, testDesc: 'Áp lực công việc cao, muốn thay đổi.',
    note: '', profile: { dob: '', birthTime: '', job: '', goal: '', pain: '' },
    courses: [],
    timeline: [
      { icon: '☑️', action: 'Tick "cho tư vấn"', date: '05/04/2026 07:30', who: 'Hệ thống', note: '' },
      { icon: '🧩', action: 'Hoàn thành bài test', date: '05/04/2026 07:25', who: 'Hệ thống', note: '' },
    ], notes: [], done: false },

  { id: 7, priority: 'urgent', action: 'GỌI NGAY', name: 'Vũ Thị Phương',
    badge: '📢 Chiến dịch quảng cáo', badgeColor: 'blue',
    desc: 'Từ Facebook Ads Tháng 4. Marketing team đã thu thập email.',
    stage: 1, phone: '0976 543 210', email: 'phuong.vt@gmail.com',
    sourceType: 'marketing', sourceCh: 'Facebook Ads · Campaign T4/2026', color: '#3B82F6', days: 0,
    testScore: 0, testDesc: 'Chưa làm bài test — đến từ Marketing trực tiếp.',
    note: 'Lead từ Marketing team. Chưa làm test. Cần thu thập thêm thông tin cơ bản.',
    profile: { dob: '', birthTime: '', job: '', goal: '', pain: '' },
    courses: [],
    timeline: [
      { icon: '📢', action: 'Lead từ Facebook Ads Campaign', date: '06/04/2026 06:00', who: 'Đội Marketing', note: 'UTM: fb_ads_lcm_t4_2026. Điền form landing page quảng cáo. Chưa qua bài test nedu.vn.' },
    ], notes: [], done: false },

  { id: 4, priority: 'today', action: 'TƯ VẤN', name: 'Hoàng Văn Nam',
    badge: '💬 Objection giá', badgeColor: 'amber',
    desc: 'Dùng Hồ sơ AI để xử lý đúng góc độ CEO.',
    stage: 3, phone: '0945 321 098', email: 'nam.hv@company.com',
    sourceType: 'inbound', sourceCh: 'nedu.vn/test', color: '#06B6D4', days: 8,
    testScore: 74, testDesc: 'Thành đạt tài chính nhưng trống rỗng bên trong.',
    note: 'Đọc Hồ sơ AI trước khi gọi — có profile đầy đủ.',
    profile: { dob: '10/03/1985', birthTime: '14:30', job: 'CEO Khởi nghiệp', goal: 'Tìm lại ý nghĩa', pain: 'Cô đơn trong vai trò CEO, đội nhóm sợ không nói thật' },
    courses: ['lcm', 'exec'],
    timeline: [
      { icon: '📞', action: 'Tư vấn lần 2 — objection giá', date: '04/04/2026 14:20', who: 'Linh Nguyễn', note: 'Nói 70M nhiều. Giải thích community + 1-on-1 NhiLe. "Sẽ suy nghĩ". → Dùng góc ROI lần sau.' },
      { icon: '📞', action: 'Tư vấn lần 1', date: '01/04/2026 10:00', who: 'Linh Nguyễn', note: '45 phút. Nhiệt tình. Quan tâm leadership mindset.' },
    ], notes: [{ text: 'Đừng dùng góc "cảm xúc" với anh này — anh là CEO phân tích ROI. Lần sau mở bằng: "Anh muốn đội nhóm nói thật với anh không?"', date: '04/04/2026', who: 'Linh Nguyễn' }], done: false },

  { id: 5, priority: 'today', action: 'CHỐT DEAL', name: 'Đặng Thị Thu',
    badge: '💳 Chờ chuyển khoản', badgeColor: 'green',
    desc: 'Lương về ngày 15. Nhắn hỏi thăm nhẹ.',
    stage: 4, phone: '0977 543 210', email: 'thu.dang@gmail.com',
    sourceType: 'inbound', sourceCh: 'nedu.vn/test', color: '#8B5CF6', days: 11,
    testScore: 77, testDesc: 'Burnout nặng sau 5 năm.',
    note: 'Chị đã quyết định. Chờ lương.',
    profile: { dob: '07/11/1992', birthTime: '08:15', job: 'Quản lý Marketing', goal: 'Thoát kiệt sức', pain: 'Mất niềm vui sống' },
    courses: ['lcm'],
    timeline: [
      { icon: '💬', action: 'Confirm ngày thanh toán', date: '06/04/2026 08:00', who: 'Linh Nguyễn', note: 'Lương về 15/4, chuyển liền.' },
      { icon: '📞', action: 'Call chốt', date: '04/04/2026 19:30', who: 'Linh Nguyễn', note: '45 phút. Rất quyết tâm.' },
    ], notes: [{ text: 'Chị ĐÃ quyết định — KHÔNG tư vấn thêm. Chỉ nhắn hỏi thăm nhẹ nhàng, tránh tạo áp lực. Đợi 15/4.', date: '04/04/2026', who: 'Linh Nguyễn' }], done: false },
]

export const PROFILE_CARDS_INIT: Record<number, ProfileCard> = {
  4: {
    gen: true, dm: 'Giáp Mộc 甲', lp: '6', nk: 'Sao 1 Thủy', sun: 'Xử Nữ', menh: 'Mộc Tam Cục', gua: '7',
    q: '"Cây đại thụ tìm gốc rễ — thành công bên ngoài, trống rỗng bên trong."',
    core: 'Giáp Mộc nhật chủ — lãnh đạo bẩm sinh, thẳng thắn. Cần được tôn trọng. Bên ngoài mạnh nhưng thiếu kết nối chiều sâu.',
    talk: [
      { y: true,  t: '<strong>Nói thẳng, không vòng vo.</strong> Dùng "kết quả", "ROI", "hệ thống".' },
      { y: true,  t: '<strong>Tôn trọng trí tuệ.</strong> Không giải thích quá kỹ.' },
      { y: false, t: '<strong>Tránh:</strong> "cảm xúc", "chữa lành". Thay bằng "kết nối nội tâm", "lãnh đạo minh mẫn".' },
    ],
    need: 'CEO thành đạt nhưng cô đơn trong vai trò. Đội nhóm sợ, gia đình xa cách. Muốn tìm ý nghĩa thật sự.',
    timing: '2026: Sao 1 vào Trung Cung — năm bước ngoặt nội tâm lớn nhất 9 năm qua.',
    opening: '"Anh Nam, anh không cần thêm kiến thức kinh doanh. Điều anh đang tìm là đội nhóm thật sự tin anh, và gia đình cảm nhận được anh đang hiện diện với họ."',
  },
  6: {
    gen: true, dm: 'Đinh Hỏa 丁', lp: '9', nk: 'Sao 3 Chấn', sun: 'Sư Tử', menh: 'Hỏa Lục Cục', gua: '2',
    q: '"Ngọn nến đã cháy lại — lần này chính mình thắp."',
    core: 'Đinh Hỏa — ngọn nến ấm, sâu. Năm 2022 Thủy vượng (cảm xúc lấn át). 2026 Sao 3 Chấn — Mộc sinh Hỏa — lần đầu thật sự sẵn sàng từ bên trong.',
    talk: [
      { y: true,  t: '<strong>Thừa nhận quá khứ:</strong> "Em biết anh đã tìm hiểu từ trước..."' },
      { y: true,  t: '<strong>Nhấn mạnh sự thay đổi thời điểm.</strong> "Năm 2022 khác. Năm nay khác."' },
      { y: false, t: '<strong>Tránh:</strong> Ép quyết định nhanh. Anh đã chờ 3 năm — không phải quyết định bốc đồng.' },
    ],
    need: 'Sợ gia đình không ủng hộ (2022). 3 năm qua có gì đó thay đổi. Lần này tự mình tìm kiếm.',
    timing: '2026: Personal Year 9 — kết thúc chu kỳ 9 năm. Năm "dứt điểm những gì chưa hoàn thành".',
    opening: '"Anh Phúc, em thấy anh đã tìm hiểu từ 2022. Em tò mò — điều gì đã khiến anh quay lại đúng thời điểm này?"',
  },
}
