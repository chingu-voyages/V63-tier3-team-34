import { and, eq, gt, lte } from 'drizzle-orm'
import { db } from './index.js'
import { sessions, users, type User } from './schema.js'

export async function createSession(data: typeof sessions.$inferInsert): Promise<void> {
  await db.insert(sessions).values(data)
}

/** The user who owns the session, or undefined when the session is unknown or has expired. */
export async function findUserBySessionId(id: string): Promise<User | undefined> {
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1)
  return row?.user
}

export async function deleteSession(id: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, id))
}

export async function deleteExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()))
}
