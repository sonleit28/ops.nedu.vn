// src/mocks/data/pipeline-actions.ts
import type { PipelineAction } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'
import { MOCK_LEADS } from './leads'

export const MOCK_PIPELINE_ACTIONS: PipelineAction[] = [
  {
    id: 'action-0001-aaaa-000000000001',
    lead_id: MOCK_LEADS[0].id, action_type: 'stage_advanced',
    performed_by_person_id: MOCK_PERSONS[2].id, performed_by_full_name: MOCK_PERSONS[2].full_name,
    stage_from: 'awareness', stage_to: 'interest',
    created_at: '2026-04-17T08:00:00.000Z',
  },
  {
    id: 'action-0002-aaaa-000000000002',
    lead_id: MOCK_LEADS[0].id, action_type: 'note_added',
    performed_by_person_id: MOCK_PERSONS[2].id, performed_by_full_name: MOCK_PERSONS[2].full_name,
    note_content: 'Khách quan tâm khóa Là Chính Mình, hỏi thêm lịch học.',
    created_at: '2026-04-17T09:15:00.000Z',
  },
  {
    id: 'action-0003-cccc-000000000001',
    lead_id: MOCK_LEADS[2].id, action_type: 'note_added',
    performed_by_person_id: MOCK_PERSONS[1].id, performed_by_full_name: MOCK_PERSONS[1].full_name,
    note_content: 'Leader review: cần escalate nếu không chốt trong tuần này.',
    created_at: '2026-04-18T11:00:00.000Z',
  },
  {
    id: 'action-0004-cccc-000000000002',
    lead_id: MOCK_LEADS[2].id, action_type: 'stage_regressed',
    performed_by_person_id: MOCK_PERSONS[2].id, performed_by_full_name: MOCK_PERSONS[2].full_name,
    stage_from: 'intent', stage_to: 'consideration',
    regression_reason: 'Chưa sẵn sàng tài chính',
    created_at: '2022-11-03T08:00:00.000Z',
  },
]
