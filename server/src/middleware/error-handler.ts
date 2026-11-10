import type { ErrorRequestHandler, RequestHandler } from 'express'

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)
  const status = typeof err?.status === 'number' ? err.status : 500
  const message = status === 500 ? 'Internal server error' : String(err?.message ?? 'Error')
  res.status(status).json({ error: message })
}
