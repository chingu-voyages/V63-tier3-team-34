import { createHash } from 'node:crypto'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../db/schema.js'

const config = vi.hoisted(() => ({
  port: 3000,
  clientOrigin: 'http://localhost:5173',
  nodeEnv: 'test',
  databaseUrl: 'postgresql://postgres:postgres@localhost:5432/app',
  oauth: {
    github: { clientId: 'gh-id', clientSecret: 'gh-secret' },
  },
}))

vi.mock('../config.js', () => ({ config }))
vi.mock('../db/users-repo.js', () => ({
  findOrCreateUserByOAuthIdentity: vi.fn(),
}))
vi.mock('../db/sessions-repo.js', () => ({
  createSession: vi.fn(),
  findUserBySessionId: vi.fn(),
  deleteSession: vi.fn(),
  deleteExpiredSessions: vi.fn(),
}))

const { findOrCreateUserByOAuthIdentity } = await import('../db/users-repo.js')
const { createSession, findUserBySessionId, deleteSession } = await import('../db/sessions-repo.js')
const { app } = await import('../app.js')

const user: User = {
  id: '0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: 'https://avatars.example.com/ada.png',
  createdAt: new Date('2026-11-01T00:00:00Z'),
  updatedAt: new Date('2026-11-02T00:00:00Z'),
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

const cookiesOf = (res: request.Response): string[] =>
  ([] as string[]).concat(res.headers['set-cookie'] ?? [])

/** Stands in for GitHub: answers each URL with the JSON registered for it. */
function stubProvider(responses: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string | URL) => {
    const body = responses[String(url)]
    if (body === undefined) return new Response('not found', { status: 404 })
    return Response.json(body)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const githubResponses = {
  'https://github.com/login/oauth/access_token': { access_token: 'gh-token' },
  'https://api.github.com/user': {
    id: 583231,
    login: 'ada',
    name: 'Ada King Lovelace',
    avatar_url: 'https://avatars.example.com/ada.png',
  },
  'https://api.github.com/user/emails': [
    { email: 'old@example.com', primary: false, verified: true },
    { email: 'Ada@Example.com', primary: true, verified: true },
  ],
}

/** Starts a login and returns the agent holding the state cookie, plus the state itself. */
async function startLogin(provider: string, query = '') {
  const agent = request.agent(app)
  const res = await agent.get(`/api/auth/${provider}${query}`)
  const authorizeUrl = new URL(res.headers.location!)
  return { agent, res, authorizeUrl, state: authorizeUrl.searchParams.get('state')! }
}

beforeEach(() => {
  vi.mocked(findOrCreateUserByOAuthIdentity).mockReset().mockResolvedValue(user)
  vi.mocked(createSession).mockReset()
  vi.mocked(findUserBySessionId).mockReset()
  vi.mocked(deleteSession).mockReset()
  config.oauth.github = { clientId: 'gh-id', clientSecret: 'gh-secret' }
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('GET /api/auth/me', () => {
  it('returns user: null when nobody is logged in', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ user: null })
    expect(findUserBySessionId).not.toHaveBeenCalled()
  })

  it('returns user: null for an unknown or expired session', async () => {
    vi.mocked(findUserBySessionId).mockResolvedValue(undefined)
    const res = await request(app).get('/api/auth/me').set('Cookie', 'session=stale')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ user: null })
  })

  it('returns the logged-in user, looked up by the hash of the cookie', async () => {
    vi.mocked(findUserBySessionId).mockResolvedValue(user)
    const res = await request(app).get('/api/auth/me').set('Cookie', 'session=test-token')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      user: {
        id: user.id,
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        avatarUrl: 'https://avatars.example.com/ada.png',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
    })
    expect(findUserBySessionId).toHaveBeenCalledWith(sha256('test-token'))
  })
})

describe('POST /api/auth/logout', () => {
  it('deletes the session and clears the cookie', async () => {
    const res = await request(app).post('/api/auth/logout').set('Cookie', 'session=test-token')
    expect(res.status).toBe(204)
    expect(deleteSession).toHaveBeenCalledWith(sha256('test-token'))
    expect(cookiesOf(res).join()).toMatch(/^session=;.*Expires=Thu, 01 Jan 1970/)
  })

  it('succeeds when nobody is logged in', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(204)
    expect(deleteSession).not.toHaveBeenCalled()
  })
})

describe('GET /api/auth/:provider', () => {
  it('redirects to the GitHub consent page and remembers the state in a cookie', async () => {
    const { res, authorizeUrl, state } = await startLogin('github')
    expect(res.status).toBe(302)
    expect(authorizeUrl.origin + authorizeUrl.pathname).toBe(
      'https://github.com/login/oauth/authorize',
    )
    expect(Object.fromEntries(authorizeUrl.searchParams)).toEqual({
      client_id: 'gh-id',
      redirect_uri: 'http://localhost:5173/api/auth/github/callback',
      response_type: 'code',
      scope: 'read:user user:email',
      state,
    })
    expect(state.length).toBeGreaterThanOrEqual(43)

    const [cookie] = cookiesOf(res)
    expect(cookie).toContain(encodeURIComponent(state))
    expect(cookie).toMatch(/^oauth_state=.*Path=\/api\/auth;.*HttpOnly;.*SameSite=Lax/)
  })

  it('uses a new state for every login', async () => {
    const first = await startLogin('github')
    const second = await startLogin('github')
    expect(first.state).not.toBe(second.state)
  })

  it('sends the browser back with authError when the provider has no credentials', async () => {
    config.oauth.github = { clientId: '', clientSecret: '' }
    const res = await request(app).get('/api/auth/github')
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('http://localhost:5173/?authError=not_configured')
    expect(cookiesOf(res)).toEqual([])
  })

  it('rejects a provider that is not supported', async () => {
    const res = await request(app).get('/api/auth/google')
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['provider must be one of github'])
  })
})

describe('GET /api/auth/:provider/callback', () => {
  it('logs in with GitHub: creates the user and session, sets the cookie and redirects', async () => {
    const fetchMock = stubProvider(githubResponses)
    const { agent, state } = await startLogin('github', '?returnTo=/eventdashboard')

    const res = await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('http://localhost:5173/eventdashboard')

    // The code is exchanged with the client secret and the same redirect URI as step 1.
    const [tokenUrl, tokenRequest] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(tokenUrl).toBe('https://github.com/login/oauth/access_token')
    expect(Object.fromEntries(tokenRequest.body as URLSearchParams)).toEqual({
      client_id: 'gh-id',
      client_secret: 'gh-secret',
      code: 'abc',
      redirect_uri: 'http://localhost:5173/api/auth/github/callback',
      grant_type: 'authorization_code',
    })

    expect(findOrCreateUserByOAuthIdentity).toHaveBeenCalledWith({
      provider: 'github',
      providerAccountId: '583231',
      profile: {
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'King Lovelace',
        avatarUrl: 'https://avatars.example.com/ada.png',
      },
    })

    const cookies = cookiesOf(res)
    const sessionCookie = cookies.find((cookie) => cookie.startsWith('session='))!
    expect(sessionCookie).toMatch(/Path=\/;.*HttpOnly;.*SameSite=Lax/)
    expect(sessionCookie).not.toContain('Secure')
    expect(cookies.find((cookie) => cookie.startsWith('oauth_state='))).toContain('oauth_state=;')

    // The database gets the hash of the cookie's token, never the token itself.
    const token = sessionCookie.slice('session='.length).split(';')[0]!
    const session = vi.mocked(createSession).mock.calls[0]![0]
    expect(session.id).toBe(sha256(token))
    expect(session.userId).toBe(user.id)
    const days = (session.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    expect(days).toBeGreaterThan(29.9)
    expect(days).toBeLessThanOrEqual(30)
  })

  it('falls back to the GitHub username when the profile has no name', async () => {
    stubProvider({
      ...githubResponses,
      'https://api.github.com/user': { id: 583231, login: 'ada', name: null, avatar_url: null },
    })
    const { agent, state } = await startLogin('github')
    await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(vi.mocked(findOrCreateUserByOAuthIdentity).mock.calls[0]![0].profile).toEqual({
      email: 'ada@example.com',
      firstName: 'ada',
      lastName: '',
      avatarUrl: null,
    })
  })

  it('refuses a GitHub account without a verified primary email', async () => {
    stubProvider({
      ...githubResponses,
      'https://api.github.com/user/emails': [
        { email: 'ada@example.com', primary: true, verified: false },
        { email: 'other@example.com', primary: false, verified: true },
      ],
    })
    const { agent, state } = await startLogin('github')
    const res = await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(res.headers.location).toBe('http://localhost:5173/?authError=email_unverified')
    expect(findOrCreateUserByOAuthIdentity).not.toHaveBeenCalled()
    expect(createSession).not.toHaveBeenCalled()
  })

  it.each([
    ['a state that does not match the cookie', (state: string) => `${state}x`, true],
    ['a missing state', () => '', true],
    ['a missing state cookie', (state: string) => state, false],
  ])('rejects %s without contacting the provider', async (_name, stateFor, sendCookie) => {
    const fetchMock = stubProvider(githubResponses)
    const { agent, state } = await startLogin('github')
    const client = sendCookie ? agent : request(app)
    const res = await client.get(`/api/auth/github/callback?code=abc&state=${stateFor(state)}`)
    expect(res.headers.location).toBe('http://localhost:5173/?authError=invalid_state')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createSession).not.toHaveBeenCalled()
  })

  it('accepts a state only once', async () => {
    stubProvider(githubResponses)
    const { agent, state } = await startLogin('github')
    await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    const replay = await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(replay.headers.location).toBe('http://localhost:5173/?authError=invalid_state')
    expect(createSession).toHaveBeenCalledOnce()
  })

  it('reports a cancelled consent page as access_denied', async () => {
    const fetchMock = stubProvider(githubResponses)
    const { agent, state } = await startLogin('github')
    const res = await agent.get(`/api/auth/github/callback?error=access_denied&state=${state}`)
    expect(res.headers.location).toBe('http://localhost:5173/?authError=access_denied')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reports a code the provider rejects as provider_error', async () => {
    stubProvider({
      ...githubResponses,
      'https://github.com/login/oauth/access_token': { error: 'bad_verification_code' },
    })
    const { agent, state } = await startLogin('github')
    const res = await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(res.headers.location).toBe('http://localhost:5173/?authError=provider_error')
    expect(cookiesOf(res).some((cookie) => cookie.startsWith('session='))).toBe(false)
  })

  it('reports a provider that cannot be reached as provider_error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    const { agent, state } = await startLogin('github')
    const res = await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(res.headers.location).toBe('http://localhost:5173/?authError=provider_error')
  })

  it.each([
    ['another site', 'https://evil.example.com/'],
    ['a protocol-relative URL', '//evil.example.com'],
    ['a backslash URL', '/\\evil.example.com'],
  ])('ignores a returnTo that points to %s', async (_name, returnTo) => {
    stubProvider(githubResponses)
    const { agent, state } = await startLogin('github', `?returnTo=${encodeURIComponent(returnTo)}`)
    const res = await agent.get(`/api/auth/github/callback?code=abc&state=${state}`)
    expect(res.headers.location).toBe('http://localhost:5173/')
  })
})
