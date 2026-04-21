export type Role = 'consultant' | 'leader' | 'admin' | 'owner'

export interface AuthUser {
  person_id: string
  email: string
  full_name: string
  avatar_url?: string
  dob?: string
  roles: Role[]
  primary_role: Role
}
