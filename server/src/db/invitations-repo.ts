import { and, asc, eq } from 'drizzle-orm'
import { db } from './index.js'
import { invitations, type Invitation, type NewInvitation } from './schema.js'

export type NewGuest = Pick<NewInvitation, 'email' | 'firstName' | 'lastName'>

/** Invites the guests who are not invited to the event yet and returns only those. */
export async function createInvitations(
  eventId: string,
  guests: NewGuest[],
): Promise<Invitation[]> {
  return db
    .insert(invitations)
    .values(guests.map((guest) => ({ ...guest, eventId })))
    .onConflictDoNothing({ target: [invitations.eventId, invitations.email] })
    .returning()
}

export async function findInvitationsByEventId(eventId: string): Promise<Invitation[]> {
  return db
    .select()
    .from(invitations)
    .where(eq(invitations.eventId, eventId))
    .orderBy(asc(invitations.createdAt), asc(invitations.email))
}

export async function deleteInvitation(eventId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(invitations)
    .where(and(eq(invitations.id, id), eq(invitations.eventId, eventId)))
    .returning({ id: invitations.id })
  return deleted.length > 0
}
