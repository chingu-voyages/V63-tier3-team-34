import * as eventsRepo from '../db/events-repo.js'
import type { Event } from '../db/schema.js'
import { HttpError } from '../errors/http-error.js'
import type { CreateEventInput, UpdateEventInput } from '../schemas/events-schema.js'

const eventNotFound = (): HttpError => new HttpError(404, 'Event not found')

export async function createEvent(input: CreateEventInput): Promise<Event> {
  return eventsRepo.createEvent(input)
}

export async function getEventById(id: string): Promise<Event> {
  const event = await eventsRepo.findEventById(id)
  if (!event) throw eventNotFound()
  return event
}

export async function getEventByShareToken(shareToken: string): Promise<Event> {
  const event = await eventsRepo.findEventByShareToken(shareToken)
  if (!event) throw eventNotFound()
  return event
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<Event> {
  const existing = await getEventById(id)

  // The update may carry only one of the two dates, so compare against what is stored.
  const startsAt = input.startsAt ?? existing.startsAt
  const endsAt = input.endsAt === undefined ? existing.endsAt : input.endsAt
  if (endsAt && endsAt < startsAt) {
    throw new HttpError(400, 'Validation failed', ['endsAt must be after startsAt'])
  }

  const event = await eventsRepo.updateEvent(id, input)
  // Deleted between the read above and the update.
  if (!event) throw eventNotFound()
  return event
}

export async function deleteEvent(id: string): Promise<void> {
  const deleted = await eventsRepo.deleteEvent(id)
  if (!deleted) throw eventNotFound()
}
