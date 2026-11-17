import { eq } from 'drizzle-orm'
import { db } from './index.js'
import { events, type Event, type NewEvent } from './schema.js'

export async function createEvent(data: NewEvent): Promise<Event> {
  const [event] = await db.insert(events).values(data).returning()
  return event!
}

export async function findEventByShareToken(shareToken: string): Promise<Event | undefined> {
  const [event] = await db.select().from(events).where(eq(events.shareToken, shareToken)).limit(1)
  return event
}
