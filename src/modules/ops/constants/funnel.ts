// Funnel & stage UI labels — render trong sidebar funnel + stage navigator.

export const S_NAMES = [
  'Biết đến',
  'Quan tâm',
  'Cân nhắc',
  'Muốn mua',
  'Đã đăng ký',
  'Giữ chân',
]

export const S_ICONS = ['👁', '💡', '🤔', '🔥', '✅', '🎓']

export const FUNNEL_LAYERS = [
  { id: 'attract', short: 'Thu hút',    label: 'Thu hút khách',    color: '#6B7280', stages: [] as number[] },
  { id: 'convert', short: 'Chuyển đổi', label: 'Chuyển đổi khách', color: '#3B82F6', stages: [] as number[] },
  { id: 'nurture', short: 'Nuôi dưỡng', label: 'Nuôi dưỡng lead',  color: '#8B5CF6', stages: [1, 2, 3] },
  { id: 'close',   short: 'Chốt deal',  label: 'Chốt khách hàng',  color: '#F59E0B', stages: [4, 5] },
  { id: 'delight', short: 'Chăm sóc',   label: 'Chăm sóc khách',   color: '#059669', stages: [6] },
]

export const NEXT_LABELS: Record<number, string> = {
  1: 'Đã liên hệ → Quan tâm',
  2: 'Đang quan tâm → Cân nhắc',
  3: 'Gần quyết định → Muốn mua',
  4: '✅ Đã đăng ký',
  5: '→ Giữ chân',
}

export const BACK_REASONS = [
  { icon: '🤔', label: 'Cần tư vấn thêm — chưa đủ thông tin' },
  { icon: '💰', label: 'Chưa sẵn sàng tài chính' },
  { icon: '⏳', label: 'Khách cần thêm thời gian suy nghĩ' },
  { icon: '📵', label: 'Mất liên lạc tạm thời' },
  { icon: '❌', label: 'Khách đổi ý hoặc không quan tâm nữa' },
  { icon: '📝', label: 'Lý do khác (ghi chú bên dưới)' },
]

// Sales playbook script + steps cho mỗi stage 1-6. Hiển thị trong CallScreen.
export const GUIDES: Record<
  number,
  { eyebrow: string; color: string; title: string; script: string; steps: string[] }
> = {
  1: {
    eyebrow: 'LIÊN HỆ LẦN ĐẦU', color: '#EF4444', title: 'Gọi điện — đọc hồ sơ trước',
    script: '"Dạ em là <strong>Linh</strong> từ Nedu ạ. Anh/chị có tiện nghe không ạ?"',
    steps: [
      'Bấm "📞 Gọi & xem hồ sơ" để đọc thông tin',
      'Giới thiệu bản thân + mục đích (30 giây)',
      'Hỏi về vấn đề, chưa chào hàng',
      'Ghi chú trong cuộc gọi',
      'Đặt lịch call tiếp',
    ],
  },
  2: {
    eyebrow: 'NUÔI DƯỠNG', color: '#3B82F6', title: 'Follow up cá nhân hóa',
    script: '"Em chia sẻ thêm nội dung liên quan điều anh/chị đề cập hôm trước..."',
    steps: [
      'Ôn lại note lần trước',
      'Gửi nội dung phù hợp',
      'Hỏi sâu về nhu cầu',
      'Share câu chuyện học viên tương tự',
      'Đề xuất tư vấn 30 phút',
    ],
  },
  3: {
    eyebrow: 'TƯ VẤN SÂU', color: '#8B5CF6', title: 'Giải quyết băn khoăn cuối',
    script: '"Điều gì đang khiến anh/chị chưa quyết định? Em muốn giúp có đủ thông tin."',
    steps: [
      'Xác định băn khoăn chính',
      'Chia sẻ phản hồi học viên phù hợp',
      'Giải thích lợi ích đầu tư',
      'Mời tham dự buổi học thử',
      'Đặt mốc thời gian quyết định',
    ],
  },
  4: {
    eyebrow: 'SẮP CHỐT', color: '#D97706', title: 'Xác nhận và chốt deal',
    script: '"Anh/chị đã sẵn sàng chưa? Em giữ chỗ nha."',
    steps: [
      'Tóm tắt những gì đã đồng ý',
      'Xác nhận thông tin thanh toán',
      'Gửi số tài khoản',
      'Hẹn thời điểm chuyển khoản',
      'Đánh dấu đã chốt ngay khi nhận tiền',
    ],
  },
  5: {
    eyebrow: 'SAU BÁN HÀNG', color: '#059669', title: 'Theo dõi trải nghiệm học',
    script: '"Chào anh/chị, em muốn hỏi thăm trải nghiệm tuần đầu. Có gì cần hỗ trợ không ạ?"',
    steps: [
      'Hỏi thăm sau 3 ngày đầu',
      'Hỏi về trải nghiệm học phần đầu tiên',
      'Xem họ có kết nối với cộng đồng không',
      'Mời tham gia hoạt động nhóm',
      'Xin phản hồi nếu họ hài lòng',
    ],
  },
  6: {
    eyebrow: 'CỰU HỌC VIÊN', color: '#06B6D4', title: 'Kết nối vào mạng cựu học viên',
    script: '"Chúc mừng anh/chị hoàn thành khóa học! Em muốn mời tham gia cộng đồng alumni."',
    steps: [
      'Gửi link alumni.nedu.vn',
      'Giới thiệu các hoạt động cộng đồng',
      'Hỏi về giới thiệu — ai trong gia đình/bạn bè cần',
      'Ghi nhận phản hồi',
      'Theo dõi dài hạn',
    ],
  },
}
