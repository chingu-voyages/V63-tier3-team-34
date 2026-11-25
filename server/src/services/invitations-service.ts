import * as invitationsRepo from '../db/invitations-repo.js'
import type { InvitationWithEvent } from '../db/invitations-repo.js'
import type { Invitation } from '../db/schema.js'
import { HttpError } from '../errors/http-error.js'
import type { AnswerInvitationInput, InviteGuestsInput } from '../schemas/invitations-schema.js'
import * as eventsService from './events-service.js'

const invitationNotFound = (): HttpError => new HttpError(404, 'Invitation not found')

// Every function that takes a userId is for the event's host only. The functions that take a
// token are for the guest: knowing the token is what proves who they are, so there is no login.

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
  if (!deleted) throw invitationNotFound()
}

export async function getInvitationByToken(token: string): Promise<InvitationWithEvent> {
  const found = await invitationsRepo.findInvitationByToken(token)
  if (!found) throw invitationNotFound()
  return found
}

/** A guest accepts or declines. They can change their answer as often as they like. */
export async function answerInvitation(
  token: string,
  { status, ...names }: AnswerInvitationInput,
): Promise<InvitationWithEvent> {
  const answered = await invitationsRepo.answerInvitationByToken(
    token,
    ({ invitation, event, otherAcceptedCount }) => {
      if (!event.rsvpEnabled) {
        throw new HttpError(409, 'This event is not taking responses')
      }
      // A guest who has already accepted keeps their spot, even if the limit was lowered since.
      const needsSpot = status === 'accepted' && invitation.status !== 'accepted'
      if (needsSpot && event.maxGuests !== null && otherAcceptedCount >= event.maxGuests) {
        throw new HttpError(409, 'This event is full')
      }
      return { status, respondedAt: new Date(), ...names }
    },
  )
  if (!answered) throw invitationNotFound()
  return answered
}
