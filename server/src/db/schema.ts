import { randomBytes } from 'node:crypto'
import {
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

/** 22 URL-safe characters that cannot be guessed. Used for links that work without a login. */
export const generateToken = (): string => randomBytes(16).toString('base64url')

// GitHub only for now. A second provider is a new entry here and in auth/oauth-providers.ts.
export const oauthProviders = ['github'] as const
export type OAuthProvider = (typeof oauthProviders)[number]

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Lower-cased and verified by the login provider, so it can be matched against invitation emails.
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
  shareToken: text('share_token').notNull().unique().$defaultFn(generateToken),
  // The user who created the event. Null for events created before logins existed.
  hostId: uuid('host_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  eventType: text('event_type'),
  // A link to an image hosted elsewhere; the server does not store image files.
  imageUrl: text('image_url'),
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

export const invitationStatuses = ['pending', 'accepted', 'declined'] as const
export type InvitationStatus = (typeof invitationStatuses)[number]

/**
 * One guest invited to one event. A guest is known by email only and needs no account: whoever
 * holds the token (the guest's personal link) can see the event and answer the invitation.
 */
export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    // Lower-cased, like users.email, so the two can be compared.
    email: text('email').notNull(),
    // Optional: filled in by the host when inviting or by the guest when answering.
    firstName: text('first_name'),
    lastName: text('last_name'),
    status: text('status', { enum: invitationStatuses }).notNull().default('pending'),
    token: text('token').notNull().unique().$defaultFn(generateToken),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  // A guest is invited to an event at most once. Also serves lookups by event.
  (table) => [unique('invitations_event_id_email_unique').on(table.eventId, table.email)],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
