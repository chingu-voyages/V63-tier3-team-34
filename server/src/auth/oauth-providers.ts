import { config } from '../config.js'
import type { OAuthIdentity } from '../db/users-repo.js'
import type { OAuthProvider } from '../db/schema.js'

/**
 * Why a login did not complete. The code is sent to the client as `?authError=<code>`, because
 * the login runs as full-page redirects and there is no JSON response to put an error in.
 */
export type OAuthErrorCode =
  'not_configured' | 'access_denied' | 'invalid_state' | 'email_unverified' | 'provider_error'

export class OAuthError extends Error {
  readonly code: OAuthErrorCode

  constructor(code: OAuthErrorCode, message: string) {
    super(message)
    this.name = 'OAuthError'
    this.code = code
  }
}

type Profile = OAuthIdentity['profile']

interface ProviderDefinition {
  authorizeUrl: string
  tokenUrl: string
  scope: string
  /** Reads the account id and a verified email with the access token. */
  fetchIdentity(accessToken: string): Promise<{ providerAccountId: string; profile: Profile }>
}

// A provider that does not answer must not leave the login request hanging.
const timeout = (): AbortSignal => AbortSignal.timeout(10_000)

async function getJson(url: string, accessToken: string): Promise<unknown> {
  const response = await fetch(url, {
    signal: timeout(),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      // GitHub rejects API requests that have no User-Agent.
      'User-Agent': 'events-app-server',
    },
  })
  if (!response.ok) {
    throw new OAuthError('provider_error', `GET ${url} responded ${response.status}`)
  }
  return response.json()
}

/** Splits "Ada King Lovelace" into "Ada" and "King Lovelace". */
function splitName(name: string): { firstName: string; lastName: string } {
  const [firstName = '', ...rest] = name.trim().split(/\s+/)
  return { firstName, lastName: rest.join(' ') }
}

const definitions: Record<OAuthProvider, ProviderDefinition> = {
  github: {
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email',
    async fetchIdentity(accessToken) {
      const [user, emails] = (await Promise.all([
        getJson('https://api.github.com/user', accessToken),
        getJson('https://api.github.com/user/emails', accessToken),
      ])) as [
        { id: number; login: string; name: string | null; avatar_url: string | null },
        { email: string; primary: boolean; verified: boolean }[],
      ]

      // The email on the profile is optional and may be unverified; the emails list is reliable.
      const email = emails.find((entry) => entry.primary && entry.verified)?.email
      if (!email) {
        throw new OAuthError('email_unverified', 'GitHub account has no verified primary email')
      }

      // The display name is optional on GitHub; the login (username) always exists.
      const { firstName, lastName } = splitName(user.name ?? '')
      return {
        providerAccountId: String(user.id),
        profile: {
          email: email.toLowerCase(),
          firstName: firstName || user.login,
          lastName,
          avatarUrl: user.avatar_url ?? null,
        },
      }
    },
  },
}

function credentials(provider: OAuthProvider): { clientId: string; clientSecret: string } {
  const { clientId, clientSecret } = config.oauth[provider]
  if (!clientId || !clientSecret) {
    const prefix = provider.toUpperCase()
    throw new OAuthError(
      'not_configured',
      `${provider} login needs ${prefix}_CLIENT_ID and ${prefix}_CLIENT_SECRET to be set`,
    )
  }
  return { clientId, clientSecret }
}

/** The provider's consent page, which sends the browser back to `redirectUri` afterwards. */
export function buildAuthorizeUrl(
  provider: OAuthProvider,
  redirectUri: string,
  state: string,
): string {
  const { clientId } = credentials(provider)
  const { authorizeUrl, scope } = definitions[provider]
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    state,
  })
  return `${authorizeUrl}?${params}`
}

/** Trades the one-time `code` from the callback for the identity of whoever logged in. */
export async function fetchOAuthIdentity(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
): Promise<OAuthIdentity> {
  const { clientId, clientSecret } = credentials(provider)
  const definition = definitions[provider]

  const response = await fetch(definition.tokenUrl, {
    method: 'POST',
    signal: timeout(),
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  // GitHub reports a bad code as a 200 with an `error` field, so check the body, not the status.
  const token = (await response.json().catch(() => null)) as {
    access_token?: string
    error?: string
  } | null
  if (!token?.access_token) {
    throw new OAuthError(
      'provider_error',
      `${provider} token exchange failed: ${token?.error ?? `status ${response.status}`}`,
    )
  }

  const identity = await definition.fetchIdentity(token.access_token)
  return { provider, ...identity }
}
