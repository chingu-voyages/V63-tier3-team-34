import * as invitationsRepo from '../db/invitations-repo.js'
import type { Invitation } from '../db/schema.js'
import { HttpError } from '../errors/http-error.js'
import type { InviteGuestsInput } from '../schemas/invitations-schema.js'
import * as eventsService from './events-service.js'

// Every function that takes a userId is for the event's host only.

export async function inviteGuests(
  eventId: string,
  userId: string,
  { guests }: InviteGuestsInput,
): Promise<{ invitations: Invitation[]; alreadyInvited: string[] }> {
  await eventsService.getEventForHost(eventId, userId)
  const created = await invitationsRepo.createInvitations(eventId, guests)

  const createdEmails = new Set(created.map((invitation) => invitation.email))
  const alreadyInvited = guests.map((guest) => guest.email).filter((e) => !createdEmails.has(e))
  return { invitations: created, alreadyInvited }
}

export async function listInvitations(eventId: string, userId: string): Promise<Invitation[]> {
  await eventsService.getEventForHost(eventId, userId)
  return invitationsRepo.findInvitationsByEventId(eventId)
}

export async function removeInvitation(
  eventId: string,
  invitationId: string,
  userId: string,
): Promise<void> {
  await eventsService.getEventForHost(eventId, userId)
  const deleted = await invitationsRepo.deleteInvitation(eventId, invitationId)
  if (!deleted) throw new HttpError(404, 'Invitation not found')
}
