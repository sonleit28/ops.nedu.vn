import type { TLItem } from '@modules/ops/types'

export function TimelineList({ items }: { items: TLItem[] }) {
  return (
    <>
      {items.map((tl, i) => {
        if (tl.isDivider) return <div key={i} className="tl-divider">{tl.label}</div>
        return (
          <div key={i} className="tl-item">
            <div className="tl-icon">{tl.icon}</div>
            <div className="tl-main">
              <div className="tl-top">
                <div className="tl-action">{tl.action}</div>
                {tl.who && tl.who !== 'Hệ thống' && <div className="tl-who">✍ {tl.who}</div>}
              </div>
              <div className="tl-date">{tl.date}</div>
              {tl.note && <div className="tl-note">{tl.note}</div>}
            </div>
          </div>
        )
      })}
    </>
  )
}
