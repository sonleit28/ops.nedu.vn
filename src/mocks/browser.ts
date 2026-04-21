// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { authHandlers }            from './handlers/auth'
import { leadsHandlers }           from './handlers/leads'
import { pipelineActionHandlers }  from './handlers/pipeline-actions'
import { leadNotesHandlers }       from './handlers/lead-notes'
import { enrollmentHandlers }      from './handlers/enrollments'
import { transferHandlers }        from './handlers/transfers'
import { coDealHandlers }          from './handlers/co-deals'
import { personalProfileHandlers } from './handlers/personal-profiles'
import { kpiHandlers }             from './handlers/kpi'
import { dashboardHandlers }       from './handlers/dashboard'

export const worker = setupWorker(
  ...authHandlers,
  ...leadsHandlers,
  ...pipelineActionHandlers,
  ...leadNotesHandlers,
  ...enrollmentHandlers,
  ...transferHandlers,
  ...coDealHandlers,
  ...personalProfileHandlers,
  ...kpiHandlers,
  ...dashboardHandlers,
)
