import { randomBytes } from 'node:crypto'
import { Router, type CookieOptions, type Response } from 'express'
import { buildAuthorizeUrl, OAuthError, type OAuthErrorCode } from '../auth/oauth-providers.js'
import { config } from '../config.js'
import type { OAuthProvider } from '../db/schema.js'
import { readSessionToken, SESSION_COOKIE } from '../middleware/require-auth.js'
import {
  oauthStateCookieSchema,
  providerParamsSchema,
  returnToSchema,
} from '../schemas/auth-schema.js'
import * as authService from '../services/auth-service.js'

export const authRouter = Router()

const STATE_COOKIE = 'oauth_state'
const STATE_TTL_MS = 10 * 60 * 1000

// The browser only ever talks to the client origin, which forwards /api to this server. So that
// is where cookies live and where GitHub must send the browser back to.
const baseCookie: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.clientOrigin.startsWith('https://'),
}
const sessionCookie: CookieOptions = { ...baseCookie, path: '/' }
const stateCookie: CookieOptions = { ...baseCookie, path: '/api/auth' }

const callbackUrl = (provider: OAuthProvider): string =>
  `${config.clientOrigin}/api/auth/${provider}/callback`

function redirectWithError(res: Response, code: OAuthErrorCode): void {
  res.redirect(`${config.clientOrigin}/?authError=${code}`)
}

authRouter.get('/me', async (req, res) => {
  const user = await authService.getUserBySessionToken(readSessionToken(req))
  res.json({ user: user ? authService.toPublicUser(user) : null })
})

authRouter.post('/logout', async (req, res) => {
  await authService.logout(readSessionToken(req))
  res.clearCookie(SESSION_COOKIE, sessionCookie)
  res.status(204).end()
})

// Step 1: the browser navigates here and is sent on to the provider's consent page.
authRouter.get('/:provider', (req, res) => {
  const { provider } = providerParamsSchema.parse(req.params)
  const returnTo = returnToSchema.parse(req.query.returnTo)

  // Remembered in a cookie and echoed back by the provider. The callback only accepts a login
  // whose two copies match, which proves it was started from this browser.
  const state = randomBytes(32).toString('base64url')
  let authorizeUrl: string
  try {
    authorizeUrl = buildAuthorizeUrl(provider, callbackUrl(provider), state)
  } catch (err) {
    if (!(err instanceof OAuthError)) throw err
    console.warn(err.message)
    redirectWithError(res, err.code)
    return
  }

  res.cookie(STATE_COOKIE, { state, returnTo }, { ...stateCookie, maxAge: STATE_TTL_MS })
  res.redirect(authorizeUrl)
})

// Step 2: the provider sends the browser back here with a one-time code.
authRouter.get('/:provider/callback', async (req, res) => {
  const { provider } = providerParamsSchema.parse(req.params)
  const { code, state, error } = req.query
  const saved = oauthStateCookieSchema.safeParse(req.cookies?.[STATE_COOKIE])
  res.clearCookie(STATE_COOKIE, stateCookie)

  try {
    if (!saved.success || typeof state !== 'string' || state !== saved.data.state) {
      throw new OAuthError('invalid_state', 'OAuth state is missing or does not match')
    }
    // The provider reports a cancelled consent page as ?error=access_denied.
    if (error === 'access_denied') {
      throw new OAuthError('access_denied', `${provider} login was cancelled`)
    }
    if (typeof code !== 'string' || !code) {
      throw new OAuthError('provider_error', `${provider} sent no code: ${String(error)}`)
    }

    const session = await authService.loginWithOAuth(provider, code, callbackUrl(provider))
    res.cookie(SESSION_COOKIE, session.token, { ...sessionCookie, expires: session.expiresAt })
    res.redirect(`${config.clientOrigin}${saved.data.returnTo}`)
  } catch (err) {
    // Everything ends in a redirect: the user is looking at a browser tab, not a JSON response.
    const code = err instanceof OAuthError ? err.code : 'provider_error'
    if (code === 'provider_error' || code === 'not_configured') console.error(err)
    redirectWithError(res, code)
  }
})
