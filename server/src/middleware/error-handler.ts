import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../errors/http-error.js'

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => issue.message),
    })
    return
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
    return
  }

  // Errors from Express and its middleware (e.g. a malformed JSON body) carry their own status.
  const status = typeof err?.status === 'number' ? err.status : 500
  if (status >= 500) console.error(err)
  const message = status === 500 ? 'Internal server error' : String(err?.message ?? 'Error')
  res.status(status).json({ error: message })
}
