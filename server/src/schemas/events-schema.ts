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

export const bodyError = { error: 'Request body must be a JSON object' }

const title = z
  .string({ error: message('title', 'title must be a string') })
  .trim()
  .min(1, { error: 'title cannot be empty' })
const description = nullableText('description')
const location = nullableText('location')
const startsAt = dateTime('startsAt')
const endsAt = z.preprocess(emptyToNull, dateTime('endsAt').nullable())

const eventType = z
  .string({ error: message('eventType', 'eventType must be a string') })
  .trim()
  .max(50, { error: 'eventType must be at most 50 characters' })
  .transform((value) => value || null)
  .nullable()

// A link only: the server does not store image files. localhost is allowed for development.
const imageUrlError = { error: 'imageUrl must be an http or https URL' }
const imageUrl = z.preprocess(
  emptyToNull,
  z
    .url({ protocol: /^https?$/, ...imageUrlError })
    .max(2048, { error: 'imageUrl must be at most 2048 characters' })
    .nullable(),
)

// Upper bounds match the columns (integer, numeric(10, 2)) so an oversized value is a 400
// rather than a database error.
const maxGuestsError = { error: 'maxGuests must be a whole number of at least 1' }
const maxGuests = z.preprocess(
  emptyToNull,
  z.int32(maxGuestsError).min(1, maxGuestsError).nullable(),
)

const admissionPriceError = {
  error: 'admissionPrice must be a number of at least 0 with at most 2 decimal places',
}
const admissionPrice = z.preprocess(
  emptyToNull,
  z
    .number(admissionPriceError)
    .min(0, admissionPriceError)
    .max(99_999_999.99, admissionPriceError)
    .multipleOf(0.01, admissionPriceError)
    .nullable(),
)

const isPublic = z.boolean({ error: 'isPublic must be true or false' })
const rsvpEnabled = z.boolean({ error: 'rsvpEnabled must be true or false' })

export const eventIdParamsSchema = z.object({
  id: z.uuid({ error: 'id must be a valid UUID' }),
})

export const shareTokenParamsSchema = z.object({
  shareToken: z.string().min(1),
})

// Unknown keys (id, shareToken, timestamps) are stripped, so a client cannot set them. Guests are
// not part of the event: they are invited through the invitations endpoints. Fields
// left out of a create fall back to the column defaults in db/schema.ts.
export const createEventSchema = z
  .object(
    {
      title,
      startsAt,
      endsAt: endsAt.optional(),
      description: description.optional(),
      location: location.optional(),
      eventType: eventType.optional(),
      imageUrl: imageUrl.optional(),
      maxGuests: maxGuests.optional(),
      admissionPrice: admissionPrice.optional(),
      isPublic: isPublic.optional(),
      rsvpEnabled: rsvpEnabled.optional(),
    },
    bodyError,
  )
  .refine((event) => !event.endsAt || event.endsAt >= event.startsAt, {
    error: 'endsAt must be after startsAt',
    path: ['endsAt'],
  })

const updatableFields = {
  title,
  startsAt,
  endsAt,
  description,
  location,
  eventType,
  imageUrl,
  maxGuests,
  admissionPrice,
  isPublic,
  rsvpEnabled,
}

/**
 * Partial update: a key left out is not touched. Nullable fields can be cleared with null;
 * `title`, `startsAt` and the two booleans are required columns, so they can be
 * changed but not set to null. The endsAt/startsAt order is checked in the service, where the
 * stored values are known.
 */
export const updateEventSchema = z
  .object(updatableFields, bodyError)
  .partial()
  .refine((event) => Object.keys(event).length > 0, {
    error: `at least one of ${Object.keys(updatableFields).join(', ')} is required`,
  })

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
