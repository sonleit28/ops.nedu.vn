// src/mocks/data/enrollments.ts
import type { Enrollment } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'
import { MOCK_LEADS } from './leads'

export const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enrollment-0001-bbbb-0001',
    lead_id: MOCK_LEADS[1].id, program_id: 'program-adult-learning-uuid-001',
    program_slug: 'adult-learning', enrolled_by_person_id: MOCK_PERSONS[2].id,
    payment_amount: 70_000_000, payment_method: 'bank_transfer',
    transaction_ref: 'TXN-2026-04-18-001',
    student_account_created: true, activation_email_sent: true,
    enrolled_at: '2026-04-18T11:00:00.000Z', created_at: '2026-04-18T11:00:00.000Z',
  },
  {
    id: 'enrollment-0002-cccc-0001',
    lead_id: MOCK_LEADS[2].id, program_id: 'program-la-chinh-minh-uuid-001',
    program_slug: 'la-chinh-minh', enrolled_by_person_id: MOCK_PERSONS[2].id,
    payment_amount: 70_000_000, payment_method: 'e_wallet',
    student_account_created: true, activation_email_sent: false,
    enrolled_at: '2026-04-18T12:00:00.000Z', created_at: '2026-04-18T12:00:00.000Z',
  },
]
