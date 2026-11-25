import { and, eq } from 'drizzle-orm'
import { db } from './index.js'
import { oauthAccounts, users, type NewUser, type OAuthProvider, type User } from './schema.js'

export interface OAuthIdentity {
  provider: OAuthProvider
  providerAccountId: string
  profile: Pick<NewUser, 'email' | 'firstName' | 'lastName' | 'avatarUrl'>
}

/**
 * Returns the user behind a provider account, creating the user on first login.
 *
 * A login from a provider the user has not used before is attached to the existing user with the
 * same email, so signing in with two providers gives one user, not two.
 * That is only safe because callers pass an email the provider has verified.
 */
export async function findOrCreateUserByOAuthIdentity(identity: OAuthIdentity): Promise<User> {
  const { provider, providerAccountId, profile } = identity

  return db.transaction(async (tx) => {
    const [linked] = await tx
      .select({ user: users })
      .from(oauthAccounts)
      .innerJoin(users, eq(oauthAccounts.userId, users.id))
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerAccountId, providerAccountId),
        ),
      )
      .limit(1)
    if (linked) return linked.user

    // The profile is only used to create the user; later logins never overwrite it.
    const [created] = await tx
      .insert(users)
      .values(profile)
      .onConflictDoNothing({ target: users.email })
      .returning()
    const user =
      created ?? (await tx.select().from(users).where(eq(users.email, profile.email)).limit(1))[0]!

    await tx.insert(oauthAccounts).values({ provider, providerAccountId, userId: user.id })
    return user
  })
}
