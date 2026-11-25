import { randomBytes } from 'node:crypto'
import {
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const generateShareToken = (): string => randomBytes(16).toString('base64url')

// GitHub only for now. A second provider is a new entry here and in auth/oauth-providers.ts.
export const oauthProviders = ['github'] as const
export type OAuthProvider = (typeof oauthProviders)[number]

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Lower-cased and verified by the login provider, so it can be matched against guestEmails.
  email: text('email').notNull().unique(),
  firstName: text('first_name').notNull(),
  // '' when the provider only knows a single name (common on GitHub).
  lastName: text('last_name').notNull().default(''),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/** One row per provider login. A user who signs in with two providers has two rows. */
export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    provider: text('provider', { enum: oauthProviders }).notNull(),
    // The provider's own id for the account; unlike the email, it never changes.
    providerAccountId: text('provider_account_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
)

export const sessions = pgTable('sessions', {
  // SHA-256 of the token in the session cookie, so a leaked table cannot be used to log in.
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  shareToken: text('share_token').notNull().unique().$defaultFn(generateShareToken),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  eventType: text('event_type'),
  // A link to an image hosted elsewhere; the server does not store image files.
  imageUrl: text('image_url'),
  guestEmails: text('guest_emails').array().notNull().default([]),
  maxGuests: integer('max_guests'),
  admissionPrice: numeric('admission_price', { precision: 10, scale: 2, mode: 'number' }),
  isPublic: boolean('is_public').notNull().default(false),
  rsvpEnabled: boolean('rsvp_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
