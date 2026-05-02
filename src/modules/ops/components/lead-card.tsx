import React from 'react'
import type { Todo } from '@modules/ops/types'

export function LeadCard({ t, activeId, onSelect, onToggleDone }: {
  t: Todo
  activeId: number | null
  onSelect: (id: number) => void
  onToggleDone: (e: React.MouseEvent, id: number) => void
}) {
  const isA = t.id === activeId
  const uc = t.priority === 'urgent' ? 'urgent' : t.badgeColor === 'amber' ? 'warn' : ''
  const bb: Record<string, string> = { red: 'var(--red-b)', amber: 'var(--amber-b)', blue: 'var(--blue-b)', green: 'var(--green-b)' }
  const bc: Record<string, string> = { red: 'var(--red)', amber: 'var(--amber)', blue: 'var(--blue)', green: 'var(--green)' }
  const srcBg = t.sourceType === 'marketing' ? 'var(--blue-b)' : 'var(--stone)'
  const srcCl = t.sourceType === 'marketing' ? 'var(--blue)' : 'var(--t3)'
  const srcLbl = t.sourceType === 'marketing' ? '📢 Quảng cáo' : '🌐 Tự đến'
  // Hot=đỏ, Warm=vàng, Cold=xanh dương (lấy từ metadata.temperature).
  // Undefined: không tô viền (lead chưa được phân loại).
  const tempBorder = t.temperature === 'hot' ? 'var(--red)'
    : t.temperature === 'warm' ? 'var(--amber)'
    : t.temperature === 'cold' ? 'var(--blue)'
    : undefined
  const tempBadge = t.temperature === 'hot'
    ? { bg: 'var(--red-s)', fg: 'var(--red)', label: '🔥 Lead nóng' }
    : t.temperature === 'warm'
    ? { bg: 'var(--amber-s)', fg: 'var(--amber)', label: '🌤 Lead ấm' }
    : t.temperature === 'cold'
    ? { bg: 'var(--blue-s)', fg: 'var(--blue)', label: '❄ Lead lạnh' }
    : null
  return (
    <div
      className={`action-item ${uc} ${isA ? 'active' : ''} ${t.done ? 'done' : ''}`}
      onClick={() => onSelect(t.id)}
      style={tempBorder ? { borderLeft: `4px solid ${tempBorder}` } : undefined}
    >
      <div className={`ai-check${t.done ? ' checked' : ''}`} onClick={e => onToggleDone(e, t.id)} />
      <div className="ai-body">
        <div className="ai-action">{t.action}</div>
        <div className="ai-name">{t.name}</div>
        <div className="ai-desc">{t.desc}</div>
        <div className="ai-badges">
          {tempBadge && (
            <span className="ai-badge" style={{ background: tempBadge.bg, color: tempBadge.fg }}>{tempBadge.label}</span>
          )}
          <span className="ai-badge" style={{ background: bb[t.badgeColor] || 'var(--stone)', color: bc[t.badgeColor] || 'var(--t2)' }}>{t.badge}</span>
          <span className="ai-badge" style={{ background: srcBg, color: srcCl }}>{srcLbl}</span>
        </div>
      </div>
      <div style={{ fontSize: 14, opacity: .3, flexShrink: 0, marginTop: 2 }}>›</div>
    </div>
  )
}
