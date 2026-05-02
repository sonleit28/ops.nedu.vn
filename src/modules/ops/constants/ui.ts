// Profile form fields — render trong CallScreen tab "Hồ sơ".
export const PF_FIELDS = [
  { key: 'dob',       label: 'Ngày sinh',     icon: '🎂', ph: 'VD: 15/08/1990' },
  { key: 'birthTime', label: 'Giờ sinh',      icon: '🕐', ph: 'VD: 14:30' },
  { key: 'job',       label: 'Nghề nghiệp',   icon: '💼', ph: 'VD: Kế toán, Giám đốc...' },
  { key: 'goal',      label: 'Mục tiêu',      icon: '🎯', ph: 'VD: Cân bằng cuộc sống...' },
  { key: 'pain',      label: 'Vấn đề chính',  icon: '💬', ph: 'VD: Stress công việc...' },
]

// Palette dùng cho avatar trong Team KPI leaderboard. Map deterministic theo
// hash của user_id để mỗi member có 1 màu cố định qua các lần render.
export const TEAM_AVATAR_PALETTE = [
  '#3B82F6', '#EC4899', '#059669', '#F59E0B',
  '#D97706', '#7C3AED', '#0EA5E9', '#EF4444',
]
