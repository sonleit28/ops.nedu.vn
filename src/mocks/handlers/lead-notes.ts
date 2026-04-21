// src/mocks/handlers/lead-notes.ts
import { http, HttpResponse } from 'msw'
import { getCurrentMockUserId, getCurrentMockPerson, unauthorized, forbidden, notFound } from '../config'
import { MOCK_LEADS } from '../data/leads'
import { MOCK_LEAD_NOTES } from '../data/lead-notes'
import { MOCK_PERSONS } from '../data/persons'
import type { LeadNote } from '@modules/ops/types'

export const leadNotesHandlers = [

  http.get('*/api/ops/leads/:id/notes', async ({ params }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const lead = MOCK_LEADS.find(l => l.id === params.id)
    if (!lead) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && lead.assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const items = MOCK_LEAD_NOTES
      .filter(n => n.lead_id === params.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    return HttpResponse.json({ data: items })
  }),

  http.post('*/api/ops/leads/:id/notes', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const person = await getCurrentMockPerson()
    const lead = MOCK_LEADS.find(l => l.id === params.id)
    if (!lead) return notFound('Lead not found')
    const isElevated = person && ['leader','admin','owner'].includes(person.primary_role)
    if (!isElevated && lead.assigned_to_user_id !== personId) return forbidden('LEAD_ACCESS_DENIED')
    const body = await request.json() as { content: string }
    if (!body.content?.trim()) {
      return HttpResponse.json({ statusCode: 400, message: ['content should not be empty'], error: 'Bad Request' }, { status: 400 })
    }
    const author = MOCK_PERSONS.find(p => p.id === personId)
    const now = new Date().toISOString()
    const note: LeadNote = {
      id: crypto.randomUUID(), lead_id: lead.id, person_id: personId,
      author_full_name: author?.full_name ?? 'Unknown',
      content: body.content.trim(), created_at: now, updated_at: now,
    }
    MOCK_LEAD_NOTES.push(note)
    return HttpResponse.json({ data: note }, { status: 201 })
  }),

  http.patch('*/api/ops/leads/:id/notes/:note_id', async ({ params, request }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const idx = MOCK_LEAD_NOTES.findIndex(n => n.id === params.note_id && n.lead_id === params.id)
    if (idx < 0) return notFound('Note not found')
    if (MOCK_LEAD_NOTES[idx].person_id !== personId) return forbidden('Không thể sửa note của người khác')
    const body = await request.json() as { content: string }
    if (!body.content?.trim()) {
      return HttpResponse.json({ statusCode: 400, message: ['content should not be empty'], error: 'Bad Request' }, { status: 400 })
    }
    MOCK_LEAD_NOTES[idx] = { ...MOCK_LEAD_NOTES[idx], content: body.content.trim(), updated_at: new Date().toISOString() }
    return HttpResponse.json({ data: MOCK_LEAD_NOTES[idx] })
  }),

  http.delete('*/api/ops/leads/:id/notes/:note_id', async ({ params }) => {
    const personId = await getCurrentMockUserId()
    if (!personId) return unauthorized()
    const idx = MOCK_LEAD_NOTES.findIndex(n => n.id === params.note_id && n.lead_id === params.id)
    if (idx < 0) return notFound('Note not found')
    if (MOCK_LEAD_NOTES[idx].person_id !== personId) return forbidden('Không thể xóa note của người khác')
    MOCK_LEAD_NOTES.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
