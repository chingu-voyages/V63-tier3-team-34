import type { Request, RequestHandler } from 'express'
import { HttpError } from '../errors/http-error.js'
import * as authService from '../services/auth-service.js'

export const SESSION_COOKIE = 'session'

export function readSessionToken(req: Request): string | undefined {
  const token: unknown = req.cookies?.[SESSION_COOKIE]
  return typeof token === 'string' ? token : undefined
}

/**
 * Put this before a route handler to make the route logged-in only. It answers 401 when there
 * is no valid session, and otherwise sets `req.user` for the handler.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const user = await authService.getUserBySessionToken(readSessionToken(req))
  if (!user) throw new HttpError(401, 'Authentication required')
  req.user = user
  next()
}
