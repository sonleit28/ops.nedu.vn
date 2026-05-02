import type { Todo, ProfileCard } from '@modules/ops/types'

export function ProfileCardView({ t, profileCards, generatingProfile, onGenProfile, onSwitchToInfo }: {
  t: Todo
  profileCards: Record<number, ProfileCard>
  generatingProfile: boolean
  onGenProfile: (id: number) => void
  onSwitchToInfo: () => void
}) {
  const pc = profileCards[t.id]
  const hasDOB = (t.profile?.dob || '').trim()
  const hasGender = !!t.profile?.gender
  const hasConsent = !!t.aiProfileConsent
  const canGenerate = hasDOB && hasGender && hasConsent
  const missing: string[] = []
  if (!hasDOB) missing.push('Ngày sinh')
  if (!hasGender) missing.push('Giới tính')
  if (!hasConsent) missing.push('Đồng ý')

  if (generatingProfile) {
    return (
      <div className="pcard-loading">
        <div className="pl-spin" />
        <div className="pl-txt">Đang tổng hợp...</div>
        <div className="pl-sub">BaZi · Tử Vi · Numerology · Nine Star Ki · Western Astrology</div>
        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>Có thể mất 10-15s</div>
      </div>
    )
  }
  if (!pc) {
    if (canGenerate) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✨</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 7 }}>Sẵn sàng tạo Profile</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, maxWidth: 240, margin: '0 auto 16px' }}>5 hệ thống (BaZi, Tử Vi, Nine Star Ki, Numerology, Western Astrology) → briefing sales cá nhân hóa</div>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', background: 'var(--stone)', padding: '6px 12px', borderRadius: 7, color: 'var(--t2)', marginBottom: 16, display: 'inline-block' }}>
            ✅ {t.profile?.dob} {t.profile?.birthTime ? '· ' + t.profile.birthTime : ''} · {t.profile?.gender === 'male' ? '♂ Nam' : '♀ Nữ'} · 🛡️ Đồng ý
          </div><br />
          <button className="btn btn-ghost" style={{ borderColor: 'var(--purple-b)', color: 'var(--purple)' }} onClick={() => onGenProfile(t.id)}>✨ Tạo Hồ sơ AI</button>
        </div>
      )
    }
    return (
      <div className="pcard-empty">
        <div className="pe-icon">🧩</div>
        <div className="pe-title">Chưa đủ thông tin</div>
        <div className="pe-sub">Cần điền trước khi tạo profile:</div>
        <div className="pe-req">{missing.join(' · ')}</div>
        <button className="btn btn-ghost btn-sm" onClick={onSwitchToInfo}>← Điền hồ sơ</button>
      </div>
    )
  }

  return (
    <>
      <div className="pcard-hero">
        <div className="pch-ey">NhiLe · Hồ sơ AI · AI</div>
        <div className="pch-name">{t.name}</div>
        <div className="pch-sub">{t.profile?.dob || ''} {t.profile?.birthTime ? '· ' + t.profile.birthTime : ''}</div>
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
        <div className="pib-lbl" style={{ color: 'var(--purple)' }}>
          <span style={{ background: 'var(--purple)', width: 3, height: 11, borderRadius: 2, display: 'inline-block', marginRight: 5 }} />
          🧬 Tính cách cốt lõi
        </div>
        <div className="pib-txt">{pc.core}</div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{ color: 'var(--blue)' }}>
          <span style={{ background: 'var(--blue)', width: 3, height: 11, borderRadius: 2, display: 'inline-block', marginRight: 5 }} />
          💬 Cách nói chuyện
        </div>
        <div className="pib-rows">
          {pc.talk.map((h, i) => (
            <div key={i} className="pib-row">
              {h.y ? '✅' : '❌'} <span dangerouslySetInnerHTML={{ __html: h.t }} />
            </div>
          ))}
        </div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{ color: 'var(--green)' }}>
          <span style={{ background: 'var(--green)', width: 3, height: 11, borderRadius: 2, display: 'inline-block', marginRight: 5 }} />
          ❤️ Nhu cầu thực sự
        </div>
        <div className="pib-txt">{pc.need}</div>
      </div>
      <div className="pi-blk">
        <div className="pib-lbl" style={{ color: 'var(--amber)' }}>
          <span style={{ background: 'var(--amber)', width: 3, height: 11, borderRadius: 2, display: 'inline-block', marginRight: 5 }} />
          ⏰ Timing hiện tại
        </div>
        <div className="pib-txt">{pc.timing}</div>
      </div>
      <div className="pcard-opening">
        <div className="po-lbl">🎯 Câu mở đầu được khuyến nghị</div>
        <div className="po-txt">{pc.opening}</div>
      </div>
    </>
  )
}
