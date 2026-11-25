import { z } from 'zod'
import { bodyError } from './events-schema.js'

export const MAX_GUESTS_PER_REQUEST = 100

/** Trimmed, at most 100 characters; null, '' and whitespace-only all become null. */
const name = (field: string) =>
  z
    .string({ error: `${field} must be a string` })
    .trim()
    .max(100, { error: `${field} must be at most 100 characters` })
    .transform((value) => value || null)
    .nullable()

const guestsError = {
  error: `guests must be an array of 1 to ${MAX_GUESTS_PER_REQUEST} objects like { "email": "ada@example.com" }`,
}

const guest = z.object(
  {
    // Lower-cased so that it matches users.email and the same guest cannot be invited twice.
    email: z
      .string({ error: 'guests: every guest needs an email' })
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: (issue) => `guests: "${issue.input}" is not a valid email address` })),
    firstName: name('firstName').optional(),
    lastName: name('lastName').optional(),
  },
  guestsError,
)

export const inviteGuestsSchema = z.object(
  {
    guests: z
      .array(guest, guestsError)
      .min(1, guestsError)
      .max(MAX_GUESTS_PER_REQUEST, guestsError)
      // The same email twice in one request counts once; the first entry wins.
      .transform((guests) =>
        guests.filter((g, i) => guests.findIndex((other) => other.email === g.email) === i),
      ),
  },
  bodyError,
)

export const eventInvitationParamsSchema = z.object({
  id: z.uuid({ error: 'id must be a valid UUID' }),
  invitationId: z.uuid({ error: 'invitationId must be a valid UUID' }),
})

export const invitationTokenParamsSchema = z.object({
  token: z.string().min(1),
})

/** A guest's answer. A name that is left out keeps whatever the host entered. */
export const answerInvitationSchema = z.object(
  {
    status: z.enum(['accepted', 'declined'], { error: 'status must be accepted or declined' }),
    firstName: name('firstName').optional(),
    lastName: name('lastName').optional(),
  },
  bodyError,
)

export type InviteGuestsInput = z.infer<typeof inviteGuestsSchema>
export type AnswerInvitationInput = z.infer<typeof answerInvitationSchema>
