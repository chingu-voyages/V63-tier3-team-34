import { and, asc, count, eq, ne } from 'drizzle-orm'
import { db } from './index.js'
import { events, invitations, type Event, type Invitation, type NewInvitation } from './schema.js'

export type NewGuest = Pick<NewInvitation, 'email' | 'firstName' | 'lastName'>

export interface InvitationWithEvent {
  invitation: Invitation
  event: Event
}

/** What a guest's answer may change. */
export type InvitationAnswer = Pick<Invitation, 'status' | 'respondedAt'> &
  Partial<Pick<Invitation, 'firstName' | 'lastName'>>

/** What `answerInvitationByToken` shows its `decide` callback. */
export interface InvitationState extends InvitationWithEvent {
  /** How many of the event's other guests have accepted. */
  otherAcceptedCount: number
}

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

export async function findInvitationByToken(
  token: string,
): Promise<InvitationWithEvent | undefined> {
  const [row] = await db
    .select({ invitation: invitations, event: events })
    .from(invitations)
    .innerJoin(events, eq(invitations.eventId, events.id))
    .where(eq(invitations.token, token))
    .limit(1)
  return row
}

/**
 * Stores a guest's answer. `decide` is given the current state and returns what to change, or
 * throws to refuse. It runs while the event is locked, so two guests answering at the same moment
 * are handled one after the other and cannot both take the last free spot.
 *
 * Returns undefined when no invitation has the token.
 */
export async function answerInvitationByToken(
  token: string,
  decide: (state: InvitationState) => InvitationAnswer,
): Promise<InvitationWithEvent | undefined> {
  return db.transaction(async (tx) => {
    const [found] = await tx
      .select({ eventId: invitations.eventId })
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1)
    if (!found) return undefined

    // The lock. "No key update" still lets the host invite more guests in the meantime.
    const [event] = await tx
      .select()
      .from(events)
      .where(eq(events.id, found.eventId))
      .for('no key update')
    // Read the invitation only now: it may have changed or been removed while waiting.
    const [invitation] = await tx
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1)
    if (!event || !invitation) return undefined

    const [others] = await tx
      .select({ accepted: count() })
      .from(invitations)
      .where(
        and(
          eq(invitations.eventId, event.id),
          eq(invitations.status, 'accepted'),
          ne(invitations.id, invitation.id),
        ),
      )

    const answer = decide({ invitation, event, otherAcceptedCount: others?.accepted ?? 0 })
    const [updated] = await tx
      .update(invitations)
      .set(answer)
      .where(eq(invitations.id, invitation.id))
      .returning()
    return { invitation: updated!, event }
  })
}
