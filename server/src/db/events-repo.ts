import { eq } from 'drizzle-orm'
import { db } from './index.js'
import { events, type Event, type NewEvent } from './schema.js'

export type EventUpdate = Partial<Omit<NewEvent, 'id' | 'shareToken' | 'createdAt' | 'updatedAt'>>

export async function createEvent(data: NewEvent): Promise<Event> {
  const [event] = await db.insert(events).values(data).returning()
  return event!
}

export async function findEventById(id: string): Promise<Event | undefined> {
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  return event
}

export async function findEventByShareToken(shareToken: string): Promise<Event | undefined> {
  const [event] = await db.select().from(events).where(eq(events.shareToken, shareToken)).limit(1)
  return event
}

export async function updateEvent(id: string, data: EventUpdate): Promise<Event | undefined> {
  const [event] = await db.update(events).set(data).where(eq(events.id, id)).returning()
  return event
}

export async function deleteEvent(id: string): Promise<boolean> {
  const deleted = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id })
  return deleted.length > 0
}
