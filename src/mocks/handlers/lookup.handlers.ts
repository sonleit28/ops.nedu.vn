import { http, HttpResponse } from 'msw';
import {
  MOCK_SOURCES, MOCK_PROGRAMS, MOCK_PAYMENT_METHODS,
  MOCK_REGRESSION_REASONS, MOCK_STAGE_GUIDES
} from '../../constants/mock-data';

const BASE = '/api';

export const lookupHandlers = [
  http.get(`${BASE}/lookup/sources`, () => {
    return HttpResponse.json({ data: MOCK_SOURCES });
  }),
  http.get(`${BASE}/lookup/programs`, () => {
    return HttpResponse.json({ data: MOCK_PROGRAMS });
  }),
  http.get(`${BASE}/lookup/payment-methods`, () => {
    return HttpResponse.json({ data: MOCK_PAYMENT_METHODS });
  }),
  http.get(`${BASE}/lookup/regression-reasons`, () => {
    return HttpResponse.json({ data: MOCK_REGRESSION_REASONS });
  }),
  http.get(`${BASE}/lookup/stage-guides`, () => {
    return HttpResponse.json({ data: MOCK_STAGE_GUIDES });
  }),
  http.get(`${BASE}/lookup/stage-guides/:stage`, ({ params }) => {
    const guide = MOCK_STAGE_GUIDES.find(g => g.stage === params.stage);
    if (!guide) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Stage guide not found', request_id: 'req-mock' }, { status: 404 });
    }
    return HttpResponse.json({ data: guide });
  }),
];
