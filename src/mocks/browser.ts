import { setupWorker } from 'msw/browser';
import { leadsHandlers } from './handlers/leads.handlers';
import { pipelineHandlers } from './handlers/pipeline.handlers';
import { personalProfileHandlers } from './handlers/personal-profile.handlers';
import { enrollmentHandlers } from './handlers/enrollment.handlers';
import { codealHandlers } from './handlers/codeal.handlers';
import { kpiHandlers } from './handlers/kpi.handlers';
import { lookupHandlers } from './handlers/lookup.handlers';

export const worker = setupWorker(
  ...leadsHandlers,
  ...pipelineHandlers,
  ...personalProfileHandlers,
  ...enrollmentHandlers,
  ...codealHandlers,
  ...kpiHandlers,
  ...lookupHandlers,
);
