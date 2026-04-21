// src/mocks/data/persons.ts
import type { Role } from '@shared/types/auth'

export interface MockPerson {
  id: string; email: string; full_name: string; avatar_url?: string
  roles: Role[]; primary_role: Role
}

export const MOCK_PERSONS: MockPerson[] = [
  {
    id: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
    email: 'owner-01@nedu-ops.vn', full_name: 'Owner 01',
    roles: ['owner'] as Role[], primary_role: 'owner' as Role,
  },
  {
    id: 'b2c3d4e5-f6a7-4901-bcde-f23456789012',
    email: 'leader-01@nedu-ops.vn', full_name: 'Leader 01',
    roles: ['leader'] as Role[], primary_role: 'leader' as Role,
  },
  {
    id: 'c3d4e5f6-a7b8-4012-9def-345678901234',
    email: 'consultant-01@nedu-ops.vn', full_name: 'Consultant 01',
    roles: ['consultant'] as Role[], primary_role: 'consultant' as Role,
  },
  {
    id: 'd4e5f6a7-b8c9-4123-8efa-456789012345',
    email: 'consultant-02@nedu-ops.vn', full_name: 'Consultant 02',
    roles: ['consultant'] as Role[], primary_role: 'consultant' as Role,
  },
  {
    id: 'e5f6a7b8-c9d0-4234-bfab-567890123456',
    email: 'admin-01@nedu-ops.vn', full_name: 'Admin 01',
    roles: ['admin'] as Role[], primary_role: 'admin' as Role,
  },
]
