import { Router } from 'express'
import { requireAuth } from '../middleware/require-auth.js'
import { eventIdParamsSchema } from '../schemas/events-schema.js'
import {
  answerInvitationSchema,
  eventInvitationParamsSchema,
  invitationTokenParamsSchema,
  inviteGuestsSchema,
} from '../schemas/invitations-schema.js'
import * as invitationsService from '../services/invitations-service.js'

/**
 * The host's side of invitations, mounted at /api/events/:id/invitations. Every route needs a
 * login, and the service checks that the logged-in user is the event's host.
 */
export const eventInvitationsRouter = Router({ mergeParams: true })

eventInvitationsRouter.use(requireAuth)

eventInvitationsRouter.post('/', async (req, res) => {
  const { id } = eventIdParamsSchema.parse(req.params)
  const input = inviteGuestsSchema.parse(req.body)
  const result = await invitationsService.inviteGuests(id, req.user!.id, input)
  res.status(201).json(result)
})

eventInvitationsRouter.get('/', async (req, res) => {
  const { id } = eventIdParamsSchema.parse(req.params)
  const invitations = await invitationsService.listInvitations(id, req.user!.id)
  res.json({ invitations })
})

eventInvitationsRouter.delete('/:invitationId', async (req, res) => {
  const { id, invitationId } = eventInvitationParamsSchema.parse(req.params)
  await invitationsService.removeInvitation(id, invitationId, req.user!.id)
  res.status(204).end()
})

/**
 * The guest's side, mounted at /api/invitations. No login: the token in the URL comes from the
 * guest's personal link and is what identifies them.
 */
export const invitationsRouter = Router()

invitationsRouter.get('/:token', async (req, res) => {
  const { token } = invitationTokenParamsSchema.parse(req.params)
  res.json(await invitationsService.getInvitationByToken(token))
})

invitationsRouter.patch('/:token', async (req, res) => {
  const { token } = invitationTokenParamsSchema.parse(req.params)
  const input = answerInvitationSchema.parse(req.body)
  res.json(await invitationsService.answerInvitation(token, input))
})
