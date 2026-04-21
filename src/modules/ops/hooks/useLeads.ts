import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type {
  Lead,
  LeadNote,
  PipelineAction,
  PipelineStage,
  DashboardSummary,
  Enrollment,
  CoDeal,
  PersonalProfile,
  KpiData,
  ProgramSlug,
  PaymentMethod,
} from '@modules/ops/types'

// ─── Queries ──────────────────────────────────────────

interface LeadsQuery {
  page?: number
  limit?: number
  stage?: PipelineStage
  sla_breached?: boolean
  consultant_id?: string
}

function buildQuery(params?: LeadsQuery): string {
  if (!params) return ''
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.stage) search.set('stage', params.stage)
  if (params.sla_breached) search.set('sla_breached', 'true')
  if (params.consultant_id) search.set('consultant_id', params.consultant_id)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export function useLeads(params?: LeadsQuery) {
  return useQuery({
    queryKey: ['ops', 'leads', params ?? {}],
    queryFn: async () => (await api.get<Lead[]>(`/ops/leads${buildQuery(params)}`)) ?? [],
  })
}

export function useDashboardMe() {
  return useQuery({
    queryKey: ['ops', 'dashboard', 'me'],
    queryFn: async () => (await api.get<DashboardSummary>('/ops/dashboard/me')) ?? null,
  })
}

export function useLeadNotes(leadId: string | null) {
  return useQuery({
    enabled: !!leadId,
    queryKey: ['ops', 'leads', leadId, 'notes'],
    queryFn: async () => (await api.get<LeadNote[]>(`/ops/leads/${leadId}/notes`)) ?? [],
  })
}

export function useLeadActions(leadId: string | null) {
  return useQuery({
    enabled: !!leadId,
    queryKey: ['ops', 'leads', leadId, 'actions'],
    queryFn: async () => (await api.get<PipelineAction[]>(`/ops/leads/${leadId}/actions`)) ?? [],
  })
}

export function usePersonalProfile(leadId: string | null) {
  return useQuery({
    enabled: !!leadId,
    queryKey: ['ops', 'leads', leadId, 'personal-profile'],
    retry: false,
    queryFn: async () => {
      try {
        return (await api.get<PersonalProfile>(`/ops/leads/${leadId}/personal-profile`)) ?? null
      } catch {
        return null
      }
    },
  })
}

export function useKpi() {
  return useQuery({
    queryKey: ['ops', 'kpi'],
    queryFn: async () => (await api.get<KpiData>('/ops/kpi')) ?? null,
    retry: false,
  })
}

// ─── Mutations ────────────────────────────────────────

export function useAdvanceStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, direction, regression_reason }: { leadId: string; direction: 'forward' | 'back'; regression_reason?: string }) => {
      return await api.patch<Lead>(`/ops/leads/${leadId}/stage`, { direction, regression_reason })
    },
    onSuccess: (updatedLead, vars) => {
      // Patch lead trong cache tr\u1ef1c ti\u1ebfp \u0111\u1ec3 tr\u00e1nh race condition v\u1edbi optimistic UI.
      if (updatedLead) {
        qc.setQueriesData<Lead[] | undefined>({ queryKey: ['ops', 'leads'] }, (old) => {
          if (!Array.isArray(old)) return old
          return old.map(l => l.id === vars.leadId ? updatedLead : l)
        })
      }
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
      qc.invalidateQueries({ queryKey: ['ops', 'dashboard', 'me'] })
    },
  })
}

export function useUpdateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, patch }: { leadId: string; patch: Partial<Lead> }) => {
      return await api.patch<Lead>(`/ops/leads/${leadId}`, patch)
    },
    onSuccess: (updatedLead, vars) => {
      if (updatedLead) {
        qc.setQueriesData<Lead[] | undefined>({ queryKey: ['ops', 'leads'] }, (old) => {
          if (!Array.isArray(old)) return old
          return old.map(l => l.id === vars.leadId ? updatedLead : l)
        })
      }
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
    },
  })
}

export function useCreateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, program_slug, payment_amount, payment_method, transaction_ref }: {
      leadId: string
      program_slug: ProgramSlug
      payment_amount: number
      payment_method: PaymentMethod
      transaction_ref?: string
    }) => {
      return await api.post<{ enrollment: Enrollment; lead: Lead }>(`/ops/leads/${leadId}/enrollments`, {
        program_slug, payment_amount, payment_method, transaction_ref,
      })
    },
    onSuccess: (result, vars) => {
      if (result?.lead) {
        qc.setQueriesData<Lead[] | undefined>({ queryKey: ['ops', 'leads'] }, (old) => {
          if (!Array.isArray(old)) return old
          return old.map(l => l.id === vars.leadId ? result.lead : l)
        })
      }
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
      qc.invalidateQueries({ queryKey: ['ops', 'dashboard', 'me'] })
    },
  })
}

export function useCreateCoDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, co_dealer_user_id, initiator_ratio, co_dealer_ratio, note }: {
      leadId: string
      co_dealer_user_id: string
      initiator_ratio: number
      co_dealer_ratio: number
      note?: string
    }) => {
      return await api.post<CoDeal>(`/ops/leads/${leadId}/co-deals`, {
        co_dealer_user_id, initiator_ratio, co_dealer_ratio, note,
      })
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads'] })
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
    },
  })
}

export function useTransferLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, to_user_id, reason }: { leadId: string; to_user_id: string; reason: string }) => {
      return await api.post<Lead>(`/ops/leads/${leadId}/transfers`, { to_user_id, reason })
    },
    onSuccess: (updatedLead, vars) => {
      if (updatedLead) {
        qc.setQueriesData<Lead[] | undefined>({ queryKey: ['ops', 'leads'] }, (old) => {
          if (!Array.isArray(old)) return old
          return old.map(l => l.id === vars.leadId ? updatedLead : l)
        })
      }
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, content }: { leadId: string; content: string }) => {
      return await api.post<LeadNote>(`/ops/leads/${leadId}/notes`, { content })
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'notes'] })
    },
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, noteId, content }: { leadId: string; noteId: string; content: string }) => {
      return await api.patch<LeadNote>(`/ops/leads/${leadId}/notes/${noteId}`, { content })
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'notes'] })
    },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId, noteId }: { leadId: string; noteId: string }) => {
      await api.delete(`/ops/leads/${leadId}/notes/${noteId}`)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'notes'] })
    },
  })
}

export function useGeneratePersonalProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ leadId }: { leadId: string }) => {
      return await api.post<PersonalProfile>(`/ops/leads/${leadId}/personal-profile`)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'personal-profile'] })
    },
  })
}
