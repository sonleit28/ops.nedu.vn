import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLeads, useAdvanceStage, useCreateEnrollment, useCreateNote, useUpdateNote, useDeleteNote, useLeadActions, useLeadNotes, useUpdateLead, useTransferLead, useCreateCoDeal, usePersonalProfile, useGeneratePersonalProfile, useKpiTeam } from '@modules/ops/hooks/useLeads';
import { useQueryClient } from '@tanstack/react-query';
import { useLeadStream } from '@modules/ops/hooks/useLeadStream';
import { useCatchUpNotifications } from '@modules/ops/hooks/useCatchUpNotifications';
import { useAuthStore } from '@modules/auth/stores/useAuthStore';
import { useNotificationStore } from '@shared/stores/notification-store';
import type {
  Lead as BackendLead,
  PipelineAction,
  PersonalProfile as BackendPersonalProfile,
  Profile,
  TLItem,
  NoteItem,
  Todo,
  ProfileCard,
} from '@modules/ops/types';
import {
  S_NAMES, S_ICONS, FUNNEL_LAYERS, NEXT_LABELS, BACK_REASONS, GUIDES,
} from '@modules/ops/constants/funnel';
import {
  COURSES, UI_COURSE_TO_CODE, COURSE_TO_PROGRAM, PAY_METHOD_MAP,
} from '@modules/ops/constants/courses';
import { LOAD_CAPACITY } from '@modules/ops/constants/stages';
import { PF_FIELDS } from '@modules/ops/constants/ui';
import { INIT_TODOS, PROFILE_CARDS_INIT } from '@/mocks/data/dashboard-fallback';
import { env } from '@shared/config/env';
import { actionIconOf, actionLabelOf } from '@modules/ops/utils/pipeline-actions';
import { UUID_BY_NUMERIC_ID, leadToTodo } from '@modules/ops/utils/lead-mapper';
import { toDisplayMembers } from '@modules/ops/utils/team-display';
import { getFunnelLayer, nowStr, calcAge, getProfilePct, buildHintTxt } from '@modules/ops/utils/lead-helpers';
import { LeadCard } from '@modules/ops/components/lead-card';
import { LeadHero } from '@modules/ops/components/lead-hero';
import { FunnelBar } from '@modules/ops/components/funnel-bar';

// ─── MAIN APP ─────────────────────────────────────────
export default function App() {
  // Load leads từ API. Khi data về, bootstrap vào state todos để UI local vẫn
  // hoạt động bình thường (mutations chưa wire — v/c sẽ làm sau).
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeads();
  const advanceStageM = useAdvanceStage();
  const enrollM = useCreateEnrollment();
  const transferM = useTransferLead();
  const coDealM = useCreateCoDeal();
  const genProfileM = useGeneratePersonalProfile();

  // Auth user + logout menu
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showUserMenu) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showUserMenu]);
  async function handleLogout() {
    setShowUserMenu(false);
    await logout();
    window.location.href = '/login';
  }
  const userInitial = (user?.full_name?.trim()?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();
  const userFirstName = user?.full_name?.trim().split(/\s+/).pop() ?? 'bạn';
  const createNoteM = useCreateNote();
  const updateNoteM = useUpdateNote();
  const deleteNoteM = useDeleteNote();
  const updateLeadM = useUpdateLead();
  const mappedTodos = useMemo<Todo[]>(() => (leads ?? []).map(leadToTodo), [leads]);

  // INIT_TODOS chỉ dùng làm fallback khi MSW mock đang bật. Prod build kết
  // nối BE thật → useState rỗng, useLeads() bootstrap data từ API.
  const [todos, setTodos] = useState<Todo[]>(env.IS_MOCK ? INIT_TODOS : []);
  const [todosBootstrapped, setTodosBootstrapped] = useState(false);
  useEffect(() => {
    if (mappedTodos.length === 0) return;
    if (!todosBootstrapped) {
      setTodos(mappedTodos);
      setTodosBootstrapped(true);
      return;
    }
    // Sync backend-owned fields khi refetch, giữ local-only fields.
    setTodos(prev => {
      const byId = new Map(mappedTodos.map(m => [m.id, m]));
      const merged = prev.map(old => {
        const fresh = byId.get(old.id);
        if (!fresh) return old;
        return {
          ...old,
          stage: fresh.stage,
          name: fresh.name,
          phone: fresh.phone,
          email: fresh.email,
          badge: fresh.badge,
          badgeColor: fresh.badgeColor,
          priority: fresh.priority,
          action: fresh.action,
          desc: fresh.desc,
          color: fresh.color,
          testScore: fresh.testScore,
          testDesc: fresh.testDesc,
          profile: fresh.profile,
          courses: fresh.courses,
          assignedTo: fresh.assignedTo,
          done: fresh.done,
        };
      });
      // Thêm lead mới nếu có
      const existingIds = new Set(prev.map(p => p.id));
      const added = mappedTodos.filter(m => !existingIds.has(m.id));
      return [...merged, ...added];
    });
  }, [mappedTodos, todosBootstrapped]);

  const [profileCards, setProfileCards] = useState<Record<number, ProfileCard>>(env.IS_MOCK ? PROFILE_CARDS_INIT : {});
  const [activeId, setActiveId] = useState<number|null>(null);
  const [guideChecks, setGuideChecks] = useState<Record<number,Record<number,boolean>>>({});
  // Overlays
  const [showCall, setShowCall] = useState(false);
  const [callId, setCallId] = useState<number|null>(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollId, setEnrollId] = useState<number|null>(null);
  const [showXfer, setShowXfer] = useState(false);
  const [xferLeadId, setXferLeadId] = useState<number|null>(null);
  const [showKPI, setShowKPI] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winData, setWinData] = useState({name:'',course:'',amount:0});
  const [showBack, setShowBack] = useState(false);
  const [backReasonIdx, setBackReasonIdx] = useState<number|null>(null);
  const [backOther, setBackOther] = useState('');
  // Call screen state
  const [csTab, setCsTab] = useState<'info'|'profile'>('info');
  const [editingFields, setEditingFields] = useState<Record<string,boolean>>({});
  const [profileDirty, setProfileDirty] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  // Toast: state lifted sang shared notification store. Cùng 1 UI dùng cho
  // (a) local action feedback (save, delete, ...) qua showToast local wrapper
  // (b) BE notifications từ useLeadStream + useCatchUpNotifications.
  const toast = useNotificationStore((s) => s.current);
  const pushToast = useNotificationStore((s) => s.push);
  // Enroll payment
  const [payMethod, setPayMethod] = useState('transfer');
  const [payCourse, setPayCourse] = useState('lcm');
  const [payAmount, setPayAmount] = useState('70000000');
  const [payTxn, setPayTxn] = useState('');
  // Xfer state
  const [xferTab, setXferTab] = useState<'transfer'|'codeal'>('transfer');
  const [xferTo, setXferTo] = useState('minh-leader');
  const [xferReason, setXferReason] = useState('');
  const [codealPerson, setCodealPerson] = useState('');
  const [splitMe, setSplitMe] = useState(70);
  const [codealNote, setCodealNote] = useState('');
  // Note editing
  const [editingNotes, setEditingNotes] = useState<Record<string,string>>({});
  // Confetti
  const [confetti, setConfetti] = useState<{id:number,left:number,color:string,size:number,dur:number,delay:number,round:boolean}[]>([]);
  // E-08 — Team KPI. Chỉ fetch khi panel mở (giữ panel đóng = ko tốn request).
  const qc = useQueryClient();
  const kpiTeamQuery = useKpiTeam(undefined, showKPI);
  const teamMembers = useMemo(
    () => toDisplayMembers(kpiTeamQuery.data?.members),
    [kpiTeamQuery.data],
  );

  const showToast = useCallback((icon: string, text: string, sub: string) => {
    pushToast({ icon, text, sub });
  }, [pushToast]);

  useEffect(() => {
    setTimeout(() => setActiveId(6), 350);
  }, []);

  // BE notifications: SSE stream + catch-up khi mở app. Gate theo auth user.
  const authUser = useAuthStore((s) => s.user);
  useLeadStream(!!authUser);
  useCatchUpNotifications(!!authUser);

  const updateTodo = useCallback((id: number, updater: (t: Todo) => Todo) => {
    setTodos(prev => prev.map(t => t.id === id ? updater(t) : t));
  }, []);

  const getTodo = (id: number) => todos.find(t => t.id === id);

  // ─── STAGE ACTIONS ─────────────────────────────────
  function doNext() {
    const t = getTodo(activeId!); if (!t || t.stage >= 6) return;
    if (t.stage === 4) { openEnroll(t.id); return; }
    const newStage = t.stage + 1;
    const uuid = UUID_BY_NUMERIC_ID[t.id];
    // Optimistic local update (giữ UX tức thời).
    updateTodo(t.id, old => ({
      ...old, stage: newStage,
      timeline: [{icon:S_ICONS[newStage-1],action:`Chuyển sang ${S_NAMES[newStage-1]}`,date:nowStr(),who:'Linh Nguyễn',note:''}, ...old.timeline]
    }));
    showToast('→', `Chuyển sang ${S_NAMES[newStage-1]}`, t.name);
    if (!uuid) return; // lead t\u1ea1o local t\u1eeb INIT_TODOS, kh\u00f4ng c\u00f3 UUID backend
    advanceStageM.mutate(
      { leadId: uuid, direction: 'forward' },
      {
        onError: (err) => {
          // Rollback
          updateTodo(t.id, old => ({ ...old, stage: t.stage }));
          alert('Tiến stage thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }

  // Stage 5 = Enrolled — không cho back về Intent (rule: enrolled là quyết định
  // dứt khoát, đã ghi nhận thanh toán; muốn revert phải mở case riêng).
  function canGoBack(stage: number) {
    return stage > 1 && stage !== 5;
  }
  function openBackPopover() {
    const t = getTodo(activeId!); if (!t || !canGoBack(t.stage)) return;
    setBackReasonIdx(null); setBackOther('');
    setShowBack(true);
  }
  function executeBack() {
    const t = getTodo(activeId!); if (!t || !canGoBack(t.stage)) { setShowBack(false); return; }
    let reason = backReasonIdx !== null ? BACK_REASONS[backReasonIdx].label : 'Không rõ lý do';
    if (backReasonIdx === 5 && backOther.trim()) reason = backOther.trim();
    const newStage = t.stage - 1;
    const uuid = UUID_BY_NUMERIC_ID[t.id];
    updateTodo(t.id, old => ({
      ...old, stage: newStage,
      timeline: [{icon:'↩️',action:`Lùi về ${S_NAMES[newStage-1]}`,date:nowStr(),who:'Linh Nguyễn',note:`Lý do: ${reason}`}, ...old.timeline]
    }));
    setShowBack(false);
    showToast('↩','Đã lùi stage', reason);
    if (!uuid) return;
    advanceStageM.mutate(
      { leadId: uuid, direction: 'back', regression_reason: reason },
      {
        onError: (err) => {
          updateTodo(t.id, old => ({ ...old, stage: t.stage }));
          alert('Lùi stage thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }

  // ─── CALL SCREEN ───────────────────────────────────
  function openCall(id: number) {
    setCallId(id); setEditingFields({}); setProfileDirty(false);
    setCsTab('info'); setShowCall(true);
  }
  function closeCall() {
    setShowCall(false);
  }
  function saveAndClose() {
    const t = getTodo(callId!);
    setShowCall(false);
    showToast('💾','Đã lưu hồ sơ', t?.name || '');
  }

  // ─── ENROLL ────────────────────────────────────────
  function openEnroll(id: number) {
    const t = getTodo(id);
    if (!t) return;
    if (!t.email || !t.email.trim()) {
      showToast('⚠️', 'Lead chưa có email', 'Cập nhật email trước khi đánh dấu đã chốt');
      return;
    }
    setEnrollId(id); setPayMethod('transfer'); setPayCourse('lcm');
    setPayAmount('70000000'); setPayTxn('');
    setShowEnroll(true);
  }
  function confirmEnroll() {
    const t = getTodo(enrollId!); if (!t) return;
    if (!t.email || !t.email.trim()) {
      setShowEnroll(false);
      showToast('⚠️', 'Lead chưa có email', 'Cập nhật email trước khi đánh dấu đã chốt');
      return;
    }
    const courseMap: Record<string,string> = {lcm:'🌱 Là Chính Mình',adult:'📚 Adult Learning Core',exec:'🎯 Executive Track',short:'⚡ Short Course',corp:'🏢 Corporate'};
    const courseName = courseMap[payCourse]?.split('·')[0]?.trim() || 'Là Chính Mình';
    const amount = parseInt(payAmount) || 70000000;
    const pmLabels: Record<string,string> = {transfer:'Chuyển khoản',card:'Thẻ tín dụng',momo:'Ví điện tử'};
    const uuid = UUID_BY_NUMERIC_ID[t.id];
    const programSlug = COURSE_TO_PROGRAM[payCourse] ?? 'la-chinh-minh';
    const paymentMethod = PAY_METHOD_MAP[payMethod] ?? 'bank_transfer';

    const applySuccess = () => {
      updateTodo(t.id, old => ({
        ...old, stage:5, priority:'week', action:'THEO DÕI', badge:'✅ Đã chốt', badgeColor:'green',
        desc:'Theo dõi trải nghiệm tuần đầu.',
        payment:{amount, course:courseName, method:pmLabels[payMethod]||'Chuyển khoản', txn:payTxn, date:nowStr()},
        timeline:[{icon:'✅',action:`ENROLLED — ${courseName}`,date:nowStr(),who:'Linh Nguyễn',note:`${pmLabels[payMethod]||'Chuyển khoản'} · ${amount.toLocaleString('vi-VN')}₫${payTxn?' · Mã: '+payTxn:''}`}, ...old.timeline]
      }));
      // KPI sẽ tự refetch lần kế khi panel mở; nếu đang mở, invalidate luôn.
      qc.invalidateQueries({ queryKey: ['ops', 'kpi', 'team'] });
      launchConfetti();
      setActiveId(t.id);
      setTimeout(() => { setWinData({name:t.name, course:courseName, amount}); setShowWin(true); }, 400);
    };

    const showError = (msg: string) => {
      showToast('❌', 'Enrollment thất bại', msg);
    };

    setShowEnroll(false);

    if (!uuid) {
      // Lead local (INIT_TODOS fallback), không có UUID backend — chỉ local.
      applySuccess();
      return;
    }

    enrollM.mutate(
      {
        leadId: uuid,
        program_slug: programSlug,
        payment_amount: amount,
        payment_method: paymentMethod,
        transaction_ref: payTxn.trim() || undefined,
      },
      {
        onSuccess: () => {
          applySuccess();
        },
        onError: (err) => {
          const e = err as { message?: string; code?: string };
          if (e.code === 'LEAD_EMAIL_REQUIRED_FOR_ENROLLMENT') {
            showError('Lead chưa có email — cập nhật email trước khi đánh dấu đã chốt.');
          } else if (e.code === 'LEAD_ALREADY_ENROLLED') {
            showError('Lead đã chốt trước đó.');
          } else {
            showError(e.message ?? 'Lỗi không xác định');
          }
        },
      },
    );
  }

  // ─── XFER ─────────────────────────────────────────
  function openXfer(id: number) {
    setXferLeadId(id); setXferTab('transfer'); setXferTo('');
    setXferReason(''); setCodealPerson(''); setSplitMe(70); setCodealNote('');
    setShowXfer(true);
  }
  function confirmXfer() {
    const t = getTodo(xferLeadId!); if (!t) return;
    const uuid = UUID_BY_NUMERIC_ID[t.id];
    if (xferTab === 'codeal') {
      if (!codealPerson) { showToast('⚠','Chọn người đồng hành',''); return; }
      const teamPerson = apiTeammates.find(m => m.id === codealPerson);
      const pName = teamPerson?.name || 'Đồng sự';
      // Optimistic
      updateTodo(t.id, old => ({
        ...old,
        codeal: [...(old.codeal||[]), {name:pName, split:100-splitMe}],
      }));
      showToast('🤝',`Co-deal với ${pName}`,`Hoa hồng: Linh ${splitMe}% · ${pName} ${100-splitMe}%`);
      if (uuid) {
        coDealM.mutate(
          {
            leadId: uuid,
            co_dealer_user_id: codealPerson,
            initiator_ratio: splitMe,
            co_dealer_ratio: 100 - splitMe,
            note: codealNote.trim() || undefined,
          },
          {
            onError: (err) => {
              // Rollback codeal
              updateTodo(t.id, old => ({ ...old, codeal: (old.codeal||[]).slice(0, -1) }));
              alert('Co-deal thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
            },
          },
        );
      }
    } else {
      if (!xferTo) { showToast('⚠','Chọn người nhận',''); return; }
      if (!xferReason.trim()) { showToast('⚠','Nhập lý do chuyển',''); return; }
      const toMember = apiTeammates.find(m => m.id === xferTo);
      const toName = toMember?.name || 'Đồng đội';
      const prevAssigned = t.assignedTo;
      // Optimistic
      updateTodo(t.id, old => ({
        ...old, assignedTo:toName, priority:'done', done:true,
      }));
      showToast('↔','Đã chuyển case',`${t.name} → ${toName}`);
      if (uuid) {
        transferM.mutate(
          { leadId: uuid, to_user_id: xferTo, reason: xferReason.trim() },
          {
            onError: (err) => {
              updateTodo(t.id, old => ({ ...old, assignedTo: prevAssigned, priority: 'urgent', done: false }));
              alert('Chuyển case thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
            },
          },
        );
      }
    }
    setShowXfer(false);
  }

  // ─── CONFETTI ──────────────────────────────────────
  function launchConfetti() {
    const colors = ['#059669','#F59E0B','#EF4444','#3B82F6','#8B5CF6'];
    const items = Array.from({length:60},(_,i) => ({
      id:i, left:Math.random()*100,
      color:colors[Math.floor(Math.random()*colors.length)],
      size:6+Math.random()*6, dur:1.5+Math.random()*1.5,
      delay:Math.random()*0.4, round:Math.random()>0.5
    }));
    setConfetti(items);
    setTimeout(() => setConfetti([]), 3000);
  }

  // ─── PROFILE FIELD EDITING ─────────────────────────
  // Map UI profile key -> backend LeadPatchField
  type LeadPatchField = 'full_name' | 'email' | 'phone' | 'birth_date' | 'birth_time' | 'occupation' | 'goal' | 'main_concern';
  const PF_KEY_MAP: Record<string, LeadPatchField> = {
    dob: 'birth_date',
    birthTime: 'birth_time',
    job: 'occupation',
    goal: 'goal',
    pain: 'main_concern',
  };
  const BASIC_KEY_MAP: Record<string, LeadPatchField> = {
    name: 'full_name',
    phone: 'phone',
    email: 'email',
  };

  function patchLeadField(tid: number, field: LeadPatchField, value: string, label: string) {
    const uuid = UUID_BY_NUMERIC_ID[tid];
    if (!uuid) return;
    updateLeadM.mutate(
      { leadId: uuid, patch: { [field]: value } as Partial<BackendLead> },
      {
        onError: (err) => {
          alert(`Cập nhật ${label} thất bại: ` + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }

  // Banner "Hồ sơ đã thay đổi → Cập nhật Profile" chỉ có nghĩa khi đã có
  // profile generated rồi. Nếu chưa → consultant đang điền lần đầu, không
  // hiện banner vàng (flow "Tạo Profile" sẽ dẫn).
  function markDirtyIfGenerated(tid: number) {
    if (profileCards[tid]?.gen) setProfileDirty(true);
  }

  function setGender(tid: number, gender: 'male' | 'female') {
    updateTodo(tid, old => ({ ...old, profile: { ...old.profile, gender } }));
    markDirtyIfGenerated(tid);
    const uuid = UUID_BY_NUMERIC_ID[tid];
    if (!uuid) return;
    // Backend shallow-merge metadata → chỉ gửi key mình cần ghi.
    updateLeadM.mutate(
      { leadId: uuid, patch: { metadata: { gender } } as Partial<BackendLead> },
      {
        onError: (err) => {
          alert('Lưu giới tính thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }

  function setConsent(tid: number, consent: boolean) {
    updateTodo(tid, old => ({ ...old, aiProfileConsent: consent }));
    const uuid = UUID_BY_NUMERIC_ID[tid];
    if (!uuid) return;
    updateLeadM.mutate(
      { leadId: uuid, patch: { ai_profile_consent: consent } as Partial<BackendLead> },
      {
        onError: (err) => {
          alert('Lưu đồng ý thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }

  function savePF(tid: number, key: string, val: string) {
    const trimmed = val.trim();
    updateTodo(tid, old => ({
      ...old, profile:{...old.profile, [key]:trimmed}
    }));
    setEditingFields(prev => ({...prev, [`${tid}-${key}`]:false}));
    markDirtyIfGenerated(tid);
    if (trimmed) showToast('✅','Đã lưu', key + ' đã cập nhật');
    const backendField = PF_KEY_MAP[key];
    if (!backendField || !trimmed) return;
    // Normalize dd/mm/yyyy -> yyyy-mm-dd cho birth_date
    let value = trimmed;
    if (backendField === 'birth_date') {
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
      if (m) value = `${m[3]}-${m[2]}-${m[1]}`;
    }
    patchLeadField(tid, backendField, value, key);
  }
  function saveBasicField(tid: number, key: string, val: string) {
    const trimmed = val.trim();
    if (!trimmed) return;
    updateTodo(tid, old => ({
      ...old,
      name: key==='name' ? trimmed : old.name,
      phone: key==='phone' ? trimmed : old.phone,
      email: key==='email' ? trimmed : old.email,
    }));
    setEditingFields(prev => ({...prev, [`basic-${tid}-${key}`]:false}));
    markDirtyIfGenerated(tid);
    showToast('✅','Đã cập nhật', `${key} → ${trimmed}`);
    const backendField = BASIC_KEY_MAP[key];
    if (!backendField) return;
    patchLeadField(tid, backendField, trimmed, key);
  }
  // force=true khi consultant bấm "↻ Cập nhật Profile" (banner dirty) — ép
  // regenerate kể cả khi birth data chưa đổi (vault cache theo fingerprint
  // birth_date/time/tz/location/gender; các field như job/goal/name không
  // nằm trong fingerprint → cần force để narrative pickup).
  function genProfile(id: number, force = false) {
    const uuid = UUID_BY_NUMERIC_ID[id];
    setGeneratingProfile(true);
    if (!uuid) {
      // Fallback local (lead không có UUID backend)
      setTimeout(() => {
        setProfileCards(prev => ({
          ...prev,
          [id]:{gen:true,dm:'Nhâm Thủy 壬',lp:'5',nk:'Sao 5 Thổ',sun:'Cự Giải',menh:'Thủy Nhị Cục',gua:'4',
            q:'"Dòng sông sâu không ồn ào — sức mạnh nằm trong chiều sâu."',
            core:'Nhâm Thủy nhật chủ — chiều sâu nội tâm lớn. Quyết định bằng cảm nhận + logic.',
            talk:[{y:true,t:'<strong>Cho thời gian suy nghĩ.</strong>'},{y:false,t:'<strong>Tránh:</strong> ép quyết định.'}],
            need:'Đang tìm sự bình yên nội tâm.',
            timing:'2026 — năm chuyển hóa.',
            opening:'"Em thấy anh/chị đang tìm điều gì đó sâu hơn..."'}
        }));
        setGeneratingProfile(false);
        showToast('✨','Hồ sơ AI đã tạo!','Xem tab Hồ sơ AI');
      }, 800);
      return;
    }
    genProfileM.mutate(
      { leadId: uuid, force },
      {
        onSuccess: (result) => {
          if (result) {
            setProfileCards(prev => ({ ...prev, [id]: apiToProfileCard(result) }));
          }
          setGeneratingProfile(false);
          setProfileDirty(false); // banner tắt vì profile vừa refresh.
          showToast(
            force ? '↻' : '✨',
            force ? 'Đã cập nhật Profile!' : 'Hồ sơ AI đã tạo!',
            'Xem tab Hồ sơ AI',
          );
        },
        onError: (err) => {
          setGeneratingProfile(false);
          const e = err as { code?: string; message?: string };
          if (e.code === 'MISSING_BIRTH_DATE') {
            alert('Cần có ngày sinh để tạo Hồ sơ AI. Điền ngày sinh trong tab Hồ Sơ trước.');
          } else if (e.code === 'AI_PROFILE_CONSENT_REQUIRED') {
            alert('Lead chưa đồng ý cho phép tạo Hồ sơ AI — bật toggle Đồng ý trong tab Hồ Sơ.');
          } else if (e.code === 'MISSING_GENDER') {
            alert('Cần chọn giới tính (Nam/Nữ) trước khi tạo Hồ sơ AI — chọn trong tab Hồ Sơ.');
          } else if (e.code === 'VAULT_FACET_NOT_SUPPORTED') {
            alert('Backend vault chưa hỗ trợ facet này. Liên hệ dev.');
          } else {
            alert('Tạo profile thất bại: ' + (e.message ?? 'Lỗi không xác định'));
          }
        },
      },
    );
  }

  // ─── NOTES ────────────────────────────────────────
  function sendNote(tid: number, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const uuid = UUID_BY_NUMERIC_ID[tid];
    // Optimistic: thêm note vào list ngay, gán id tạm. Khi API OK, update id thật.
    const tempId = `temp-${Date.now()}`;
    const note: NoteItem = {text:trimmed, date:nowStr(), who:'Linh Nguyễn', id:tempId};
    updateTodo(tid, old => ({
      ...old,
      notes: [note, ...old.notes],
      timeline: [{icon:'📝',action:'Ghi chú cho người kế tiếp',date:nowStr(),who:'Linh Nguyễn',note:trimmed}, ...old.timeline]
    }));
    showToast('📝','Ghi chú đã lưu','Người kế tiếp sẽ đọc được này');
    if (!uuid) return;
    createNoteM.mutate(
      { leadId: uuid, content: trimmed },
      {
        onSuccess: (created) => {
          if (!created) return;
          updateTodo(tid, old => ({
            ...old,
            notes: old.notes.map(n => n.id === tempId ? { ...n, id: created.id } : n),
          }));
        },
        onError: (err) => {
          updateTodo(tid, old => ({ ...old, notes: old.notes.filter(n => n.id !== tempId) }));
          alert('Lưu ghi chú thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }
  // Lookup note UUID theo idx trong list note hi\u1ec7n UI (apiNotes n\u1ebfu c\u00f3, fallback local).
  const resolveNoteId = (tid: number, idx: number): string | undefined => {
    // Active lead: d\u00f9ng apiNotes (\u0111\u00e3 merge v\u00e0o activeTodoWithNotes UI render).
    const active = activeTodoWithNotes ?? activeTodoRaw;
    if (active && active.id === tid) return active.notes[idx]?.id;
    // Fallback local state
    return getTodo(tid)?.notes[idx]?.id;
  };

  function saveNoteEdit(tid: number, idx: number, newVal: string) {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    const uuid = UUID_BY_NUMERIC_ID[tid];
    const noteUuid = resolveNoteId(tid, idx);
    updateTodo(tid, old => {
      const notes = [...old.notes];
      notes[idx] = {...notes[idx], text:trimmed};
      return {...old, notes};
    });
    setEditingNotes(prev => {const n={...prev};delete n[`${tid}-${idx}`];return n;});
    if (!uuid || !noteUuid || noteUuid.startsWith('temp-')) return;
    updateNoteM.mutate(
      { leadId: uuid, noteId: noteUuid, content: trimmed },
      {
        onError: (err) => {
          alert('Sửa ghi chú thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }
  function deleteNote(tid: number, idx: number) {
    const uuid = UUID_BY_NUMERIC_ID[tid];
    const noteUuid = resolveNoteId(tid, idx);
    updateTodo(tid, old => ({...old, notes:old.notes.filter((_,i)=>i!==idx)}));
    setEditingNotes(prev => {const n={...prev};delete n[`${tid}-${idx}`];return n;});
    showToast('🗑','Đã xóa ghi chú','');
    if (!uuid || !noteUuid || noteUuid.startsWith('temp-')) return;
    deleteNoteM.mutate(
      { leadId: uuid, noteId: noteUuid },
      {
        onError: (err) => {
          alert('Xóa ghi chú thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }
  function toggleCourse(tid: number, courseId: string) {
    const t = getTodo(tid);
    if (!t) return;
    const adding = !t.courses.includes(courseId);
    const nextCourses = adding
      ? [...t.courses, courseId]
      : t.courses.filter(c => c !== courseId);
    const prevCourses = t.courses;
    // Optimistic
    updateTodo(tid, old => ({ ...old, courses: nextCourses }));
    const c = COURSES.find(x=>x.id===courseId);
    if (c) showToast(c.emoji, adding ? `Đã thêm ${c.name}` : `Đã bỏ ${c.name}`, '');

    const uuid = UUID_BY_NUMERIC_ID[tid];
    if (!uuid) return;
    // Map FE course key \u2192 BE course.code, skip n\u1ebfu kh\u00f4ng c\u00f3 mapping (vd course local).
    const courseCodes = nextCourses
      .map(cid => UI_COURSE_TO_CODE[cid])
      .filter((c): c is string => !!c);
    updateLeadM.mutate(
      { leadId: uuid, patch: { interested_courses: courseCodes } },
      {
        onError: (err) => {
          updateTodo(tid, old => ({ ...old, courses: prevCourses }));
          alert('Lưu khóa thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
        },
      },
    );
  }
  function toggleGuide(tid: number, idx: number) {
    setGuideChecks(prev => ({
      ...prev,
      [tid]:{...(prev[tid]||{}), [idx]:!(prev[tid]||{})[idx]}
    }));
  }
  function toggleDone(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    updateTodo(id, old => ({...old, done:!old.done}));
  }

  // ─── COMPUTED ─────────────────────────────────────
  const activeTodoRaw = getTodo(activeId!);
  const activeUuid = activeTodoRaw ? UUID_BY_NUMERIC_ID[activeTodoRaw.id] : undefined;
  const { data: actionsData } = useLeadActions(activeUuid ?? null);
  const { data: notesData } = useLeadNotes(activeUuid ?? null);
  const { data: profileApi } = usePersonalProfile(activeUuid ?? null);

  // Map backend PersonalProfile -> UI ProfileCard shape.
  function apiToProfileCard(p: BackendPersonalProfile): ProfileCard {
    const dos = (p.communication_dos ?? []).map(t => ({ y: true, t }));
    const donts = (p.communication_donts ?? []).map(t => ({ y: false, t }));
    return {
      gen: true,
      dm: p.nhut_chu ?? '—',
      lp: p.life_path_number != null ? String(p.life_path_number) : '—',
      nk: p.nine_star ?? '—',
      sun: p.sun_sign ?? '—',
      menh: p.menh_cuc ?? '—',
      gua: '—',
      q: p.opening_suggestion ?? '',
      core: p.core_personality ?? '',
      talk: [...dos, ...donts],
      need: p.real_need ?? '',
      timing: p.timing_2026 ?? '',
      opening: p.opening_suggestion ?? '',
    };
  }

  // Sync profile API vào profileCards khi data về (by numeric id).
  // - profileApi object → populate/overwrite card từ backend
  // - profileApi null (backend nói "chưa có profile") → clear card để UI
  //   show "Tạo Hồ sơ AI" state, không để leftover stale data.
  useEffect(() => {
    if (!activeTodoRaw) return;
    if (profileApi === undefined) return; // chưa fetch xong
    const tid = activeTodoRaw.id;
    setProfileCards(prev => {
      if (profileApi === null) {
        if (!(tid in prev)) return prev;
        const next = { ...prev };
        delete next[tid];
        return next;
      }
      return { ...prev, [tid]: apiToProfileCard(profileApi) };
    });
    // Khi backend xác nhận profile state, reset dirty — consultant chưa
    // đổi gì kể từ lần load này.
    setProfileDirty(false);
  }, [profileApi, activeTodoRaw]);

  const apiTimeline: TLItem[] = useMemo(() => {
    if (!actionsData) return [];
    return actionsData.map((a: PipelineAction): TLItem => ({
      icon: actionIconOf(a.action_type),
      action: actionLabelOf(a),
      date: new Date(a.created_at).toLocaleString('vi-VN'),
      who: a.performed_by_full_name,
      note: a.note_content ?? a.regression_reason ?? '',
    }));
  }, [actionsData]);

  // N\u1ebfu c\u00f3 API timeline, override timeline c\u1ee7a activeTodo.
  const activeTodo = activeTodoRaw && apiTimeline.length > 0
    ? { ...activeTodoRaw, timeline: apiTimeline }
    : activeTodoRaw;

  // Notes t\u1eeb endpoint GET /notes (c\u00f3 UUID th\u1eadt). Fallback t\u1eeb actions n\u1ebfu endpoint r\u1ed7ng.
  const apiNotes: NoteItem[] = useMemo(() => {
    if (notesData && notesData.length > 0) {
      return notesData.map(n => ({
        id: n.id,
        text: n.content,
        who: n.author_full_name,
        date: new Date(n.created_at).toLocaleDateString('vi-VN'),
      }));
    }
    return [];
  }, [notesData]);

  // N\u1ebfu c\u00f3 API notes, override notes c\u1ee7a activeTodo (trong khi gi\u1eef timeline API).
  const activeTodoWithNotes = activeTodo && apiNotes.length > 0
    ? { ...activeTodo, notes: apiNotes }
    : activeTodo;

  // Danh s\u00e1ch teammate (UUID th\u1eadt) derive t\u1eeb leads \u0111\u1ec3 d\u00f9ng trong modal Transfer / Co-deal.
  const apiTeammates = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    (leads ?? []).forEach(l => {
      if (!seen.has(l.assigned_to_user_id)) {
        seen.set(l.assigned_to_user_id, { id: l.assigned_to_user_id, name: l.assigned_to_full_name });
      }
    });
    return Array.from(seen.values());
  }, [leads]);

  const urgent = todos.filter(t => t.priority === 'urgent');
  const today = todos.filter(t => t.priority === 'today');

  // ─── LOAD CAPACITY ─────────────────────────────────
  // Active = lead chưa done (chưa enrolled/retention) → khớp định nghĩa BE.
  const activeLoad = todos.filter(t => !t.done).length;
  const loadPct = Math.min(100, Math.round((activeLoad / LOAD_CAPACITY) * 100));
  const loadColor = activeLoad >= LOAD_CAPACITY
    ? 'var(--red)'
    : activeLoad >= LOAD_CAPACITY * 0.8
    ? 'var(--amber)'
    : 'var(--nedu)';
  const callTodoRaw = getTodo(callId!);
  const callTodo = callTodoRaw && callTodoRaw.id === activeId
    ? (activeTodoWithNotes ?? callTodoRaw)
    : callTodoRaw;

  const todayDate = new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long'});

  // ─── FUNNEL MINI ──────────────────────────────────
  const currentLayer = activeTodo ? getFunnelLayer(activeTodo.stage) : null;

  // ─── KPI COMPUTED ─────────────────────────────────
  // Số liệu summary lấy thẳng từ API (đã tính ở BE để mọi client thống nhất);
  // chỉ fallback compute từ members nếu BE không trả summary.
  const kpiSummary = kpiTeamQuery.data?.summary;
  const totalTarget = kpiSummary?.monthly_target ?? teamMembers.reduce((s,m)=>s+m.target,0);
  const totalEnrolled = kpiSummary?.enrolled_this_month ?? teamMembers.reduce((s,m)=>s+m.enrolled,0);
  const totalRevenue = kpiSummary?.monthly_revenue_vnd ?? teamMembers.reduce((s,m)=>s+m.revenue,0);
  const totalActiveLeads = kpiSummary?.active_leads ?? todos.filter(t=>!t.done).length;
  const conversionRate = kpiSummary?.conversion_rate ?? Math.round((totalEnrolled/Math.max(todos.length,1))*100);
  const kpiPct = totalTarget > 0 ? Math.round((totalEnrolled/totalTarget)*100) : 0;
  const sortedTeam = [...teamMembers].sort((a,b)=>b.enrolled-a.enrolled);

  // ─── RENDER ───────────────────────────────────────
  if (leadsLoading && !todosBootstrapped) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--t2)', fontSize: 13 }}>Đang tải dữ liệu…</div>
      </div>
    );
  }
  if (leadsError && !todosBootstrapped) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 8 }}>
        <div style={{ color: 'var(--red)', fontSize: 14, fontWeight: 700 }}>Không tải được danh sách lead</div>
        <div style={{ color: 'var(--t3)', fontSize: 12 }}>{leadsError instanceof Error ? leadsError.message : 'Lỗi không xác định'}</div>
      </div>
    );
  }
  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo">Nedu<span>ops</span></div>
        <div className="tb-spacer"/>
        <div className="funnel-mini">
          {FUNNEL_LAYERS.map(l => (
            <div key={l.id} className={`fm-step${currentLayer?.id===l.id?' active':''}`}
              style={currentLayer?.id===l.id?{background:l.color}:{}}>
              {l.short}
            </div>
          ))}
        </div>
        <div style={{width:8}}/>
        <div className="tb-greeting">Chào sáng, <em>{userFirstName}</em> ☀️</div>
        <div style={{width:8}}/>
        <button className="btn btn-ghost btn-sm" onClick={()=>setShowKPI(true)}>📊 KPI Đội</button>
        <div style={{width:6}}/>
        <div ref={userMenuRef} style={{position:'relative'}}>
          <div
            className="tb-avatar"
            role="button"
            tabIndex={0}
            title={user?.email ?? ''}
            onClick={()=>setShowUserMenu(v=>!v)}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setShowUserMenu(v=>!v);}}}
            style={{cursor:'pointer'}}
          >
            {userInitial}
          </div>
          {showUserMenu && (
            <div
              style={{
                position:'absolute',top:'calc(100% + 6px)',right:0,minWidth:220,
                background:'var(--wh,#fff)',border:'1px solid var(--stone2,#e5e7eb)',
                borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',padding:6,zIndex:1000,
              }}
            >
              <div style={{padding:'8px 10px',borderBottom:'1px solid var(--stone2,#e5e7eb)',marginBottom:4}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--t1,#111)'}}>{user?.full_name ?? 'Người dùng'}</div>
                <div style={{fontSize:11,color:'var(--t3,#6b7280)'}}>{user?.email ?? ''}</div>
                {user?.primary_role && (
                  <div style={{fontSize:10,fontFamily:'var(--mono)',color:'var(--t3,#6b7280)',marginTop:2,textTransform:'uppercase'}}>
                    {user.primary_role}
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width:'100%',textAlign:'left',background:'transparent',border:'none',
                  padding:'8px 10px',borderRadius:6,cursor:'pointer',fontSize:13,color:'var(--red,#DC2626)',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--red-s,#FEE2E2)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
              >
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LAYOUT */}
      <div className="layout">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="lp-header">
            <div className="lp-date">{todayDate}</div>
            <div className="lp-title">Hôm nay cần làm</div>
            <div className="load-bar-wrap">
              <div className="lb-row">
                <span className="lb-label">Tải công việc</span>
                <span className="lb-num" style={{color: loadColor}}>{activeLoad}<span style={{fontSize:10,color:'var(--t3)'}}>/{LOAD_CAPACITY}</span></span>
              </div>
              <div className="lb-track"><div className="lb-fill" style={{width:`${loadPct}%`,background:loadColor}}/></div>
            </div>
          </div>
          {/* Urgent section */}
          <div className="section-label">
            <div className="sl-dot" style={{background:'var(--red)'}}/>
            Khẩn cấp
            <div className="sl-count" style={{background:'var(--red-s)',color:'var(--red)'}}>
              {urgent.filter(t=>!t.done).length}
            </div>
          </div>
          <div className="action-list">
            {urgent.map(t => <LeadCard key={t.id} t={t} activeId={activeId} onSelect={setActiveId} onToggleDone={toggleDone}/>)}
            {/* Today section */}
            <div className="section-label">
              <div className="sl-dot" style={{background:'var(--amber)'}}/>
              Hôm nay
              <div className="sl-count">{today.filter(t=>!t.done).length}</div>
            </div>
            {today.map(t => <LeadCard key={t.id} t={t} activeId={activeId} onSelect={setActiveId} onToggleDone={toggleDone}/>)}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="center-panel">
          {!activeTodo ? (
            <div className="empty-state">
              <div className="es-icon">👆</div>
              <div className="es-title">Chọn một công việc</div>
              <div className="es-sub">Click vào lead để xem hướng dẫn từng bước</div>
            </div>
          ) : (
            <div style={{display:'flex',flex:1,flexDirection:'column',overflow:'hidden'}}>
              {/* Lead Hero */}
              <LeadHero t={activeTodo} onCall={openCall} onXfer={openXfer} onEnroll={openEnroll}/>
              {/* Funnel Bar */}
              <FunnelBar t={activeTodo}/>
              {/* Stage Nav */}
              <div className="stage-nav">
                <button
                  className="sn-back"
                  disabled={!canGoBack(activeTodo.stage)}
                  onClick={openBackPopover}
                  title={activeTodo.stage===5 ? 'Đã chốt — không thể lùi giai đoạn' : undefined}
                >
                  {activeTodo.stage<=1
                    ? '← Đầu funnel'
                    : activeTodo.stage===5
                    ? '🔒 Đã chốt — khoá lùi'
                    : `← ${S_NAMES[activeTodo.stage-2]}`}
                </button>
                <div className="sn-stages">
                  {S_NAMES.map((s,i) => {
                    const n=i+1, done=n<activeTodo.stage, cur=n===activeTodo.stage;
                    return (
                      <div key={n} className={`sn-step${done?' done':''}${cur?' current':''}`}
                        title={`Chuyển sang ${s}`}>
                        <div className="sn-dot">{done?'✓':cur?S_ICONS[i]:n}</div>
                        <div className="sn-label">{s}</div>
                      </div>
                    );
                  })}
                </div>
                {activeTodo.stage>=6 ? (
                  <button className="sn-next" disabled>Cuối funnel ✓</button>
                ) : activeTodo.stage===4 ? (
                  <button className="sn-next enroll-stage" onClick={doNext}>✅ Đánh dấu đã chốt</button>
                ) : (
                  <button className={`sn-next${activeTodo.stage===3?' close-stage':''}`} onClick={doNext}>
                    {NEXT_LABELS[activeTodo.stage]}
                  </button>
                )}
              </div>
              {/* Center Body */}
              <div className="center-body">
                <CenterBody
                  t={activeTodoWithNotes ?? activeTodo}
                  guideChecks={guideChecks[activeTodo.id]||{}}
                  profileCards={profileCards}
                  onToggleGuide={(idx)=>toggleGuide(activeTodo.id,idx)}
                  onSendNote={(text)=>sendNote(activeTodo.id,text)}
                  onEditNote={(idx,val)=>saveNoteEdit(activeTodo.id,idx,val)}
                  onDeleteNote={(idx)=>deleteNote(activeTodo.id,idx)}
                  onToggleCourse={(cid)=>toggleCourse(activeTodo.id,cid)}
                  editingNotes={editingNotes}
                  onStartEditNote={(idx,val)=>setEditingNotes(prev=>({...prev,[`${activeTodo.id}-${idx}`]:val}))}
                  onCancelEditNote={(idx)=>setEditingNotes(prev=>{const n={...prev};delete n[`${activeTodo.id}-${idx}`];return n;})}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BACK REASON POPOVER */}
      {showBack && (
        <div className="back-popover" onClick={e=>{if(e.target===e.currentTarget)setShowBack(false)}}>
          <div className="back-card">
            <div className="bc-icon">↩️</div>
            <div className="bc-title">Lùi về {activeTodo ? S_NAMES[activeTodo.stage-2] : 'stage trước'}?</div>
            <div className="bc-sub">Chọn lý do — người kế tiếp sẽ đọc được điều này</div>
            <div className="bc-reasons">
              {BACK_REASONS.map((r,i) => (
                <div key={i} className={`bc-reason${backReasonIdx===i?' selected':''}`} onClick={()=>setBackReasonIdx(i)}>
                  <span style={{fontSize:16}}>{r.icon}</span><span>{r.label}</span>
                </div>
              ))}
              {backReasonIdx===5 && (
                <textarea style={{width:'100%',border:'1.5px solid var(--stone2)',borderRadius:'var(--rads)',padding:'8px 11px',fontSize:13,fontFamily:'Be Vietnam Pro,sans-serif',color:'var(--t1)',resize:'none',outline:'none',background:'var(--bg)',minHeight:64,lineHeight:1.6,marginTop:8}}
                  placeholder="Mô tả lý do cụ thể..."
                  value={backOther} onChange={e=>setBackOther(e.target.value)}/>
              )}
            </div>
            <div className="bc-btns">
              <button className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={()=>setShowBack(false)}>Hủy</button>
              <button className="btn btn-danger" style={{flex:1,justifyContent:'center'}} onClick={executeBack}>↩ Xác nhận lùi</button>
            </div>
          </div>
        </div>
      )}

      {/* CALL SCREEN */}
      {showCall && callTodo && (
        <CallScreen
          t={callTodo}
          tab={csTab}
          onTabChange={setCsTab}
          onClose={closeCall}
          onSaveClose={saveAndClose}
          profileCards={profileCards}
          editingFields={editingFields}
          onEditField={(key)=>setEditingFields(prev=>({...prev,[key]:true}))}
          onSavePF={savePF}
          onSaveBasic={saveBasicField}
          onSetGender={setGender}
          onSetConsent={setConsent}
          onMarkDirty={()=>markDirtyIfGenerated(callTodo.id)}
          profileDirty={profileDirty}
          generatingProfile={generatingProfile}
          onGenProfile={genProfile}
          onRegenProfile={(id)=>{setProfileDirty(false);genProfile(id, true);showToast('↻','Đang cập nhật Profile...','Dựa trên thông tin mới nhất');}}
          onSendNote={(text)=>sendNote(callTodo.id,text)}
          onEditNote={(idx,val)=>saveNoteEdit(callTodo.id,idx,val)}
          onDeleteNote={(idx)=>deleteNote(callTodo.id,idx)}
          onToggleCourse={(cid)=>toggleCourse(callTodo.id,cid)}
          editingNotes={editingNotes}
          onStartEditNote={(idx,val)=>setEditingNotes(prev=>({...prev,[`${callTodo.id}-${idx}`]:val}))}
          onCancelEditNote={(idx)=>setEditingNotes(prev=>{const n={...prev};delete n[`${callTodo.id}-${idx}`];return n;})}
        />
      )}

      {/* ENROLL MODAL */}
      {showEnroll && enrollId && (() => {
        const et = getTodo(enrollId);
        if (!et) return null;
        const missingEmail = !et.email || !et.email.trim();
        return (
          <div className="enroll-ov" onClick={e=>{if(e.target===e.currentTarget)setShowEnroll(false)}}>
            <div className="enroll-m">
              <div className="em-icon">🎉</div>
              <div className="em-title">Xác nhận đã chốt!</div>
              <div className="em-sub">Đánh dấu lead đã thanh toán để consultant và hệ thống theo dõi.</div>
              {missingEmail && (
                <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.35)',color:'var(--red,#dc2626)',padding:'10px 12px',borderRadius:8,fontSize:13,marginBottom:12}}>
                  ⚠️ Lead chưa có email — cập nhật email trước khi đánh dấu đã chốt.
                </div>
              )}
              <div className="em-info">
                <div className="er-row"><span className="er-key">Học viên</span><span className="er-val">{et.name}</span></div>
                <div className="er-row"><span className="er-key">Email</span><span className="er-val" style={missingEmail?{color:'var(--red,#dc2626)'}:undefined}>{et.email || '— chưa có —'}</span></div>
                <div className="er-row"><span className="er-key">Chương trình</span><span className="er-val">Adult Learning</span></div>
                <div className="er-row"><span className="er-key">Học phí</span><span className="er-val" style={{color:'var(--green)'}}>70,000,000 ₫</span></div>
              </div>
              <div className="pay-block">
                <div className="pay-blk-title">💳 Thông tin thanh toán</div>
                <div className="pay-field">
                  <label>Khóa học đã đăng ký</label>
                  <select className="pay-select" value={payCourse} onChange={e=>setPayCourse(e.target.value)}>
                    <option value="lcm">🌱 Là Chính Mình · 70,000,000 ₫</option>
                    <option value="adult">📚 Adult Learning Core · 70,000,000 ₫</option>
                    <option value="exec">🎯 Executive Track · 120,000,000 ₫</option>
                    <option value="short">⚡ Short Course · 15,000,000 ₫</option>
                    <option value="corp">🏢 Corporate · Theo hợp đồng</option>
                  </select>
                </div>
                <div className="pay-field">
                  <label>Số tiền đã nhận (₫)</label>
                  <input type="number" className="pay-inp" value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder="70000000"/>
                </div>
                <div className="pay-field">
                  <label>Hình thức thanh toán</label>
                  <div className="pm-row">
                    {[{v:'transfer',l:'🏦 Chuyển khoản'},{v:'card',l:'💳 Thẻ tín dụng'},{v:'momo',l:'📱 Ví điện tử'}].map(pm => (
                      <div key={pm.v} className={`pm-chip${payMethod===pm.v?' sel':''}`} onClick={()=>setPayMethod(pm.v)}>{pm.l}</div>
                    ))}
                  </div>
                </div>
                <div className="pay-field">
                  <label>Mã giao dịch (nếu có)</label>
                  <input type="text" className="pay-inp" value={payTxn} onChange={e=>setPayTxn(e.target.value)} placeholder="VD: FT26040612345 hoặc để trống"/>
                </div>
              </div>
              <div className="em-btns">
                <button className="btn btn-ghost" onClick={()=>setShowEnroll(false)}>Hủy</button>
                <button className="btn btn-primary" style={{flex:2,justifyContent:'center',opacity:missingEmail?0.5:1,cursor:missingEmail?'not-allowed':'pointer'}} disabled={missingEmail} onClick={confirmEnroll}>✅ Xác nhận đã thanh toán</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* XFER MODAL */}
      {showXfer && (
        <div className="xfer-ov" onClick={e=>{if(e.target===e.currentTarget)setShowXfer(false)}}>
          <div className="xfer-modal">
            <div style={{fontSize:26,marginBottom:8}}>↔️</div>
            <div className="xm-title">Chuyển case / Co-deal</div>
            <div className="xm-sub">Lead: {getTodo(xferLeadId!)?.name||''}</div>
            <div className="xm-tabs">
              <div className={`xm-tab${xferTab==='transfer'?' on':''}`} onClick={()=>setXferTab('transfer')}>↔ Chuyển case</div>
              <div className={`xm-tab${xferTab==='codeal'?' on':''}`} onClick={()=>setXferTab('codeal')}>🤝 Co-deal</div>
            </div>
            {xferTab === 'transfer' && (
              <div>
                <div className="xm-label">Chuyển cho ai?</div>
                <select className="xm-select" value={xferTo} onChange={e=>setXferTo(e.target.value)}>
                  <option value="">-- Chọn người nhận --</option>
                  {apiTeammates
                    .filter(m => m.id !== UUID_BY_NUMERIC_ID[xferLeadId ?? -1] // ko cho ch\u1ecdn ch\u00ednh owner hi\u1ec7n t\u1ea1i
                      ? true
                      : true)
                    .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <div className="xm-label">Lý do chuyển <span style={{color:'#EF4444'}}>*</span></div>
                <textarea className="xm-textarea" value={xferReason} onChange={e=>setXferReason(e.target.value)}
                  placeholder="VD: Lead này cần tư vấn về khóa Executive — em chưa đủ kinh nghiệm xử lý..."/>
                <div style={{fontSize:11,color:'#F59E0B',marginTop:6,fontStyle:'italic'}}>
                  ⚠️ Ghi chú giúp người nhận hiểu ngữ cảnh — luôn nên điền rõ lý do.
                </div>
              </div>
            )}
            {xferTab === 'codeal' && (
              <div>
                <div className="codeal-info">
                  💡 <strong>Co-deal</strong> = bạn và 1 người khác cùng chốt deal này. Hoa hồng chia theo tỷ lệ bạn đặt.
                </div>
                <div className="xm-label">Thêm người đồng hành</div>
                <select className="xm-select" value={codealPerson} onChange={e=>setCodealPerson(e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {apiTeammates.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <div className="xm-label">Tỷ lệ chia hoa hồng</div>
                <div className="split-row">
                  <div style={{textAlign:'center',flex:1}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontFamily:'var(--mono)',marginBottom:4}}>Bạn (Linh)</div>
                    <input type="number" value={splitMe} min={10} max={90} onChange={e=>{const v=Math.min(90,Math.max(10,parseInt(e.target.value)||70));setSplitMe(v);}}/>
                  </div>
                  <span>+</span>
                  <div style={{textAlign:'center',flex:1}}>
                    <div style={{fontSize:10,color:'var(--t3)',fontFamily:'var(--mono)',marginBottom:4}}>
                      {codealPerson ? apiTeammates.find(m=>m.id===codealPerson)?.name?.split(' ').slice(-1)[0]||'Đồng sự' : 'Đồng sự'}
                    </div>
                    <input type="number" value={100-splitMe} readOnly style={{background:'var(--stone)'}}/>
                  </div>
                  <span>= 100%</span>
                </div>
                <div className="xm-label">Ghi chú <span style={{color:'#EF4444'}}>*</span></div>
                <textarea className="xm-textarea" value={codealNote} onChange={e=>setCodealNote(e.target.value)}
                  placeholder="VD: Em nhờ chị Hương hỗ trợ vì chị có kinh nghiệm với CEO nhiều hơn..."/>
                <div style={{fontSize:11,color:'#F59E0B',marginTop:6,fontStyle:'italic'}}>
                  ⚠️ Ghi chú giúp đối tác hiểu vai trò + lý do chia hoa hồng — luôn nên điền rõ.
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:7}}>
              <button className="btn btn-ghost" style={{flex:1,justifyContent:'center'}} onClick={()=>setShowXfer(false)}>Hủy</button>
              <button className="btn btn-primary" style={{flex:2,justifyContent:'center'}} onClick={confirmXfer}>✅ Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* KPI PANEL */}
      {showKPI && (() => {
        const monthIso = kpiTeamQuery.data?.month ?? '2026-04';
        const [yyyy, mm] = monthIso.split('-');
        const monthLabel = `Tháng ${parseInt(mm,10)}/${yyyy}`;
        return (
        <div className="kpi-ov" onClick={e=>{if(e.target===e.currentTarget)setShowKPI(false)}}>
          <div className="kpi-panel">
            <div className="kpi-hdr">
              <div>
                <div className="kpi-hdr-title">📊 KPI Đội · {monthLabel}</div>
                <div className="kpi-hdr-sub">Nedu Sales Team · Adult Learning Program</div>
              </div>
              <button className="kpi-close" onClick={()=>setShowKPI(false)}>✕</button>
            </div>
            <div className="kpi-body">
              {kpiTeamQuery.isLoading && (
                <div style={{padding:'40px 0',textAlign:'center',color:'var(--t3)',fontSize:13}}>Đang tải KPI…</div>
              )}
              {kpiTeamQuery.isError && !kpiTeamQuery.isLoading && (
                <div style={{padding:'14px 16px',marginBottom:16,background:'var(--amber-s)',border:'1.5px solid var(--amber-b)',borderRadius:'var(--rad)',color:'var(--amber)',fontSize:13}}>
                  Không tải được KPI. <button onClick={()=>kpiTeamQuery.refetch()} style={{textDecoration:'underline',color:'var(--amber)',background:'none',border:0,cursor:'pointer'}}>Thử lại</button>
                </div>
              )}
              {!kpiTeamQuery.isLoading && !kpiTeamQuery.isError && (<>
              <div className="kpi-month-bar">
                <div className="kmb-row">
                  <span className="kmb-label">🎯 Mục tiêu {monthLabel.toLowerCase()} — Toàn team</span>
                  <span className="kmb-pct">{kpiPct}%</span>
                </div>
                <div className="kmb-track"><div className="kmb-fill" style={{width:`${kpiPct}%`}}/></div>
                <div className="kmb-details">
                  <span>{totalEnrolled} đã chốt / {totalTarget} mục tiêu</span>
                  <span>Còn {totalTarget-totalEnrolled} chỗ cần chốt</span>
                </div>
              </div>
              <div className="kpi-stats-row">
                <div className="kpi-stat"><div className="ks-n" style={{color:'var(--nedu)'}}>{totalEnrolled}</div><div className="ks-l">Đã chốt tháng này</div></div>
                <div className="kpi-stat"><div className="ks-n" style={{color:'var(--amber)'}}>{(totalRevenue/1000000).toFixed(0)}M</div><div className="ks-l">Doanh thu (₫)</div></div>
                <div className="kpi-stat"><div className="ks-n" style={{color:'var(--blue)'}}>{totalActiveLeads}</div><div className="ks-l">Lead đang theo</div></div>
                <div className="kpi-stat"><div className="ks-n" style={{color:'var(--purple)'}}>{Math.round(conversionRate)}%</div><div className="ks-l">Tỷ lệ chuyển đổi</div></div>
              </div>
              <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--t3)',fontFamily:'var(--mono)',marginBottom:10}}>🏆 Bảng xếp hạng</div>
              <div className="kpi-board">
                {sortedTeam.map((m,i) => {
                  const pct2 = Math.round((m.enrolled/m.target)*100);
                  const medals = ['🥇','🥈','🥉'];
                  const isHelp = pct2 < 40;
                  return (
                    <div key={m.id} className={`kb-row${m.isMe?' me':isHelp?' help':''}`}>
                      <div className="kb-rank">{medals[i]||i+1}</div>
                      <div className="kb-avatar" style={{background:m.color}}>{m.name.split(' ').pop()![0]}</div>
                      <div className="kb-info">
                        <div className="kb-name">{m.name} {m.isMe&&<span className="kbadge" style={{background:'var(--green-s)',color:'var(--nedu)'}}>Bạn</span>}{isHelp&&!m.isMe&&<span className="kbadge" style={{background:'var(--amber-s)',color:'var(--amber)'}}>Cần hỗ trợ</span>}</div>
                        <div className="kb-role">{m.role}{m.isMe?' (bạn)':''}</div>
                        <div className="kb-bar"><div className="kb-bar-fill" style={{width:`${Math.min(pct2,100)}%`,background:isHelp?'var(--amber)':m.isMe?'var(--nedu)':'#3B82F6'}}/></div>
                        <div className="kb-bar-lbl"><span>{m.enrolled}/{m.target} đã chốt</span><span>{pct2}%</span></div>
                      </div>
                      <div className="kb-right">
                        <div className="kb-enrolled">{m.enrolled}</div>
                        <div className="kb-target-lbl">/{m.target} mục tiêu</div>
                        <div className="kb-rev">{(m.revenue/1000000).toFixed(0)}M ₫</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {sortedTeam.filter(m=>Math.round((m.enrolled/m.target)*100)<40).length>0 && (
                <div style={{marginTop:16,background:'var(--amber-s)',border:'1.5px solid var(--amber-b)',borderRadius:'var(--rad)',padding:'14px 16px'}}>
                  <div style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--amber)',fontFamily:'var(--mono)',marginBottom:8}}>⚠ Cần hỗ trợ</div>
                  {sortedTeam.filter(m=>Math.round((m.enrolled/m.target)*100)<40).map(m=>(
                    <div key={m.id} style={{fontSize:13,color:'var(--t2)',marginBottom:4}}>
                      <strong style={{color:'var(--t1)'}}>{m.name}</strong> — {m.enrolled}/{m.target} · còn {m.target-m.enrolled} đơn để đạt mục tiêu
                    </div>
                  ))}
                </div>
              )}
              </>)}
            </div>
          </div>
        </div>
        );
      })()}

      {/* WIN CELEBRATION */}
      {showWin && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="wc-icon">🎉</div>
            <div className="wc-title">🎉 CHỐT DEAL THÀNH CÔNG!</div>
            <div className="wc-who">{winData.name} vừa đăng ký khóa học với Linh Nguyễn</div>
            <div className="wc-amount">{winData.amount.toLocaleString('vi-VN')} ₫</div>
            <div className="wc-course">{winData.course}</div>
            <div className="wc-team">📢 Cả team Nedu đều nhận được thông báo này</div>
            <button className="wc-close" onClick={()=>{setShowWin(false);showToast('🎊','Cả team đã nhận được thông báo!','Telegram · ops.nedu.vn');}}>🔥 Tuyệt vời! Tiếp tục nào</button>
          </div>
        </div>
      )}

      {/* CONFETTI */}
      {confetti.map(c => (
        <div key={c.id} className="conf" style={{
          left:`${c.left}%`, background:c.color,
          width:c.size, height:c.size,
          borderRadius:c.round?'50%':'2px',
          animationDuration:`${c.dur}s`, animationDelay:`${c.delay}s`
        }}/>
      ))}

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <div className="toast-icon">{toast.icon}</div>
          <div>
            <div className="toast-text">{toast.text}</div>
            {toast.sub && <div className="toast-sub">{toast.sub}</div>}
          </div>
        </div>
      )}
    </>
  );
}

// ─── SUB COMPONENTS ──────────────────────────────────

function CenterBody({t, guideChecks, profileCards, onToggleGuide, onSendNote, onEditNote, onDeleteNote, onToggleCourse, editingNotes, onStartEditNote, onCancelEditNote}: {
  t: Todo; guideChecks: Record<number,boolean>;
  profileCards: Record<number,ProfileCard>;
  onToggleGuide: (idx:number)=>void;
  onSendNote: (text:string)=>void;
  onEditNote: (idx:number,val:string)=>void;
  onDeleteNote: (idx:number)=>void;
  onToggleCourse: (cid:string)=>void;
  editingNotes: Record<string,string>;
  onStartEditNote: (idx:number,val:string)=>void;
  onCancelEditNote: (idx:number)=>void;
}) {
  const guide = GUIDES[t.stage];
  const pc = getProfilePct(t);
  const hasPC = profileCards[t.id]?.gen;
  const aiSumMap: Record<number,string> = {
    6:'Khách cũ 2022 — do dự vì <strong>tài chính và gia đình</strong>. Điểm test tăng 51→68. <strong>Sẵn sàng hơn nhiều</strong>. Hỏi "điều gì đã thay đổi trong 3 năm" trước khi pitch.',
    4:'2 lần tư vấn — lần 1 nhiệt tình, lần 2 <strong>objection giá</strong>. CEO phân tích ROI. <strong>Chuyển từ emotional pitch → business value.</strong> Dùng Hồ sơ AI.',
    5:'<strong>Đã quyết định</strong> — chỉ chờ thời điểm tài chính. Duy trì kết nối nhẹ nhàng.',
    7:'Lead <strong>Marketing mới</strong> — chưa có lịch sử tư vấn. Thu thập thông tin cơ bản trong cuộc gọi đầu.',
  };
  const aiTagsMap: Record<number,string[]> = {
    6:['Khách cũ','Điểm tăng','Sẵn sàng hơn'],
    4:['Objection giá','Cần góc ROI','Có Hồ sơ AI'],
    5:['Đã quyết định','Chờ chuyển khoản'],
    7:['Marketing lead','Chưa test','Cuộc gọi đầu'],
  };
  const realTL = t.timeline.filter(x=>!x.isDivider && x.note);
  const showAI = realTL.length >= 2 && aiSumMap[t.id];

  return (
    <>
      {t.testScore>0 && (
        <div className="test-pill">
          <div className="tp-score">{t.testScore}</div>
          <div><div className="tp-label">🧩 Điểm bài test</div><div className="tp-text">{t.testDesc}</div></div>
        </div>
      )}
      {t.sourceType==='marketing' && (
        <div style={{background:'var(--blue-s)',border:'1.5px solid var(--blue-b)',borderRadius:'var(--rads)',padding:'11px 13px',marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',color:'var(--blue)',fontFamily:'var(--mono)',letterSpacing:'.1em',marginBottom:5}}>📢 Lead từ Đội Marketing</div>
          <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.6}}>Lead này được Marketing team tạo từ <strong>{t.sourceCh}</strong>. Họ <strong>chưa qua bài test nedu.vn</strong> — cần thu thập thêm thông tin cơ bản trong cuộc gọi đầu tiên.</div>
        </div>
      )}
      {hasPC ? (
        <div className="profile-hint">
          <div className="ph-label" style={{color:'var(--purple)'}}>✨ Hồ sơ AI sẵn sàng — xem trong "Gọi & Hồ sơ"</div>
          <div className="ph-text" dangerouslySetInnerHTML={{__html:buildHintTxt(t)}}/>
        </div>
      ) : pc < 60 ? (
        <div className="profile-hint">
          <div className="ph-label">🧩 Hồ sơ {pc}%</div>
          <div className="ph-text">Điền thêm khi gọi → nhấn <strong>✨ Tạo Hồ sơ AI</strong> để AI tổng hợp cách tư vấn.</div>
        </div>
      ) : null}
      {guide && (
        <div className="guide-card" style={{borderColor:`${guide.color}30`,borderLeft:`4px solid ${guide.color}`}}>
          <div className="gc-eyebrow" style={{color:guide.color}}>
            <span style={{display:'block',width:3,height:11,background:guide.color,borderRadius:2}}/>
            {guide.eyebrow}
          </div>
          <div className="gc-title">{guide.title}</div>
          <div className="gc-script" dangerouslySetInnerHTML={{__html:guide.script}}/>
          <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--t3)',fontFamily:'var(--mono)',marginBottom:6}}>📋 Checklist</div>
          <div className="guide-list">
            {guide.steps.map((s,i) => (
              <div key={i} className={`guide-item${guideChecks[i]?' checked':''}`} onClick={()=>onToggleGuide(i)}>
                <div className="gi-box"/>
                <div className="gi-text">{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="history-card" style={{marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',fontFamily:'var(--mono)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>🕐 Lịch sử liên hệ</div>
        {showAI && (
          <div className="ai-summary">
            <div className="ais-hdr">
              <span style={{fontSize:15}}>🤖</span>
              <span className="ais-label">AI tóm tắt</span>
              <span className="ais-badge">{realTL.length} ghi chú</span>
            </div>
            <div className="ais-text" dangerouslySetInnerHTML={{__html:aiSumMap[t.id]}}/>
            {aiTagsMap[t.id] && <div className="ais-tags">{aiTagsMap[t.id].map(tag=><div key={tag} className="ais-tag">{tag}</div>)}</div>}
          </div>
        )}
        <TimelineList items={t.timeline}/>
      </div>
      <NoteMessenger
        t={t}
        onSendNote={onSendNote}
        onEditNote={onEditNote}
        onDeleteNote={onDeleteNote}
        onToggleCourse={onToggleCourse}
        editingNotes={editingNotes}
        onStartEditNote={onStartEditNote}
        onCancelEditNote={onCancelEditNote}
        scopeId="body"
      />
    </>
  );
}

function TimelineList({items}: {items: TLItem[]}) {
  return (
    <>
      {items.map((tl,i) => {
        if (tl.isDivider) return <div key={i} className="tl-divider">{tl.label}</div>;
        return (
          <div key={i} className="tl-item">
            <div className="tl-icon">{tl.icon}</div>
            <div className="tl-main">
              <div className="tl-top">
                <div className="tl-action">{tl.action}</div>
                {tl.who && tl.who!=='Hệ thống' && <div className="tl-who">✍ {tl.who}</div>}
              </div>
              <div className="tl-date">{tl.date}</div>
              {tl.note && <div className="tl-note">{tl.note}</div>}
            </div>
          </div>
        );
      })}
    </>
  );
}

function NoteMessenger({t, onSendNote, onEditNote, onDeleteNote, onToggleCourse, editingNotes, onStartEditNote, onCancelEditNote}: {
  t: Todo;
  onSendNote: (text:string)=>void;
  onEditNote: (idx:number,val:string)=>void;
  onDeleteNote: (idx:number)=>void;
  onToggleCourse: (cid:string)=>void;
  editingNotes: Record<string,string>;
  onStartEditNote: (idx:number,val:string)=>void;
  onCancelEditNote: (idx:number)=>void;
  scopeId?: string;
}) {
  const [input, setInput] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) { onSendNote(input); setInput(''); }
    }
  }

  return (
    <div className="nm-box">
      <div className="nm-header">
        <div className="nm-pulse"/>
        <div className="nm-hdr-text">
          <div className="nm-title">📝 Ghi chú cho người kế tiếp</div>
          <div className="nm-sub">Điền mỗi cuộc gọi — người sau đọc là hiểu ngay cần làm gì</div>
        </div>
        <div className="nm-count">{t.notes.length} ghi chú</div>
      </div>
      <div className="nm-list">
        {t.notes.length === 0
          ? <div className="nm-empty">Chưa có ghi chú · Gõ bên dưới và Enter để thêm</div>
          : t.notes.map((n,i) => {
            const eKey = `${t.id}-${i}`;
            const isEditing = eKey in editingNotes;
            return (
              <div key={i} className={`nm-bubble${isEditing?' editing':''}`}>
                {isEditing ? (
                  <>
                    <textarea className="nm-edit-ta"
                      value={editingNotes[eKey]}
                      onChange={e=>onStartEditNote(i,e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();onEditNote(i,editingNotes[eKey]);}}}
                      autoFocus/>
                    <div className="nm-edit-actions">
                      <button className="btn btn-danger btn-sm" onClick={()=>onDeleteNote(i)}>🗑 Xóa</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>onCancelEditNote(i)}>Hủy</button>
                      <button className="btn btn-primary btn-sm" onClick={()=>onEditNote(i,editingNotes[eKey])}>💾 Lưu</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="nm-btext">{n.text}</div>
                    <div className="nm-bmeta">
                      <span className="nm-bwho">✍ {n.who||'Linh Nguyễn'}</span>
                      <span className="nm-btime">{n.date}</span>
                      <button className="nm-bedit" onClick={()=>onStartEditNote(i,n.text)} title="Chỉnh sửa">✏️</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
      <div className="course-bar">
        <div className="cb-label">🎯 Khóa đang tư vấn — chọn để nhớ</div>
        <div className="cb-chips">
          {COURSES.map(c => (
            <div key={c.id} className={`course-chip${t.courses.includes(c.id)?' selected':''}`}
              onClick={()=>onToggleCourse(c.id)}>
              {c.emoji} {c.name}
            </div>
          ))}
        </div>
      </div>
      <div className="nm-input-bar">
        <textarea ref={taRef} className="nm-input" rows={1}
          placeholder="Ghi chú cho người kế tiếp... (Enter để lưu, Shift+Enter xuống dòng)"
          value={input} onChange={e=>{setInput(e.target.value);if(taRef.current){taRef.current.style.height='auto';taRef.current.style.height=Math.min(taRef.current.scrollHeight,96)+'px';}}}
          onKeyDown={handleKey}/>
        <button className="nm-send" onClick={()=>{if(input.trim()){onSendNote(input);setInput('');}}} title="Gửi">↑</button>
      </div>
    </div>
  );
}

// ─── CALL SCREEN ─────────────────────────────────────
function CallScreen({t, tab, onTabChange, onClose, onSaveClose, profileCards, editingFields, onEditField, onSavePF, onSaveBasic, onSetGender, onSetConsent, onMarkDirty, profileDirty, generatingProfile, onGenProfile, onRegenProfile, onSendNote, onEditNote, onDeleteNote, onToggleCourse, editingNotes, onStartEditNote, onCancelEditNote}: {
  t: Todo; tab: 'info'|'profile';
  onTabChange: (tab:'info'|'profile')=>void;
  onClose: ()=>void; onSaveClose: ()=>void;
  profileCards: Record<number,ProfileCard>;
  editingFields: Record<string,boolean>;
  onEditField: (key:string)=>void;
  onSavePF: (tid:number,key:string,val:string)=>void;
  onSaveBasic: (tid:number,key:string,val:string)=>void;
  onSetGender: (tid:number,gender:'male'|'female')=>void;
  onSetConsent: (tid:number,consent:boolean)=>void;
  onMarkDirty: ()=>void;
  profileDirty: boolean;
  generatingProfile: boolean;
  onGenProfile: (id:number)=>void;
  onRegenProfile: (id:number)=>void;
  onSendNote: (text:string)=>void;
  onEditNote: (idx:number,val:string)=>void;
  onDeleteNote: (idx:number)=>void;
  onToggleCourse: (cid:string)=>void;
  editingNotes: Record<string,string>;
  onStartEditNote: (idx:number,val:string)=>void;
  onCancelEditNote: (idx:number)=>void;
}) {
  const pc = getProfilePct(t);
  const nameWords = (t.name||'').trim().split(/\s+/).length;
  const initial = t.name.split(' ').pop()?.[0] || t.name[0];

  return (
    <div className="call-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="call-screen">
        <div className="cs-header">
          <button className="cs-back-btn" onClick={onClose}>←</button>
          <div className="cs-av" style={{background:t.color+'44'}}>{initial}</div>
          <div>
            <div className="cs-nm">{t.name}</div>
            <div className="cs-info">{t.sourceCh} · {t.days===0?'hôm nay':t.days+'ng'}</div>
          </div>
          <div className="cs-phone">
            <div className="cs-dot"/>
            <div className="cs-pnum">{t.phone}</div>
          </div>
        </div>
        <div className="cs-tabs">
          <div className={`cs-tab${tab==='info'?' on':''}`} onClick={()=>onTabChange('info')}>📋 Hồ Sơ</div>
          <div className={`cs-tab ptab${tab==='profile'?' on':''}`} onClick={()=>onTabChange('profile')}>✨ Hồ sơ AI</div>
        </div>
        <div className="cs-prog">
          <div className="csp-lbl">Hồ sơ</div>
          <div className="csp-bar"><div className="csp-fill" style={{width:`${pc}%`}}/></div>
          <div className="csp-pct">{pc}%</div>
        </div>

        {tab === 'info' ? (
          <div className="cs-body-grid">
            {/* Left col: profile fields */}
            <div className="cs-prof-col">
              {nameWords < 3 && (
                <div className="name-warn">⚠️ <span>Nhắc hỏi <strong>họ tên đầy đủ</strong> để tính Thần số học (cần ít nhất 3 từ)</span></div>
              )}
              <div className="ps-sec">
                <div className="ps-title filled">📋 Thông tin cơ bản</div>
                {[
                  {key:'name', label:'Họ và tên đầy đủ', icon:'👤', val:t.name, ph:'VD: Nguyễn Văn Nam'},
                  {key:'phone', label:'Điện thoại', icon:'📞', val:t.phone, ph:'0912 345 678'},
                  {key:'email', label:'Email', icon:'📧', val:t.email, ph:'example@gmail.com'},
                ].map(f => {
                  const fKey = `basic-${t.id}-${f.key}`;
                  const isEditing = editingFields[fKey];
                  return (
                    <div key={f.key} className={`pf-item filled${isEditing?' editing-field':''}`}>
                      <div className="pf-icon">{f.icon}</div>
                      <div className="pf-content">
                        <div className="pf-lbl">{f.label}</div>
                        {isEditing
                          ? <input className="pf-inp" defaultValue={f.val} autoFocus
                              onChange={e=>{if(e.target.value.trim()!==(f.val||'').trim())onMarkDirty();}}
                              onBlur={e=>onSaveBasic(t.id,f.key,e.target.value)}
                              onKeyDown={e=>{if(e.key==='Enter')(e.target as HTMLInputElement).blur();}}
                              placeholder={f.ph}/>
                          : <div className="pf-val">{f.val}</div>
                        }
                      </div>
                      {!isEditing && <button className="pf-pencil" onClick={()=>onEditField(fKey)} title="Chỉnh sửa">✏️</button>}
                    </div>
                  );
                })}
              </div>
              {profileDirty && profileCards[t.id]?.gen && (
                <div className="profile-dirty">
                  <div className="pd-text">✏️ <strong>Hồ sơ đã thay đổi</strong> — cập nhật Hồ sơ AI để tư vấn chính xác hơn</div>
                  <button className="btn btn-sm" style={{background:'var(--amber)',color:'#fff',flexShrink:0}} onClick={()=>onRegenProfile(t.id)}>↻ Cập nhật Hồ sơ AI</button>
                </div>
              )}
              <div className="ps-sec">
                <div className={`ps-title${PF_FIELDS.every(f=>(t.profile[f.key as keyof Profile]||'').trim())?' filled':''}`}>🧩 Hồ sơ cá nhân — điền khi gọi</div>
                {PF_FIELDS.map(f => {
                  const val = t.profile[f.key as keyof Profile] || '';
                  const filled = typeof val==='string' ? !!val.trim() : !!val;
                  const fKey = `pf-${t.id}-${f.key}`;
                  const isEditing = editingFields[fKey];
                  const age = f.key==='dob' && typeof val==='string' && val ? calcAge(val) : '';
                  return (
                    <div key={f.key} className={`pf-item${filled?' filled':''}${isEditing?' editing-field':''}`}>
                      <div className="pf-icon">{f.icon}</div>
                      <div className="pf-content">
                        <div className="pf-lbl">{f.label}{age && <span style={{color:'var(--green)',fontSize:9,fontFamily:'var(--mono)',marginLeft:3}}>{age}</span>}</div>
                        {filled && !isEditing
                          ? <div className="pf-val" onClick={()=>onEditField(fKey)}>{String(val)}</div>
                          : <input className="pf-inp" defaultValue={typeof val==='string' ? val : ''} autoFocus={isEditing}
                              placeholder={f.ph}
                              onChange={e=>{if(e.target.value.trim()!==(typeof val==='string'?val.trim():''))onMarkDirty();}}
                              onBlur={e=>onSavePF(t.id,f.key,e.target.value)}
                              onKeyDown={e=>{if(e.key==='Enter')(e.target as HTMLInputElement).blur();}}/>
                        }
                      </div>
                      {filled && !isEditing
                        ? <button className="pf-pencil" onClick={()=>onEditField(fKey)} title="Chỉnh sửa">✏️</button>
                        : <div className={`pf-tick${filled?' y':' n'}`}>{filled?'✓':'+'}</div>
                      }
                    </div>
                  );
                })}
                {/* Gender — bắt buộc để tính BaZi/Tử Vi/Nine Star Ki chính xác */}
                <div className={`pf-item${t.profile?.gender?' filled':''}`}>
                  <div className="pf-icon">⚥</div>
                  <div className="pf-content">
                    <div className="pf-lbl">Giới tính <span style={{color:'var(--red)',fontSize:9,fontFamily:'var(--mono)',marginLeft:3}}>bắt buộc</span></div>
                    <div style={{display:'flex',gap:8,marginTop:4}}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{flex:1,borderColor:t.profile?.gender==='male'?'var(--blue)':'var(--stone2)',background:t.profile?.gender==='male'?'var(--blue-b)':'transparent',color:t.profile?.gender==='male'?'var(--blue)':'var(--t2)'}}
                        onClick={()=>onSetGender(t.id,'male')}
                      >♂ Nam</button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{flex:1,borderColor:t.profile?.gender==='female'?'var(--pink, #EC4899)':'var(--stone2)',background:t.profile?.gender==='female'?'rgba(236,72,153,.1)':'transparent',color:t.profile?.gender==='female'?'#EC4899':'var(--t2)'}}
                        onClick={()=>onSetGender(t.id,'female')}
                      >♀ Nữ</button>
                    </div>
                  </div>
                  <div className={`pf-tick${t.profile?.gender?' y':' n'}`}>{t.profile?.gender?'✓':'+'}</div>
                </div>
                {/* AI Profile Consent — bắt buộc trước khi gọi vault */}
                <div className={`pf-item${t.aiProfileConsent?' filled':''}`}>
                  <div className="pf-icon">🛡️</div>
                  <div className="pf-content">
                    <div className="pf-lbl">Đồng ý tạo Hồ sơ AI <span style={{color:'var(--red)',fontSize:9,fontFamily:'var(--mono)',marginLeft:3}}>bắt buộc</span></div>
                    <div style={{fontSize:11,color:'var(--t2)',lineHeight:1.5,marginTop:3}}>
                      Prospect đã đồng ý để mình dùng dữ liệu ngày/giờ sinh để tạo profile AI.
                    </div>
                    <label style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:6,cursor:'pointer',fontSize:12}}>
                      <input
                        type="checkbox"
                        checked={!!t.aiProfileConsent}
                        onChange={e=>onSetConsent(t.id,e.target.checked)}
                      />
                      <span>Đã có consent</span>
                    </label>
                  </div>
                  <div className={`pf-tick${t.aiProfileConsent?' y':' n'}`}>{t.aiProfileConsent?'✓':'+'}</div>
                </div>
              </div>
            </div>
            {/* Right col: history */}
            <div className="cs-hist-col">
              <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--t3)',fontFamily:'var(--mono)',marginBottom:10}}>📋 Lịch sử liên hệ</div>
              <div style={{flex:1,overflowY:'auto',marginBottom:12}}>
                <TimelineList items={t.timeline}/>
              </div>
              <NoteMessenger t={t} onSendNote={onSendNote} onEditNote={onEditNote}
                onDeleteNote={onDeleteNote} onToggleCourse={onToggleCourse}
                editingNotes={editingNotes} onStartEditNote={onStartEditNote}
                onCancelEditNote={onCancelEditNote} scopeId="cs-hist"/>
            </div>
          </div>
        ) : (
          <div className="cs-ptab-body">
            {/* Left col: profile card */}
            <div className="pcard-col">
              <ProfileCardView t={t} profileCards={profileCards} generatingProfile={generatingProfile} onGenProfile={onGenProfile} onSwitchToInfo={()=>onTabChange('info')}/>
            </div>
            {/* Right col: history */}
            <div className="cs-hist-col" style={{borderLeft:'1px solid var(--stone2)'}}>
              <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--t3)',fontFamily:'var(--mono)',marginBottom:10}}>📋 Lịch sử liên hệ</div>
              <div style={{flex:1,overflowY:'auto',marginBottom:12}}>
                <TimelineList items={t.timeline}/>
              </div>
              <NoteMessenger t={t} onSendNote={onSendNote} onEditNote={onEditNote}
                onDeleteNote={onDeleteNote} onToggleCourse={onToggleCourse}
                editingNotes={editingNotes} onStartEditNote={onStartEditNote}
                onCancelEditNote={onCancelEditNote} scopeId="cs-hist2"/>
            </div>
          </div>
        )}

        <div className="cs-foot">
          <div className="cf-tip">💡 Điền ngày sinh + giờ sinh → <strong>Tạo Hồ sơ AI tự động</strong></div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary btn-sm" onClick={onSaveClose}>💾 Lưu & Đóng</button>
        </div>
      </div>
    </div>
  );
}

function ProfileCardView({t, profileCards, generatingProfile, onGenProfile, onSwitchToInfo}: {
  t: Todo; profileCards: Record<number,ProfileCard>;
  generatingProfile: boolean; onGenProfile: (id:number)=>void;
  onSwitchToInfo: ()=>void;
}) {
  const pc = profileCards[t.id];
  const hasDOB = (t.profile?.dob||'').trim();
  const hasGender = !!t.profile?.gender;
  const hasConsent = !!t.aiProfileConsent;
  const canGenerate = hasDOB && hasGender && hasConsent;
  const missing: string[] = [];
  if (!hasDOB) missing.push('Ngày sinh');
  if (!hasGender) missing.push('Giới tính');
  if (!hasConsent) missing.push('Đồng ý');

  if (generatingProfile) {
    return (
      <div className="pcard-loading">
        <div className="pl-spin"/>
        <div className="pl-txt">Đang tổng hợp...</div>
        <div className="pl-sub">BaZi · Tử Vi · Numerology · Nine Star Ki · Western Astrology</div>
        <div style={{fontSize:10,color:'var(--t3)',marginTop:6}}>Có thể mất 10-15s</div>
      </div>
    );
  }
  if (!pc) {
    if (canGenerate) {
      return (
        <div style={{padding:24,textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:10}}>✨</div>
          <div style={{fontSize:15,fontWeight:800,marginBottom:7}}>Sẵn sàng tạo Profile</div>
          <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.6,maxWidth:240,margin:'0 auto 16px'}}>5 hệ thống (BaZi, Tử Vi, Nine Star Ki, Numerology, Western Astrology) → briefing sales cá nhân hóa</div>
          <div style={{fontSize:10,fontFamily:'var(--mono)',background:'var(--stone)',padding:'6px 12px',borderRadius:7,color:'var(--t2)',marginBottom:16,display:'inline-block'}}>
            ✅ {t.profile?.dob} {t.profile?.birthTime?'· '+t.profile.birthTime:''} · {t.profile?.gender==='male'?'♂ Nam':'♀ Nữ'} · 🛡️ Đồng ý
          </div><br/>
          <button className="btn btn-ghost" style={{borderColor:'var(--purple-b)',color:'var(--purple)'}} onClick={()=>onGenProfile(t.id)}>✨ Tạo Hồ sơ AI</button>
        </div>
      );
    }
    return (
      <div className="pcard-empty">
        <div className="pe-icon">🧩</div>
        <div className="pe-title">Chưa đủ thông tin</div>
        <div className="pe-sub">Cần điền trước khi tạo profile:</div>
        <div className="pe-req">{missing.join(' · ')}</div>
        <button className="btn btn-ghost btn-sm" onClick={onSwitchToInfo}>← Điền hồ sơ</button>
      </div>
    );
  }

  return (
    <>
      <div className="pcard-hero">
        <div className="pch-ey">NhiLe · Hồ sơ AI · AI</div>
        <div className="pch-name">{t.name}</div>
        <div className="pch-sub">{t.profile?.dob||''} {t.profile?.birthTime?'· '+t.profile.birthTime:''}</div>
        <div className="pch-quote">{pc.q}</div>
        <div className="pch-chips">
          <div className="pch-chip" title="Bát tự — Nhật Chủ"><em>八 {pc.dm}</em></div>
          <div className="pch-chip" title="Thần số học — Life Path">🔢 {pc.lp}</div>
          <div className="pch-chip" title="Nine Star Ki — Year Star">✨ {pc.nk}</div>
          <div className="pch-chip" title="Cung hoàng đạo — Sun sign">♈ {pc.sun}</div>
          <div className="pch-chip" title="Tử vi — Mệnh Cục">🀄 {pc.menh}</div>
        </div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{color:'var(--purple)'}}>
          <span style={{background:'var(--purple)',width:3,height:11,borderRadius:2,display:'inline-block',marginRight:5}}/>
          🧬 Tính cách cốt lõi
        </div>
        <div className="pib-txt">{pc.core}</div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{color:'var(--blue)'}}>
          <span style={{background:'var(--blue)',width:3,height:11,borderRadius:2,display:'inline-block',marginRight:5}}/>
          💬 Cách nói chuyện
        </div>
        <div className="pib-rows">
          {pc.talk.map((h,i) => (
            <div key={i} className="pib-row">
              {h.y?'✅':'❌'} <span dangerouslySetInnerHTML={{__html:h.t}}/>
            </div>
          ))}
        </div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{color:'var(--green)'}}>
          <span style={{background:'var(--green)',width:3,height:11,borderRadius:2,display:'inline-block',marginRight:5}}/>
          ❤️ Nhu cầu thực sự
        </div>
        <div className="pib-txt">{pc.need}</div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{color:'var(--amber)'}}>
          <span style={{background:'var(--amber)',width:3,height:11,borderRadius:2,display:'inline-block',marginRight:5}}/>
          ⏰ Timing hiện tại
        </div>
        <div className="pib-txt">{pc.timing}</div>
      </div>
      <div className="pcard-opening">
        <div className="po-lbl">🎯 Câu mở đầu được khuyến nghị</div>
        <div className="po-txt">{pc.opening}</div>
      </div>
    </>
  );
}
