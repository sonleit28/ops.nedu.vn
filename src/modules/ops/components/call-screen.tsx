import type { Todo, Profile, ProfileCard } from '@modules/ops/types'
import { PF_FIELDS } from '@modules/ops/constants/ui'
import { calcAge, getProfilePct } from '@modules/ops/utils/lead-helpers'
import { TimelineList } from './timeline-list'
import { NoteMessenger } from './note-messenger'
import { ProfileCardView } from './profile-card-view'

export function CallScreen({ t, tab, onTabChange, onClose, onSaveClose, profileCards, editingFields, onEditField, onSavePF, onSaveBasic, onSetGender, onSetConsent, onMarkDirty, profileDirty, generatingProfile, onGenProfile, onRegenProfile, onSendNote, onEditNote, onDeleteNote, onToggleCourse, editingNotes, onStartEditNote, onCancelEditNote }: {
  t: Todo
  tab: 'info' | 'profile'
  onTabChange: (tab: 'info' | 'profile') => void
  onClose: () => void
  onSaveClose: () => void
  profileCards: Record<number, ProfileCard>
  editingFields: Record<string, boolean>
  onEditField: (key: string) => void
  onSavePF: (tid: number, key: string, val: string) => void
  onSaveBasic: (tid: number, key: string, val: string) => void
  onSetGender: (tid: number, gender: 'male' | 'female') => void
  onSetConsent: (tid: number, consent: boolean) => void
  onMarkDirty: () => void
  profileDirty: boolean
  generatingProfile: boolean
  onGenProfile: (id: number) => void
  onRegenProfile: (id: number) => void
  onSendNote: (text: string) => void
  onEditNote: (idx: number, val: string) => void
  onDeleteNote: (idx: number) => void
  onToggleCourse: (cid: string) => void
  editingNotes: Record<string, string>
  onStartEditNote: (idx: number, val: string) => void
  onCancelEditNote: (idx: number) => void
}) {
  const pc = getProfilePct(t)
  const nameWords = (t.name || '').trim().split(/\s+/).length
  const initial = t.name.split(' ').pop()?.[0] || t.name[0]

  return (
    <div className="call-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="call-screen">
        <div className="cs-header">
          <button className="cs-back-btn" onClick={onClose}>←</button>
          <div className="cs-av" style={{ background: t.color + '44' }}>{initial}</div>
          <div>
            <div className="cs-nm">{t.name}</div>
            <div className="cs-info">{t.sourceCh} · {t.days === 0 ? 'hôm nay' : t.days + 'ng'}</div>
          </div>
          <div className="cs-phone">
            <div className="cs-dot" />
            <div className="cs-pnum">{t.phone}</div>
          </div>
        </div>
        <div className="cs-tabs">
          <div className={`cs-tab${tab === 'info' ? ' on' : ''}`} onClick={() => onTabChange('info')}>📋 Hồ Sơ</div>
          <div className={`cs-tab ptab${tab === 'profile' ? ' on' : ''}`} onClick={() => onTabChange('profile')}>✨ Hồ sơ AI</div>
        </div>
        <div className="cs-prog">
          <div className="csp-lbl">Hồ sơ</div>
          <div className="csp-bar"><div className="csp-fill" style={{ width: `${pc}%` }} /></div>
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
                  { key: 'name', label: 'Họ và tên đầy đủ', icon: '👤', val: t.name, ph: 'VD: Nguyễn Văn Nam' },
                  { key: 'phone', label: 'Điện thoại', icon: '📞', val: t.phone, ph: '0912 345 678' },
                  { key: 'email', label: 'Email', icon: '📧', val: t.email, ph: 'example@gmail.com' },
                ].map(f => {
                  const fKey = `basic-${t.id}-${f.key}`
                  const isEditing = editingFields[fKey]
                  return (
                    <div key={f.key} className={`pf-item filled${isEditing ? ' editing-field' : ''}`}>
                      <div className="pf-icon">{f.icon}</div>
                      <div className="pf-content">
                        <div className="pf-lbl">{f.label}</div>
                        {isEditing
                          ? <input className="pf-inp" defaultValue={f.val} autoFocus
                              onChange={e => { if (e.target.value.trim() !== (f.val || '').trim()) onMarkDirty() }}
                              onBlur={e => onSaveBasic(t.id, f.key, e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                              placeholder={f.ph} />
                          : <div className="pf-val">{f.val}</div>
                        }
                      </div>
                      {!isEditing && <button className="pf-pencil" onClick={() => onEditField(fKey)} title="Chỉnh sửa">✏️</button>}
                    </div>
                  )
                })}
              </div>
              {profileDirty && profileCards[t.id]?.gen && (
                <div className="profile-dirty">
                  <div className="pd-text">✏️ <strong>Hồ sơ đã thay đổi</strong> — cập nhật Hồ sơ AI để tư vấn chính xác hơn</div>
                  <button className="btn btn-sm" style={{ background: 'var(--amber)', color: '#fff', flexShrink: 0 }} onClick={() => onRegenProfile(t.id)}>↻ Cập nhật Hồ sơ AI</button>
                </div>
              )}
              <div className="ps-sec">
                <div className={`ps-title${PF_FIELDS.every(f => (t.profile[f.key as keyof Profile] || '').trim()) ? ' filled' : ''}`}>🧩 Hồ sơ cá nhân — điền khi gọi</div>
                {PF_FIELDS.map(f => {
                  const val = t.profile[f.key as keyof Profile] || ''
                  const filled = typeof val === 'string' ? !!val.trim() : !!val
                  const fKey = `pf-${t.id}-${f.key}`
                  const isEditing = editingFields[fKey]
                  const age = f.key === 'dob' && typeof val === 'string' && val ? calcAge(val) : ''
                  return (
                    <div key={f.key} className={`pf-item${filled ? ' filled' : ''}${isEditing ? ' editing-field' : ''}`}>
                      <div className="pf-icon">{f.icon}</div>
                      <div className="pf-content">
                        <div className="pf-lbl">{f.label}{age && <span style={{ color: 'var(--green)', fontSize: 9, fontFamily: 'var(--mono)', marginLeft: 3 }}>{age}</span>}</div>
                        {filled && !isEditing
                          ? <div className="pf-val" onClick={() => onEditField(fKey)}>{String(val)}</div>
                          : <input className="pf-inp" defaultValue={typeof val === 'string' ? val : ''} autoFocus={isEditing}
                              placeholder={f.ph}
                              onChange={e => { if (e.target.value.trim() !== (typeof val === 'string' ? val.trim() : '')) onMarkDirty() }}
                              onBlur={e => onSavePF(t.id, f.key, e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} />
                        }
                      </div>
                      {filled && !isEditing
                        ? <button className="pf-pencil" onClick={() => onEditField(fKey)} title="Chỉnh sửa">✏️</button>
                        : <div className={`pf-tick${filled ? ' y' : ' n'}`}>{filled ? '✓' : '+'}</div>
                      }
                    </div>
                  )
                })}
                {/* Gender — bắt buộc để tính BaZi/Tử Vi/Nine Star Ki chính xác */}
                <div className={`pf-item${t.profile?.gender ? ' filled' : ''}`}>
                  <div className="pf-icon">⚥</div>
                  <div className="pf-content">
                    <div className="pf-lbl">Giới tính <span style={{ color: 'var(--red)', fontSize: 9, fontFamily: 'var(--mono)', marginLeft: 3 }}>bắt buộc</span></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, borderColor: t.profile?.gender === 'male' ? 'var(--blue)' : 'var(--stone2)', background: t.profile?.gender === 'male' ? 'var(--blue-b)' : 'transparent', color: t.profile?.gender === 'male' ? 'var(--blue)' : 'var(--t2)' }}
                        onClick={() => onSetGender(t.id, 'male')}
                      >♂ Nam</button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ flex: 1, borderColor: t.profile?.gender === 'female' ? 'var(--pink, #EC4899)' : 'var(--stone2)', background: t.profile?.gender === 'female' ? 'rgba(236,72,153,.1)' : 'transparent', color: t.profile?.gender === 'female' ? '#EC4899' : 'var(--t2)' }}
                        onClick={() => onSetGender(t.id, 'female')}
                      >♀ Nữ</button>
                    </div>
                  </div>
                  <div className={`pf-tick${t.profile?.gender ? ' y' : ' n'}`}>{t.profile?.gender ? '✓' : '+'}</div>
                </div>
                {/* AI Profile Consent — bắt buộc trước khi gọi vault */}
                <div className={`pf-item${t.aiProfileConsent ? ' filled' : ''}`}>
                  <div className="pf-icon">🛡️</div>
                  <div className="pf-content">
                    <div className="pf-lbl">Đồng ý tạo Hồ sơ AI <span style={{ color: 'var(--red)', fontSize: 9, fontFamily: 'var(--mono)', marginLeft: 3 }}>bắt buộc</span></div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.5, marginTop: 3 }}>
                      Prospect đã đồng ý để mình dùng dữ liệu ngày/giờ sinh để tạo profile AI.
                    </div>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer', fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={!!t.aiProfileConsent}
                        onChange={e => onSetConsent(t.id, e.target.checked)}
                      />
                      <span>Đã có consent</span>
                    </label>
                  </div>
                  <div className={`pf-tick${t.aiProfileConsent ? ' y' : ' n'}`}>{t.aiProfileConsent ? '✓' : '+'}</div>
                </div>
              </div>
            </div>
            {/* Right col: history */}
            <div className="cs-hist-col">
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 10 }}>📋 Lịch sử liên hệ</div>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                <TimelineList items={t.timeline} />
              </div>
              <NoteMessenger t={t} onSendNote={onSendNote} onEditNote={onEditNote}
                onDeleteNote={onDeleteNote} onToggleCourse={onToggleCourse}
                editingNotes={editingNotes} onStartEditNote={onStartEditNote}
                onCancelEditNote={onCancelEditNote} scopeId="cs-hist" />
            </div>
          </div>
        ) : (
          <div className="cs-ptab-body">
            {/* Left col: profile card */}
            <div className="pcard-col">
              <ProfileCardView t={t} profileCards={profileCards} generatingProfile={generatingProfile} onGenProfile={onGenProfile} onSwitchToInfo={() => onTabChange('info')} />
            </div>
            {/* Right col: history */}
            <div className="cs-hist-col" style={{ borderLeft: '1px solid var(--stone2)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t3)', fontFamily: 'var(--mono)', marginBottom: 10 }}>📋 Lịch sử liên hệ</div>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                <TimelineList items={t.timeline} />
              </div>
              <NoteMessenger t={t} onSendNote={onSendNote} onEditNote={onEditNote}
                onDeleteNote={onDeleteNote} onToggleCourse={onToggleCourse}
                editingNotes={editingNotes} onStartEditNote={onStartEditNote}
                onCancelEditNote={onCancelEditNote} scopeId="cs-hist2" />
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
  )
}
