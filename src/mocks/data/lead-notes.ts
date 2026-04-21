// src/mocks/data/lead-notes.ts
import type { LeadNote } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'
import { MOCK_LEADS } from './leads'

export const MOCK_LEAD_NOTES: LeadNote[] = [
  {
    id: 'note-0001-aaaa-000000000001',
    lead_id: MOCK_LEADS[0].id, person_id: MOCK_PERSONS[2].id, author_full_name: MOCK_PERSONS[2].full_name,
    content: 'Khách muốn tư vấn thêm về lịch học cuối tuần.',
    created_at: '2026-04-17T10:00:00.000Z', updated_at: '2026-04-17T10:00:00.000Z',
  },
  {
    id: 'note-0002-bbbb-000000000001',
    lead_id: MOCK_LEADS[1].id, person_id: MOCK_PERSONS[2].id, author_full_name: MOCK_PERSONS[2].full_name,
    content: 'OK',
    created_at: '2026-04-18T08:00:00.000Z', updated_at: '2026-04-18T08:00:00.000Z',
  },
  {
    id: 'note-0003-cccc-000000000001',
    lead_id: MOCK_LEADS[2].id, person_id: MOCK_PERSONS[1].id, author_full_name: MOCK_PERSONS[1].full_name,
    content: 'Leader: case phức tạp, monitor kỹ.',
    created_at: '2026-04-18T11:00:00.000Z', updated_at: '2026-04-18T11:00:00.000Z',
  },
]
