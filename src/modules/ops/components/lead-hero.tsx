import type { Todo } from '@modules/ops/types'
import { COURSES } from '@modules/ops/constants/courses'

export function LeadHero({ t, onCall, onXfer, onEnroll }: {
  t: Todo
  onCall: (id: number) => void
  onXfer: (id: number) => void
  onEnroll: (id: number) => void
}) {
  const isMarketing = t.sourceType === 'marketing'
  const srcBg = isMarketing ? 'var(--blue-s)' : 'var(--green-s)'
  const srcBr = isMarketing ? 'var(--blue-b)' : 'var(--green-b)'
  const srcCl = isMarketing ? 'var(--blue)' : 'var(--green)'
  const srcLbl = isMarketing ? `📢 Quảng cáo · ${t.sourceCh}` : `🌐 Tự đến · ${t.sourceCh}`
  const initial = t.name.split(' ').pop()?.[0] || t.name[0]
  return (
    <div className="lead-hero">
      <div className="lh-row">
        <div className="lh-avatar" style={{ background: t.color }}>{initial}</div>
        <div className="lh-meta">
          <div className="lh-name">{t.name}</div>
          <div className="lh-contact">
            <span>📞 {t.phone}</span><span>📧 {t.email}</span>
          </div>
          <div className="lh-tags">
            <span className="lh-tag" style={{ background: srcBg, border: `1px solid ${srcBr}`, color: srcCl }}>{srcLbl}</span>
            <span className="lh-tag" style={{ background: 'var(--stone)', border: '1px solid var(--stone2)', color: 'var(--t2)' }}>{t.days === 0 ? 'Hôm nay' : t.days + ' ngày trước'}</span>
            {t.testScore > 0
              ? <span className="lh-tag" style={{ background: 'var(--green-s)', border: '1px solid var(--green-b)', color: 'var(--nedu)' }}>Test: {t.testScore}/100</span>
              : <span className="lh-tag" style={{ background: 'var(--amber-s)', border: '1px solid var(--amber-b)', color: 'var(--amber)' }}>⚠ Chưa làm test</span>
            }
          </div>
          {(t.courses || []).length > 0 && (
            <div className="course-badges">
              {(t.courses || []).map(cid => {
                const c = COURSES.find(x => x.id === cid)
                return c ? <div key={cid} className="course-badge">{c.emoji} {c.name}</div> : null
              })}
            </div>
          )}
        </div>
        <div className="lh-actions">
          {t.stage <= 5 && <button className="btn btn-call btn-sm" onClick={() => onCall(t.id)}>📞 Gọi & Hồ sơ</button>}
          <button className="btn btn-ghost btn-sm" onClick={() => onXfer(t.id)} title="Chuyển case hoặc Co-deal">↔ Co-deal</button>
          {t.stage === 4 && <button className="btn btn-primary btn-sm" onClick={() => onEnroll(t.id)}>✅ Đánh dấu đã chốt</button>}
        </div>
      </div>
    </div>
  )
}
