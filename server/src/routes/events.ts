import { Router } from 'express'
import { createEvent, findEventByShareToken } from '../db/events-repo.js'
import type { NewEvent } from '../db/schema.js'

export const eventsRouter = Router()

type ParseResult = { ok: true; data: NewEvent } | { ok: false; errors: string[] }

const optionalString = (value: unknown, name: string, errors: string[]): string | null => {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') errors.push(`${name} must be a string`)
  return typeof value === 'string' ? value.trim() : null
}

const optionalDate = (value: unknown, name: string, errors: string[]): Date | null => {
  if (value === undefined || value === null || value === '') return null
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) {
    errors.push(`${name} must be a valid ISO date`)
    return null
  }
  return date
}

export function parseCreateEvent(body: unknown): ParseResult {
  const errors: string[] = []
  const input = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>

  const title = optionalString(input.title, 'title', errors)
  if (!title) errors.push('title is required')

  const startsAt = optionalDate(input.startsAt, 'startsAt', errors)
  if (!startsAt) errors.push('startsAt is required')

  const endsAt = optionalDate(input.endsAt, 'endsAt', errors)
  if (startsAt && endsAt && endsAt < startsAt) errors.push('endsAt must be after startsAt')

  const description = optionalString(input.description, 'description', errors)
  const location = optionalString(input.location, 'location', errors)

  if (errors.length > 0 || !title || !startsAt) return { ok: false, errors }
  return { ok: true, data: { title, startsAt, endsAt, description, location } }
}

eventsRouter.post('/', async (req, res) => {
  const parsed = parseCreateEvent(req.body)
  if (!parsed.ok) {
    res.status(400).json({ error: 'Invalid event', details: parsed.errors })
    return
  }
  const event = await createEvent(parsed.data)
  res.status(201).json(event)
})

eventsRouter.get('/:shareToken', async (req, res) => {
  const event = await findEventByShareToken(req.params.shareToken)
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  res.json(event)
})
