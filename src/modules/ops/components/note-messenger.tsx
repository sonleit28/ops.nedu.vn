import React, { useState, useRef } from 'react'
import type { Todo } from '@modules/ops/types'
import { COURSES } from '@modules/ops/constants/courses'

export function NoteMessenger({ t, onSendNote, onEditNote, onDeleteNote, onToggleCourse, editingNotes, onStartEditNote, onCancelEditNote }: {
  t: Todo
  onSendNote: (text: string) => void
  onEditNote: (idx: number, val: string) => void
  onDeleteNote: (idx: number) => void
  onToggleCourse: (cid: string) => void
  editingNotes: Record<string, string>
  onStartEditNote: (idx: number, val: string) => void
  onCancelEditNote: (idx: number) => void
  scopeId?: string
}) {
  const [input, setInput] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) { onSendNote(input); setInput('') }
    }
  }

  return (
    <div className="nm-box">
      <div className="nm-header">
        <div className="nm-pulse" />
        <div className="nm-hdr-text">
          <div className="nm-title">📝 Ghi chú cho người kế tiếp</div>
          <div className="nm-sub">Điền mỗi cuộc gọi — người sau đọc là hiểu ngay cần làm gì</div>
        </div>
        <div className="nm-count">{t.notes.length} ghi chú</div>
      </div>
      <div className="nm-list">
        {t.notes.length === 0
          ? <div className="nm-empty">Chưa có ghi chú · Gõ bên dưới và Enter để thêm</div>
          : t.notes.map((n, i) => {
            const eKey = `${t.id}-${i}`
            const isEditing = eKey in editingNotes
            return (
              <div key={i} className={`nm-bubble${isEditing ? ' editing' : ''}`}>
                {isEditing ? (
                  <>
                    <textarea className="nm-edit-ta"
                      value={editingNotes[eKey]}
                      onChange={e => onStartEditNote(i, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEditNote(i, editingNotes[eKey]) } }}
                      autoFocus />
                    <div className="nm-edit-actions">
                      <button className="btn btn-danger btn-sm" onClick={() => onDeleteNote(i)}>🗑 Xóa</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => onCancelEditNote(i)}>Hủy</button>
                      <button className="btn btn-primary btn-sm" onClick={() => onEditNote(i, editingNotes[eKey])}>💾 Lưu</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="nm-btext">{n.text}</div>
                    <div className="nm-bmeta">
                      <span className="nm-bwho">✍ {n.who || 'Linh Nguyễn'}</span>
                      <span className="nm-btime">{n.date}</span>
                      <button className="nm-bedit" onClick={() => onStartEditNote(i, n.text)} title="Chỉnh sửa">✏️</button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
      <div className="course-bar">
        <div className="cb-label">🎯 Khóa đang tư vấn — chọn để nhớ</div>
        <div className="cb-chips">
          {COURSES.map(c => (
            <div key={c.id} className={`course-chip${t.courses.includes(c.id) ? ' selected' : ''}`}
              onClick={() => onToggleCourse(c.id)}>
              {c.emoji} {c.name}
            </div>
          ))}
        </div>
      </div>
      <div className="nm-input-bar">
        <textarea ref={taRef} className="nm-input" rows={1}
          placeholder="Ghi chú cho người kế tiếp... (Enter để lưu, Shift+Enter xuống dòng)"
          value={input} onChange={e => { setInput(e.target.value); if (taRef.current) { taRef.current.style.height = 'auto'; taRef.current.style.height = Math.min(taRef.current.scrollHeight, 96) + 'px' } }}
          onKeyDown={handleKey} />
        <button className="nm-send" onClick={() => { if (input.trim()) { onSendNote(input); setInput('') } }} title="Gửi">↑</button>
      </div>
    </div>
  )
}
