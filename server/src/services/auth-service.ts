import { createHash, randomBytes } from 'node:crypto'
import { fetchOAuthIdentity } from '../auth/oauth-providers.js'
import * as sessionsRepo from '../db/sessions-repo.js'
import * as usersRepo from '../db/users-repo.js'
import type { OAuthProvider, User } from '../db/schema.js'

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

/** The user fields that are safe to send to the client. */
export interface PublicUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  createdAt: Date
}

export function toPublicUser(user: User): PublicUser {
  const { id, email, firstName, lastName, avatarUrl, createdAt } = user
  return { id, email, firstName, lastName, avatarUrl, createdAt }
}

// Only the hash is stored, so reading the sessions table does not reveal usable tokens.
const sessionIdFor = (token: string): string => createHash('sha256').update(token).digest('hex')

/**
 * Finishes a GitHub login: finds or creates the user and starts a session. Returns the
 * token to put in the session cookie.
 */
export async function loginWithOAuth(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
): Promise<{ token: string; expiresAt: Date }> {
  const identity = await fetchOAuthIdentity(provider, code, redirectUri)
  const user = await usersRepo.findOrCreateUserByOAuthIdentity(identity)

  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await sessionsRepo.deleteExpiredSessions()
  await sessionsRepo.createSession({ id: sessionIdFor(token), userId: user.id, expiresAt })
  return { token, expiresAt }
}

export async function getUserBySessionToken(token: string | undefined): Promise<User | undefined> {
  if (!token) return undefined
  return sessionsRepo.findUserBySessionId(sessionIdFor(token))
}

export async function logout(token: string | undefined): Promise<void> {
  if (token) await sessionsRepo.deleteSession(sessionIdFor(token))
}
