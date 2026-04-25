// Event catalog — typed.
//
// Mỗi event có schema cố định. Khi thêm event mới: thêm key vào `EventMap`,
// sau đó dùng `analytics.track('name', { ...params })` ở consumer.
//
// Quy tắc params:
// - KHÔNG truyền PII (email, full_name, phone, payment info). Chỉ truyền ID.
// - Tên event: snake_case, dạng `domain_action[_result]`.

export interface EventMap {
  // placeholder — phase 1 chưa định nghĩa event domain.
  // Ví dụ sẽ thêm dần:
  // enrollment_confirm_clicked: { student_id: string; course_id: string }
  // enrollment_confirm_succeeded: { student_id: string; course_id: string }
  // enrollment_confirm_failed: { student_id: string; course_id: string; reason: string }
}

export type EventName = keyof EventMap
