import { randomBytes } from 'node:crypto'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const generateShareToken = (): string => randomBytes(16).toString('base64url')

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  shareToken: text('share_token').notNull().unique().$defaultFn(generateShareToken),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
