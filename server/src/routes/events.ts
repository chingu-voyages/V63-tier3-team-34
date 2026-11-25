import { Router } from 'express'
import { requireAuth } from '../middleware/require-auth.js'
import {
  createEventSchema,
  eventIdParamsSchema,
  shareTokenParamsSchema,
  updateEventSchema,
} from '../schemas/events-schema.js'
import * as eventsService from '../services/events-service.js'

export const eventsRouter = Router()

eventsRouter.post('/', requireAuth, async (req, res) => {
  const input = createEventSchema.parse(req.body)
  const event = await eventsService.createEvent(input, req.user!.id)
  res.status(201).json(event)
})

eventsRouter.get('/share/:shareToken', async (req, res) => {
  const { shareToken } = shareTokenParamsSchema.parse(req.params)
  const event = await eventsService.getEventByShareToken(shareToken)
  res.json(event)
})

eventsRouter.get('/:id', async (req, res) => {
  const { id } = eventIdParamsSchema.parse(req.params)
  const event = await eventsService.getEventById(id)
  res.json(event)
})

eventsRouter.patch('/:id', async (req, res) => {
  const { id } = eventIdParamsSchema.parse(req.params)
  const input = updateEventSchema.parse(req.body)
  const event = await eventsService.updateEvent(id, input)
  res.json(event)
})

eventsRouter.delete('/:id', async (req, res) => {
  const { id } = eventIdParamsSchema.parse(req.params)
  await eventsService.deleteEvent(id)
  res.status(204).end()
})
