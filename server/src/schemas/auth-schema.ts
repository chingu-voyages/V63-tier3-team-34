import { z } from 'zod'
import { oauthProviders } from '../db/schema.js'

export const providerParamsSchema = z.object({
  provider: z.enum(oauthProviders, {
    error: `provider must be one of ${oauthProviders.join(', ')}`,
  }),
})

/**
 * Where to send the browser after login. Only a path on the client is accepted (`/dashboard`),
 * never a full URL, so a crafted login link cannot bounce the user to another site.
 */
export const returnToSchema = z
  .string()
  .regex(/^\/(?![/\\])/)
  .catch('/')

/** What the login start stores in a cookie for the callback to check. */
export const oauthStateCookieSchema = z.object({
  state: z.string().min(1),
  returnTo: returnToSchema,
})
