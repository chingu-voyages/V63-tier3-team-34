import type { User } from '../db/schema.js'

declare global {
  namespace Express {
    interface Request {
      /** The logged-in user. Only set on routes that run `requireAuth` first. */
      user?: User
    }
  }
}
