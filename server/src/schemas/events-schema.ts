import { z } from 'zod'

type IssueInput = { input?: unknown }

/** `<name> is required` when the key is missing, `invalid` when it is present but wrong. */
const message = (name: string, invalid: string) => (issue: IssueInput) =>
  issue.input === undefined ? `${name} is required` : invalid

// Form fields arrive as '' when left blank; treat that the same as null.
const emptyToNull = (value: unknown): unknown => (value === '' ? null : value)

/**
 * ISO 8601 date-time that states its timezone (`Z` or an offset), parsed to a Date. A string
 * without one would be read in the server's local time, so it is rejected.
 */
const dateTime = (name: string) =>
  z.iso
    .datetime({
      offset: true,
      error: message(
        name,
        `${name} must be an ISO 8601 date-time with a timezone, e.g. 2026-12-01T18:00:00Z`,
      ),
    })
    .transform((value) => new Date(value))

/** Trimmed text; null, '' and whitespace-only all become null. */
const nullableText = (name: string) =>
  z
    .string({ error: message(name, `${name} must be a string`) })
    .trim()
    .transform((value) => value || null)
    .nullable()

const bodyError = { error: 'Request body must be a JSON object' }

const title = z
  .string({ error: message('title', 'title must be a string') })
  .trim()
  .min(1, { error: 'title cannot be empty' })
const description = nullableText('description')
const location = nullableText('location')
const startsAt = dateTime('startsAt')
const endsAt = z.preprocess(emptyToNull, dateTime('endsAt').nullable())

export const eventIdParamsSchema = z.object({
  id: z.uuid({ error: 'id must be a valid UUID' }),
})

export const shareTokenParamsSchema = z.object({
  shareToken: z.string().min(1),
})

// Unknown keys (id, shareToken, timestamps) are stripped, so a client cannot set them.
export const createEventSchema = z
  .object(
    {
      title,
      startsAt,
      endsAt: endsAt.optional(),
      description: description.optional(),
      location: location.optional(),
    },
    bodyError,
  )
  .refine((event) => !event.endsAt || event.endsAt >= event.startsAt, {
    error: 'endsAt must be after startsAt',
    path: ['endsAt'],
  })

/**
 * Partial update: a key left out is not touched. `description`, `location` and `endsAt` can be
 * cleared with null; `title` and `startsAt` are required columns, so they can be changed but
 * not cleared. The endsAt/startsAt order is checked in the service, where the stored values
 * are known.
 */
export const updateEventSchema = z
  .object({ title, startsAt, endsAt, description, location }, bodyError)
  .partial()
  .refine((event) => Object.keys(event).length > 0, {
    error: 'at least one of title, description, location, startsAt, endsAt is required',
  })

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
