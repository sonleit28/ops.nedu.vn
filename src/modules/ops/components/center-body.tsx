import type { Todo, ProfileCard } from '@modules/ops/types'
import { GUIDES } from '@modules/ops/constants/funnel'
import { getProfilePct, buildHintTxt } from '@modules/ops/utils/lead-helpers'
import { TimelineList } from './timeline-list'
import { NoteMessenger } from './note-messenger'

export function CenterBody({ t, guideChecks, profileCards, onToggleGuide, onSendNote, onEditNote, onDeleteNote, onToggleCourse, editingNotes, onStartEditNote, onCancelEditNote }: {
  t: Todo
  guideChecks: Record<number, boolean>
  profileCards: Record<number, ProfileCard>
  onToggleGuide: (idx: number) => void
  onSendNote: (text: string) => void
  onEditNote: (idx: number, val: string) => void
  onDeleteNote: (idx: number) => void
  onToggleCourse: (cid: string) => void
  editingNotes: Record<string, string>
  onStartEditNote: (idx: number, val: string) => void
  onCancelEditNote: (idx: number) => void
}) {
  const guide = GUIDES[t.stage]
  const pc = getProfilePct(t)
  const hasPC = profileCards[t.id]?.gen
  const aiSumMap: Record<number, string> = {
    6: 'Khách cũ 2022 — do dự vì <strong>tài chính và gia đình</strong>. Điểm test tăng 51→68. <strong>Sẵn sàng hơn nhiều</strong>. Hỏi "điều gì đã thay đổi trong 3 năm" trước khi pitch.',
    4: '2 lần tư vấn — lần 1 nhiệt tình, lần 2 <strong>objection giá</strong>. CEO phân tích ROI. <strong>Chuyển từ emotional pitch → business value.</strong> Dùng Hồ sơ AI.',
    5: '<strong>Đã quyết định</strong> — chỉ chờ thời điểm tài chính. Duy trì kết nối nhẹ nhàng.',
    7: 'Lead <strong>Marketing mới</strong> — chưa có lịch sử tư vấn. Thu thập thông tin cơ bản trong cuộc gọi đầu.',
  }
  const aiTagsMap: Record<number, string[]> = {
    6: ['Khách cũ', 'Điểm tăng', 'Sẵn sàng hơn'],
    4: ['Objection giá', 'Cần góc ROI', 'Có Hồ sơ AI'],
    5: ['Đã quyết định', 'Chờ chuyển khoản'],
    7: ['Marketing lead', 'Chưa test', 'Cuộc gọi đầu'],
  }
  const realTL = t.timeline.filter(x => !x.isDivider && x.note)
  const showAI = realTL.length >= 2 && aiSumMap[t.id]

  return (
    <>
      {t.testScore > 0 && (
        <div className="test-pill">
          <div className="tp-score">{t.testScore}</div>
          <div><div className="tp-label">🧩 Điểm bài test</div><div className="tp-text">{t.testDesc}</div></div>
        </div>
      )}
      {t.sourceType === 'marketing' && (
        <div style={{ background: 'var(--blue-s)', border: '1.5px solid var(--blue-b)', borderRadius: 'var(--rads)', padding: '11px 13px', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--blue)', fontFamily: 'var(--mono)', letterSpacing: '.1em', marginBottom: 5 }}>📢 Lead từ Đội Marketing</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>Lead này được Marketing team tạo từ <strong>{t.sourceCh}</strong>. Họ <strong>chưa qua bài test nedu.vn</strong> — cần thu thập thêm thông tin cơ bản trong cuộc gọi đầu tiên.</div>
        </div>
      )}
      {hasPC ? (
        <div className="profile-hint">
          <div className="ph-label" style={{ color: 'var(--purple)' }}>✨ Hồ sơ AI sẵn sàng — xem trong "Gọi & Hồ sơ"</div>
          <div className="ph-text" dangerouslySetInnerHTML={{ __html: buildHintTxt(t) }} />
        </div>
      ) : pc < 60 ? (
        <div className="profile-hint">
          <div className="ph-label">🧩 Hồ sơ {pc}%</div>
          <div className="ph-text">Điền thêm khi gọi → nhấn <strong>✨ Tạo Hồ sơ AI</strong> để AI tổng hợp cách tư vấn.</div>
        </div>
      ) : null}
      {guide && (
        <div className="guide-card" style={{ borderColor: `${guide.color}30`, borderLeft: `4px solid ${guide.color}` }}>
          <div className="gc-eyebrow" style={{ color: guide.color }}>
            <span style={{ display: 'block', width: 3, height: 11, background: guide.color, borderRadius: 2 }} />
            {guide.eyebrow}
          </div>
          <div className="gc-title">{guide.title}</div>
          <div className="gc-script" dangerouslySetInnerHTML={{ __html: guide.script }} />
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 6 }}>📋 Checklist</div>
          <div className="guide-list">
            {guide.steps.map((s, i) => (
              <div key={i} className={`guide-item${guideChecks[i] ? ' checked' : ''}`} onClick={() => onToggleGuide(i)}>
                <div className="gi-box" />
                <div className="gi-text">{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="history-card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>🕐 Lịch sử liên hệ</div>
        {showAI && (
          <div className="ai-summary">
            <div className="ais-hdr">
              <span style={{ fontSize: 15 }}>🤖</span>
              <span className="ais-label">AI tóm tắt</span>
              <span className="ais-badge">{realTL.length} ghi chú</span>
            </div>
            <div className="ais-text" dangerouslySetInnerHTML={{ __html: aiSumMap[t.id] }} />
            {aiTagsMap[t.id] && <div className="ais-tags">{aiTagsMap[t.id].map(tag => <div key={tag} className="ais-tag">{tag}</div>)}</div>}
          </div>
        )}
        <TimelineList items={t.timeline} />
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
  )
}
