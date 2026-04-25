// src/mocks/handlers/enrollments.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS } from '../data/leads'
import { MOCK_ENROLLMENTS } from '../data/enrollments'
import type { Enrollment } from '@modules/ops/types'

export const enrollmentHandlers = [
  http.post('*/api/ops/leads/:id/enrollments', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const leadIdx = MOCK_LEADS.findIndex(l => l.id === params.id)
    if (leadIdx < 0) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && MOCK_LEADS[leadIdx].assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')

    if (!MOCK_LEADS[leadIdx].email) {
      return HttpResponse.json(
        { statusCode: 422, message: 'Lead chưa có email — cập nhật email trước khi Enrolled để gửi link kích hoạt', error: 'Unprocessable Entity', code: 'LEAD_EMAIL_REQUIRED_FOR_ENROLLMENT', details: { lead_id: MOCK_LEADS[leadIdx].id } },
        { status: 422 },
      )
    }

    if (MOCK_ENROLLMENTS.some(e => e.lead_id === params.id)) {
      return HttpResponse.json(
        { statusCode: 409, message: 'Lead đã enrolled', error: 'Conflict', code: 'LEAD_ALREADY_ENROLLED' },
        { status: 409 },
      )
    }

    const body = await request.json() as { program_slug: string; payment_amount: number; payment_method: string; transaction_ref?: string }
    const errors: string[] = []
    if (!body.program_slug) errors.push('program_slug should not be empty')
    if (!body.payment_amount || body.payment_amount <= 0) errors.push('payment_amount must be positive')
    if (!body.payment_method) errors.push('payment_method should not be empty')
    if (errors.length) return HttpResponse.json({ statusCode: 400, message: errors, error: 'Bad Request' }, { status: 400 })

    const now = new Date().toISOString()
    const enrollment: Enrollment = {
      id: crypto.randomUUID(), lead_id: MOCK_LEADS[leadIdx].id,
      program_id: crypto.randomUUID(), program_slug: body.program_slug as Enrollment['program_slug'],
      enrolled_by_person_id: personId, payment_amount: body.payment_amount,
      payment_method: body.payment_method as Enrollment['payment_method'],
      transaction_ref: body.transaction_ref,
      student_account_created: true, activation_email_sent: true,
      enrolled_at: now, created_at: now,
    }
    MOCK_ENROLLMENTS.push(enrollment)
    MOCK_LEADS[leadIdx] = { ...MOCK_LEADS[leadIdx], stage: 'enrolled', updated_at: now }

    // Disabled: enrollment.program_slug = legacy enum, interested_courses = course.code mới.
    // Không cùng namespace → so sánh không có nghĩa. Sẽ bật lại khi enrollments migrate.
    return HttpResponse.json(
      { data: { enrollment, lead: MOCK_LEADS[leadIdx] } },
      { status: 201 },
    )
  }),
]
