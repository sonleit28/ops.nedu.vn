import type { ProgramSlug, PaymentMethod } from '@modules/ops/types'

// Course catalog hiển thị trong CallScreen + enrollment dropdown.
// TODO post-golive: BE đã có endpoint GET /api/public/courses
// (xem nedu-backend/.../public-courses.controller.ts). FE nên migrate
// consume endpoint này thay vì hardcode — đảm bảo không drift khi BE
// add/edit/archive course.
export const COURSES = [
  { id: 'lcm',   name: 'Là Chính Mình',       emoji: '🌱', desc: 'Tâm lý · tự nhận thức' },
  { id: 'adult', name: 'Học Tập Người Lớn',   emoji: '📚', desc: 'Phát triển bản thân' },
  { id: 'exec',  name: 'Lộ Trình Điều Hành',  emoji: '🎯', desc: 'Lãnh đạo · doanh nhân' },
  { id: 'short', name: 'Khóa Ngắn Hạn',       emoji: '⚡', desc: 'Ngắn hạn · online' },
  { id: 'corp',  name: 'Doanh Nghiệp',        emoji: '🏢', desc: 'Doanh nghiệp' },
]

// FE course key → BE course.code (cho leads.interested_courses[]).
// Ngược chiều của COURSE_CODE_TO_UI bên dưới.
export const UI_COURSE_TO_CODE: Record<string, string> = {
  lcm: 'LCM',
  adult: 'TKBT',
  meta: 'META',
  exec: 'COACHING',
  short: 'WS-JOURNAL',
  corp: 'CORPORATE',
}

// Map course.code (BE) → FE course key dùng cho UI badge.
// Source: courses table seed (xem nedu-backend/src/db/migrations/0008_courses_catalog.sql).
export const COURSE_CODE_TO_UI: Record<string, string> = {
  LCM: 'lcm',
  TKBT: 'adult',
  META: 'meta',
  COACHING: 'exec',
  'WS-JOURNAL': 'short',
  CORPORATE: 'corp',
}

// Legacy mapping cho enrollment (program_slug enum cũ — chưa migrate).
export const COURSE_TO_PROGRAM: Record<string, ProgramSlug> = {
  lcm: 'la-chinh-minh',
  adult: 'adult-learning',
  exec: 'executive',
  short: 'short-course',
  corp: 'corporate',
}

// UI payment method key → BE PaymentMethod enum.
export const PAY_METHOD_MAP: Record<string, PaymentMethod> = {
  transfer: 'bank_transfer',
  card: 'credit_card',
  momo: 'e_wallet',
  wallet: 'e_wallet',
}
