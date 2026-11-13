import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { errorHandler, notFound } from './middleware/error-handler.js'
import { healthRouter } from './routes/health.js'

export const app = express()

app.use(cors({ origin: config.clientOrigin }))
app.use(express.json())

app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Server</title></head>
<body><main><h1>Server</h1><p>The Express server is running.</p><a href="/api/health">API health</a></main></body>
</html>`)
})

app.get('/api', (_req, res) => {
  res.json({ message: 'API is running', health: '/api/health' })
})

app.use('/api/health', healthRouter)

app.use(notFound)
app.use(errorHandler)
