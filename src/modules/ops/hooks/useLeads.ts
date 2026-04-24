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
  KpiTeamData,
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
    queryFn: () => api.get<Lead[]>(`/ops/leads${buildQuery(params)}`),
  })
}

export function useDashboardMe() {
  return useQuery({
    queryKey: ['ops', 'dashboard', 'me'],
    queryFn: () => api.get<DashboardSummary>('/ops/dashboard/me'),
  })
}

export function useLeadNotes(leadId: string | null) {
  return useQuery({
    enabled: !!leadId,
    queryKey: ['ops', 'leads', leadId, 'notes'],
    queryFn: () => api.get<LeadNote[]>(`/ops/leads/${leadId}/notes`),
  })
}

export function useLeadActions(leadId: string | null) {
  return useQuery({
    enabled: !!leadId,
    queryKey: ['ops', 'leads', leadId, 'actions'],
    queryFn: () => api.get<PipelineAction[]>(`/ops/leads/${leadId}/actions`),
  })
}

export function usePersonalProfile(leadId: string | null) {
  return useQuery({
    enabled: !!leadId,
    queryKey: ['ops', 'leads', leadId, 'personal-profile'],
    retry: false,
    queryFn: () => api.get<PersonalProfile>(`/ops/leads/${leadId}/personal-profile`),
  })
}

export function useKpi() {
  return useQuery({
    queryKey: ['ops', 'kpi'],
    queryFn: () => api.get<KpiData>('/ops/kpi'),
    retry: false,
  })
}

// E-08 — Team leaderboard. month=YYYY-MM (default: tháng hiện tại trên BE).
export function useKpiTeam(month?: string, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['ops', 'kpi', 'team', month ?? 'current'],
    queryFn: () =>
      api.get<KpiTeamData>(`/ops/kpi/team${month ? `?month=${month}` : ''}`),
    retry: false,
    staleTime: 60_000,
  })
}

// ─── Mutations ────────────────────────────────────────

export function useAdvanceStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, direction, regression_reason }: { leadId: string; direction: 'forward' | 'back'; regression_reason?: string }) =>
      api.patch<Lead>(`/ops/leads/${leadId}/stage`, { direction, regression_reason }),
    onSuccess: (updatedLead, vars) => {
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
    mutationFn: ({ leadId, patch }: { leadId: string; patch: Partial<Lead> }) =>
      api.patch<Lead>(`/ops/leads/${leadId}`, patch),
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
    mutationFn: ({ leadId, program_slug, payment_amount, payment_method, transaction_ref }: {
      leadId: string
      program_slug: ProgramSlug
      payment_amount: number
      payment_method: PaymentMethod
      transaction_ref?: string
    }) =>
      api.post<{ enrollment: Enrollment; lead: Lead }>(`/ops/leads/${leadId}/enrollments`, {
        program_slug, payment_amount, payment_method, transaction_ref,
      }),
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
    mutationFn: ({ leadId, co_dealer_user_id, initiator_ratio, co_dealer_ratio, note }: {
      leadId: string
      co_dealer_user_id: string
      initiator_ratio: number
      co_dealer_ratio: number
      note?: string
    }) =>
      api.post<CoDeal>(`/ops/leads/${leadId}/co-deals`, {
        co_dealer_user_id, initiator_ratio, co_dealer_ratio, note,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads'] })
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
    },
  })
}

export function useTransferLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, to_user_id, reason }: { leadId: string; to_user_id: string; reason: string }) =>
      api.post<Lead>(`/ops/leads/${leadId}/transfers`, { to_user_id, reason }),
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
    mutationFn: ({ leadId, content }: { leadId: string; content: string }) =>
      api.post<LeadNote>(`/ops/leads/${leadId}/notes`, { content }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'notes'] })
    },
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, noteId, content }: { leadId: string; noteId: string; content: string }) =>
      api.patch<LeadNote>(`/ops/leads/${leadId}/notes/${noteId}`, { content }),
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
    // `force=true` khi consultant bấm "↻ Cập nhật Profile" trên banner dirty —
    // ép vault regenerate master + facet kể cả khi birth data không đổi
    // (để narrative bắt các field mới như job/goal/name).
    mutationFn: ({ leadId, force }: { leadId: string; force?: boolean }) =>
      api.post<PersonalProfile>(
        `/ops/leads/${leadId}/personal-profile`,
        force ? { force: true } : undefined,
      ),
    onSuccess: (profile, vars) => {
      qc.setQueryData(['ops', 'leads', vars.leadId, 'personal-profile'], profile)
      qc.invalidateQueries({ queryKey: ['ops', 'leads', vars.leadId, 'actions'] })
    },
  })
}
