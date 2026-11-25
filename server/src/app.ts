import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { errorHandler, notFound } from './middleware/error-handler.js'
import { authRouter } from './routes/auth.js'
import { eventsRouter } from './routes/events.js'
import { healthRouter } from './routes/health.js'
import { eventInvitationsRouter } from './routes/invitations.js'

export const app = express()

app.use(cors({ origin: config.clientOrigin }))
app.use(express.json())
app.use(cookieParser())

app.get('/api', (_req, res) => {
  res.json({ message: 'API is running', health: '/api/health' })
})

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/events/:id/invitations', eventInvitationsRouter)
app.use('/api/events', eventsRouter)

app.use(notFound)
app.use(errorHandler)
