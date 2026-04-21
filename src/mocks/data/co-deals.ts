// src/mocks/data/co-deals.ts
import type { CoDeal } from '@modules/ops/types'
import { MOCK_PERSONS } from './persons'
import { MOCK_LEADS } from './leads'

export const MOCK_CO_DEALS: CoDeal[] = [
  {
    id: 'codeal-0001-cccc-0001',
    lead_id: MOCK_LEADS[2].id,
    initiator_person_id: MOCK_PERSONS[2].id,
    co_dealer_person_id: MOCK_PERSONS[3].id,
    initiator_ratio: 70, co_dealer_ratio: 30,
    note: 'Khách quen của Consultant 02.',
    created_at: '2026-04-17T14:00:00.000Z',
  },
]
