import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead, Enrollment } from '../../shared/types';
import { MOCK_PROGRAMS, MOCK_PAYMENT_METHODS } from '../../constants/mock-data';
import { useToast } from '../../shared/components/Toast';
import { WinCelebration } from './WinCelebration';

async function enrollLead(leadId: string, data: {
  program_id: string;
  amount_paid: number;
  currency: string;
  payment_method_code: string;
  transaction_ref: string | null;
}): Promise<Enrollment> {
  const res = await fetch(`/api/leads/${leadId}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.data;
}

interface EnrolledModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EnrolledModal: React.FC<EnrolledModalProps> = ({ lead, onClose, onSuccess }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [programId, setProgramId] = useState(MOCK_PROGRAMS[0].id);
  const [amountPaid, setAmountPaid] = useState(MOCK_PROGRAMS[0].base_price?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState(MOCK_PAYMENT_METHODS[0].code);
  const [transactionRef, setTransactionRef] = useState('');
  const [celebration, setCelebration] = useState<Enrollment | null>(null);

  const enrollMutation = useMutation({
    mutationFn: () => enrollLead(lead.id, {
      program_id: programId,
      amount_paid: Number(amountPaid),
      currency: 'VND',
      payment_method_code: paymentMethod,
      transaction_ref: transactionRef || null,
    }),
    onSuccess: (enrollment) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      setCelebration(enrollment);
      onSuccess?.();
    },
    onError: () => toast.error('Có lỗi xảy ra khi đăng ký'),
  });

  function formatVND(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n);
  }

  if (celebration) {
    return (
      <WinCelebration
        enrollment={celebration}
        onClose={() => { setCelebration(null); onClose(); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700">
          <h3 className="text-white font-bold text-lg">✅ Xác nhận Enrolled</h3>
          <p className="text-slate-400 text-sm mt-1">{lead.person.full_name}</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Program selection */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-2">Chương trình học *</label>
            <div className="space-y-2">
              {MOCK_PROGRAMS.map(prog => (
                <label key={prog.id} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      programId === prog.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600 group-hover:border-slate-400'
                    }`}
                    onClick={() => {
                      setProgramId(prog.id);
                      if (prog.base_price) setAmountPaid(prog.base_price.toString());
                    }}
                  >
                    {programId === prog.id && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-300 group-hover:text-white">{prog.name}</span>
                    {prog.base_price && (
                      <span className="text-xs text-slate-500 ml-2">{formatVND(prog.base_price)}đ</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1">Số tiền thanh toán (VND) *</label>
            <input
              type="number"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="70000000"
            />
            {amountPaid && (
              <p className="text-slate-400 text-xs mt-1">{formatVND(Number(amountPaid))}đ</p>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1">Phương thức thanh toán *</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-indigo-500"
            >
              {MOCK_PAYMENT_METHODS.map(pm => (
                <option key={pm.code} value={pm.code}>{pm.label}</option>
              ))}
            </select>
          </div>

          {/* Transaction ref */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1">Mã giao dịch (tùy chọn)</label>
            <input
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="TXN20260413..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => enrollMutation.mutate()}
            disabled={!amountPaid || enrollMutation.isPending}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-all"
          >
            {enrollMutation.isPending ? 'Đang xử lý...' : '✅ Xác nhận Enrolled'}
          </button>
        </div>
      </div>
    </div>
  );
};
