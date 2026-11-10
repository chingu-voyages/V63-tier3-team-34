import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { errorHandler, notFound } from './middleware/error-handler.js'
import { healthRouter } from './routes/health.js'

export const app = express()

app.use(cors({ origin: config.clientOrigin }))
app.use(express.json())

app.use('/api/health', healthRouter)

app.use(notFound)
app.use(errorHandler)
