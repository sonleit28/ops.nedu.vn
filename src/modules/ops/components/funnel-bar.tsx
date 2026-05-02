import type { Todo } from '@modules/ops/types'
import { FUNNEL_LAYERS } from '@modules/ops/constants/funnel'

export function FunnelBar({ t }: { t: Todo }) {
  return (
    <div className="funnel-bar">
      {FUNNEL_LAYERS.map((l, i) => {
        const isCur = l.stages.includes(t.stage)
        const isPast = l.id === 'attract' || l.id === 'convert'
        const tag = l.id === 'attract'
          ? <span style={{ fontSize: 8, background: 'rgba(107,114,128,.1)', padding: '1px 5px', borderRadius: 4, color: 'var(--t3)' }}>tương lai</span>
          : l.id === 'convert'
          ? <span style={{ fontSize: 8, background: 'var(--blue-s)', padding: '1px 5px', borderRadius: 4, color: 'var(--blue)' }}>nedu.vn</span>
          : null
        return (
          <span key={l.id} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <span className="fb-arr">›</span>}
            <div className={`fb-layer${isCur ? ' active' : isPast ? ' past' : ''}`}
              style={isCur ? { color: l.color, borderBottomColor: l.color } : {}}>
              <span className="fb-dot" style={{ background: isCur ? l.color : isPast ? 'var(--green)' : 'var(--stone2)' }} />
              {' '}{l.label}{tag}
            </div>
          </span>
        )
      })}
    </div>
  )
}
