import { randomBytes } from 'node:crypto'
import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const generateShareToken = (): string => randomBytes(16).toString('base64url')

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

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
