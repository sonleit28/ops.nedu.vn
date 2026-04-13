import { http, HttpResponse } from 'msw';
import { MOCK_LEADS, MOCK_PROGRAMS, MOCK_PAYMENT_METHODS, MOCK_CONSULTANTS } from '../../constants/mock-data';
import type { Enrollment } from '../../shared/types';

const BASE = '/api';

export const enrollmentHandlers = [
  http.post(`${BASE}/leads/:id/enroll`, async ({ params, request }) => {
    const body = await request.json() as {
      program_id: string;
      amount_paid: number;
      currency: string;
      payment_method_code: string;
      transaction_ref: string | null;
    };

    const lead = MOCK_LEADS.find(l => l.id === params.id);
    if (!lead) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Lead not found', request_id: 'req-mock' }, { status: 404 });
    }

    const program = MOCK_PROGRAMS.find(p => p.id === body.program_id) || MOCK_PROGRAMS[0];
    const paymentMethod = MOCK_PAYMENT_METHODS.find(pm => pm.code === body.payment_method_code) || MOCK_PAYMENT_METHODS[0];

    const enrollment: Enrollment = {
      id: `enr-${Date.now()}`,
      lead_id: lead.id,
      program,
      primary_consultant: lead.assigned_consultant || MOCK_CONSULTANTS[0],
      co_deal: lead.co_deal,
      amount_paid: body.amount_paid,
      currency: body.currency || 'VND',
      payment_method: paymentMethod,
      transaction_ref: body.transaction_ref,
      student_account_status: 'pending',
      activation_email_sent_at: null,
      learn_account_id: null,
      enrolled_at: new Date().toISOString(),
    };

    // Update lead in mock store
    const idx = MOCK_LEADS.findIndex(l => l.id === params.id);
    if (idx !== -1) {
      MOCK_LEADS[idx] = {
        ...MOCK_LEADS[idx],
        current_stage: 'enrolled',
        status: 'closed_won',
        enrolled_at: enrollment.enrolled_at,
        enrollment,
        updated_at: new Date().toISOString(),
      };
    }

    return HttpResponse.json({ data: enrollment });
  }),
];
