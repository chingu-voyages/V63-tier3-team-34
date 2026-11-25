import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Event, Invitation, User } from '../db/schema.js'

vi.mock('../db/events-repo.js', () => ({
  findEventById: vi.fn(),
}))
vi.mock('../db/invitations-repo.js', () => ({
  createInvitations: vi.fn(),
  findInvitationsByEventId: vi.fn(),
  deleteInvitation: vi.fn(),
  findInvitationByToken: vi.fn(),
  answerInvitationByToken: vi.fn(),
}))
vi.mock('../db/sessions-repo.js', () => ({
  findUserBySessionId: vi.fn(),
}))

const { findEventById } = await import('../db/events-repo.js')
const {
  createInvitations,
  findInvitationsByEventId,
  deleteInvitation,
  findInvitationByToken,
  answerInvitationByToken,
} = await import('../db/invitations-repo.js')
const { findUserBySessionId } = await import('../db/sessions-repo.js')
const { app } = await import('../app.js')

const host: User = {
  id: '0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  updatedAt: new Date('2026-11-01T00:00:00Z'),
}

const event: Event = {
  id: '14835685-efc2-45f6-b5fc-c78b59d99fc0',
  shareToken: '4u-5zoKZ90hicHJ8buaX7A',
  hostId: host.id,
  title: 'Kickoff',
  description: null,
  location: null,
  startsAt: new Date('2026-12-01T18:00:00Z'),
  endsAt: null,
  eventType: null,
  imageUrl: null,
  maxGuests: null,
  admissionPrice: null,
  isPublic: false,
  rsvpEnabled: true,
  createdAt: new Date('2026-11-12T00:00:00Z'),
  updatedAt: new Date('2026-11-12T00:00:00Z'),
}

const invitation: Invitation = {
  id: '7a1f6a52-4b53-4b0e-9a3c-0d6c1f2b9e10',
  eventId: event.id,
  email: 'grace@example.com',
  firstName: 'Grace',
  lastName: 'Hopper',
  status: 'pending',
  token: 'N-BmF19VFtFEA6IPMJqotw',
  respondedAt: null,
  createdAt: new Date('2026-11-20T00:00:00Z'),
  updatedAt: new Date('2026-11-20T00:00:00Z'),
}

const otherUserId = '11111111-1111-4111-8111-111111111111'
const sessionCookie = 'session=test-token'
const invitationsUrl = `/api/events/${event.id}/invitations`

const invite = (body: unknown) =>
  request(app)
    .post(invitationsUrl)
    .set('Cookie', sessionCookie)
    .send(body as object)

beforeEach(() => {
  vi.mocked(findEventById).mockReset().mockResolvedValue(event)
  vi.mocked(createInvitations).mockReset().mockResolvedValue([])
  vi.mocked(findInvitationsByEventId).mockReset()
  vi.mocked(deleteInvitation).mockReset()
  vi.mocked(findInvitationByToken).mockReset()
  vi.mocked(answerInvitationByToken).mockReset()
  // Any request that carries a session cookie is treated as the host being logged in.
  vi.mocked(findUserBySessionId).mockReset().mockResolvedValue(host)
})

describe('POST /api/events/:id/invitations', () => {
  it('invites guests and returns their invitations', async () => {
    vi.mocked(createInvitations).mockResolvedValue([invitation])
    const res = await invite({
      guests: [{ email: ' Grace@Example.com ', firstName: ' Grace ', lastName: 'Hopper' }],
    })
    expect(res.status).toBe(201)
    expect(createInvitations).toHaveBeenCalledWith(event.id, [
      { email: 'grace@example.com', firstName: 'Grace', lastName: 'Hopper' },
    ])
    expect(res.body).toEqual({
      invitations: [
        {
          id: invitation.id,
          eventId: event.id,
          email: 'grace@example.com',
          firstName: 'Grace',
          lastName: 'Hopper',
          status: 'pending',
          token: 'N-BmF19VFtFEA6IPMJqotw',
          respondedAt: null,
          createdAt: '2026-11-20T00:00:00.000Z',
          updatedAt: '2026-11-20T00:00:00.000Z',
        },
      ],
      alreadyInvited: [],
    })
  })

  it('accepts guests with only an email and stores blank names as null', async () => {
    await invite({
      guests: [
        { email: 'grace@example.com' },
        { email: 'alan@example.com', firstName: ' ', lastName: null },
      ],
    })
    expect(createInvitations).toHaveBeenCalledWith(event.id, [
      { email: 'grace@example.com' },
      { email: 'alan@example.com', firstName: null, lastName: null },
    ])
  })

  it('counts an email that appears twice in one request once, keeping the first entry', async () => {
    await invite({
      guests: [
        { email: 'grace@example.com', firstName: 'Grace' },
        { email: 'alan@example.com' },
        { email: 'GRACE@example.com', firstName: 'Other' },
      ],
    })
    expect(createInvitations).toHaveBeenCalledWith(event.id, [
      { email: 'grace@example.com', firstName: 'Grace' },
      { email: 'alan@example.com' },
    ])
  })

  it('reports guests who were already invited instead of inviting them again', async () => {
    // The repo returns only the rows it created.
    vi.mocked(createInvitations).mockResolvedValue([invitation])
    const res = await invite({
      guests: [{ email: 'grace@example.com' }, { email: 'alan@example.com' }],
    })
    expect(res.status).toBe(201)
    expect(res.body.invitations).toHaveLength(1)
    expect(res.body.alreadyInvited).toEqual(['alan@example.com'])
  })

  it('rejects a request without a session', async () => {
    const res = await request(app)
      .post(invitationsUrl)
      .send({ guests: [{ email: 'grace@example.com' }] })
    expect(res.status).toBe(401)
    expect(createInvitations).not.toHaveBeenCalled()
  })

  it('refuses a user who is not the host', async () => {
    vi.mocked(findEventById).mockResolvedValue({ ...event, hostId: otherUserId })
    const res = await invite({ guests: [{ email: 'grace@example.com' }] })
    expect(res.status).toBe(403)
    expect(createInvitations).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown event', async () => {
    vi.mocked(findEventById).mockResolvedValue(undefined)
    const res = await invite({ guests: [{ email: 'grace@example.com' }] })
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Event not found')
    expect(createInvitations).not.toHaveBeenCalled()
  })

  it('rejects an event id that is not a UUID', async () => {
    const res = await request(app)
      .post('/api/events/not-a-uuid/invitations')
      .set('Cookie', sessionCookie)
      .send({ guests: [{ email: 'grace@example.com' }] })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['id must be a valid UUID'])
  })

  const guestsError =
    'guests must be an array of 1 to 100 objects like { "email": "ada@example.com" }'

  it.each([
    ['a missing guests list', {}, [guestsError]],
    ['an empty guests list', { guests: [] }, [guestsError]],
    ['guests as a list of strings', { guests: ['grace@example.com'] }, [guestsError]],
    [
      'guests as one comma-separated string',
      { guests: 'a@example.com, b@example.com' },
      [guestsError],
    ],
    [
      'more than 100 guests',
      { guests: Array.from({ length: 101 }, (_, i) => ({ email: `guest${i}@example.com` })) },
      [guestsError],
    ],
    [
      'a guest without an email',
      { guests: [{ firstName: 'Grace' }] },
      ['guests: every guest needs an email'],
    ],
    [
      'an invalid email',
      { guests: [{ email: 'grace@example.com' }, { email: 'not-an-email' }] },
      ['guests: "not-an-email" is not a valid email address'],
    ],
    [
      'names that are not text or too long',
      { guests: [{ email: 'grace@example.com', firstName: 5, lastName: 'x'.repeat(101) }] },
      ['firstName must be a string', 'lastName must be at most 100 characters'],
    ],
  ])('rejects %s', async (_name, body, details) => {
    const res = await invite(body)
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(details)
    expect(createInvitations).not.toHaveBeenCalled()
  })

  it('rejects a request without a JSON body', async () => {
    const res = await request(app).post(invitationsUrl).set('Cookie', sessionCookie)
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['Request body must be a JSON object'])
  })
})

describe('GET /api/events/:id/invitations', () => {
  it('returns the guest list to the host', async () => {
    const accepted = {
      ...invitation,
      id: 'c0a8012e-0000-4000-8000-000000000002',
      email: 'alan@example.com',
      status: 'accepted' as const,
    }
    vi.mocked(findInvitationsByEventId).mockResolvedValue([invitation, accepted])
    const res = await request(app).get(invitationsUrl).set('Cookie', sessionCookie)
    expect(res.status).toBe(200)
    expect(res.body.invitations.map((i: Invitation) => [i.email, i.status])).toEqual([
      ['grace@example.com', 'pending'],
      ['alan@example.com', 'accepted'],
    ])
    expect(findInvitationsByEventId).toHaveBeenCalledWith(event.id)
  })

  it('returns an empty list when nobody is invited', async () => {
    vi.mocked(findInvitationsByEventId).mockResolvedValue([])
    const res = await request(app).get(invitationsUrl).set('Cookie', sessionCookie)
    expect(res.body).toEqual({ invitations: [] })
  })

  it('rejects a request without a session', async () => {
    const res = await request(app).get(invitationsUrl)
    expect(res.status).toBe(401)
    expect(findInvitationsByEventId).not.toHaveBeenCalled()
  })

  it.each([
    ['a user who is not the host', otherUserId],
    ['anyone when the event has no host', null],
  ])('hides the guest list from %s', async (_name, hostId) => {
    vi.mocked(findEventById).mockResolvedValue({ ...event, hostId })
    const res = await request(app).get(invitationsUrl).set('Cookie', sessionCookie)
    expect(res.status).toBe(403)
    expect(findInvitationsByEventId).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown event', async () => {
    vi.mocked(findEventById).mockResolvedValue(undefined)
    const res = await request(app).get(invitationsUrl).set('Cookie', sessionCookie)
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/events/:id/invitations/:invitationId', () => {
  const url = `${invitationsUrl}/${invitation.id}`

  it('removes the invitation and returns 204', async () => {
    vi.mocked(deleteInvitation).mockResolvedValue(true)
    const res = await request(app).delete(url).set('Cookie', sessionCookie)
    expect(res.status).toBe(204)
    expect(deleteInvitation).toHaveBeenCalledWith(event.id, invitation.id)
  })

  it('returns 404 when the event has no such invitation', async () => {
    vi.mocked(deleteInvitation).mockResolvedValue(false)
    const res = await request(app).delete(url).set('Cookie', sessionCookie)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Invitation not found')
  })

  it('rejects a request without a session', async () => {
    const res = await request(app).delete(url)
    expect(res.status).toBe(401)
    expect(deleteInvitation).not.toHaveBeenCalled()
  })

  it('refuses a user who is not the host', async () => {
    vi.mocked(findEventById).mockResolvedValue({ ...event, hostId: otherUserId })
    const res = await request(app).delete(url).set('Cookie', sessionCookie)
    expect(res.status).toBe(403)
    expect(deleteInvitation).not.toHaveBeenCalled()
  })

  it('rejects an invitation id that is not a UUID', async () => {
    const res = await request(app).delete(`${invitationsUrl}/nope`).set('Cookie', sessionCookie)
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['invitationId must be a valid UUID'])
    expect(deleteInvitation).not.toHaveBeenCalled()
  })
})

describe('GET /api/invitations/:token', () => {
  it('returns the invitation and its event without a login', async () => {
    vi.mocked(findInvitationByToken).mockResolvedValue({ invitation, event })
    const res = await request(app).get(`/api/invitations/${invitation.token}`)
    expect(res.status).toBe(200)
    expect(res.body.invitation).toMatchObject({ email: 'grace@example.com', status: 'pending' })
    expect(res.body.event).toMatchObject({ id: event.id, title: 'Kickoff' })
    expect(findInvitationByToken).toHaveBeenCalledWith(invitation.token)
    expect(findUserBySessionId).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown token', async () => {
    vi.mocked(findInvitationByToken).mockResolvedValue(undefined)
    const res = await request(app).get('/api/invitations/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Invitation not found' })
  })
})

describe('PATCH /api/invitations/:token', () => {
  const url = `/api/invitations/${invitation.token}`

  /** Makes the repo behave as if the database held this state, and apply what the service decides. */
  function givenState(state: {
    invitation?: Partial<Invitation>
    event?: Partial<Event>
    otherAcceptedCount?: number
  }) {
    const current = {
      invitation: { ...invitation, ...state.invitation },
      event: { ...event, ...state.event },
      otherAcceptedCount: state.otherAcceptedCount ?? 0,
    }
    vi.mocked(answerInvitationByToken).mockImplementation(async (_token, decide) => ({
      invitation: { ...current.invitation, ...decide(current) },
      event: current.event,
    }))
  }

  it('accepts an invitation without a login', async () => {
    givenState({})
    const before = Date.now()
    const res = await request(app).patch(url).send({ status: 'accepted' })
    expect(res.status).toBe(200)
    expect(res.body.invitation.status).toBe('accepted')
    expect(res.body.invitation.firstName).toBe('Grace')
    expect(new Date(res.body.invitation.respondedAt).getTime()).toBeGreaterThanOrEqual(before)
    expect(res.body.event.id).toBe(event.id)
    expect(vi.mocked(answerInvitationByToken).mock.calls[0]![0]).toBe(invitation.token)
    expect(findUserBySessionId).not.toHaveBeenCalled()
  })

  it('declines an invitation', async () => {
    givenState({})
    const res = await request(app).patch(url).send({ status: 'declined' })
    expect(res.status).toBe(200)
    expect(res.body.invitation.status).toBe('declined')
  })

  it('lets the guest fill in or clear their name while answering', async () => {
    givenState({ invitation: { firstName: null, lastName: 'Old' } })
    const res = await request(app)
      .patch(url)
      .send({ status: 'accepted', firstName: ' Grace ', lastName: '' })
    expect(res.body.invitation).toMatchObject({ firstName: 'Grace', lastName: null })
  })

  it('lets a guest change their answer', async () => {
    givenState({ invitation: { status: 'accepted' } })
    const res = await request(app).patch(url).send({ status: 'declined' })
    expect(res.body.invitation.status).toBe('declined')
  })

  it('accepts while there is a free spot', async () => {
    givenState({ event: { maxGuests: 2 }, otherAcceptedCount: 1 })
    const res = await request(app).patch(url).send({ status: 'accepted' })
    expect(res.status).toBe(200)
  })

  it('refuses to accept when the event is full', async () => {
    givenState({ event: { maxGuests: 2 }, otherAcceptedCount: 2 })
    const res = await request(app).patch(url).send({ status: 'accepted' })
    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: 'This event is full' })
  })

  it('still lets a guest decline when the event is full', async () => {
    givenState({ event: { maxGuests: 2 }, otherAcceptedCount: 2 })
    const res = await request(app).patch(url).send({ status: 'declined' })
    expect(res.status).toBe(200)
  })

  it('keeps the spot of a guest who had already accepted', async () => {
    givenState({
      invitation: { status: 'accepted' },
      event: { maxGuests: 1 },
      otherAcceptedCount: 1,
    })
    const res = await request(app).patch(url).send({ status: 'accepted', firstName: 'Grace' })
    expect(res.status).toBe(200)
  })

  it.each(['accepted', 'declined'])(
    'refuses %s when the event is not taking responses',
    async (status) => {
      givenState({ event: { rsvpEnabled: false } })
      const res = await request(app).patch(url).send({ status })
      expect(res.status).toBe(409)
      expect(res.body).toEqual({ error: 'This event is not taking responses' })
    },
  )

  it('returns 404 for an unknown token', async () => {
    vi.mocked(answerInvitationByToken).mockResolvedValue(undefined)
    const res = await request(app).patch('/api/invitations/nope').send({ status: 'accepted' })
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Invitation not found' })
  })

  it.each([
    ['a missing status', {}, ['status must be accepted or declined']],
    ['pending as a status', { status: 'pending' }, ['status must be accepted or declined']],
    [
      'a name that is not text',
      { status: 'accepted', firstName: 5 },
      ['firstName must be a string'],
    ],
  ])('rejects %s', async (_name, body, details) => {
    const res = await request(app).patch(url).send(body)
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(details)
    expect(answerInvitationByToken).not.toHaveBeenCalled()
  })

  it('cannot change the email, event or token of an invitation', async () => {
    givenState({})
    const res = await request(app)
      .patch(url)
      .send({ status: 'accepted', email: 'evil@example.com', eventId: otherUserId, token: 'x' })
    expect(res.body.invitation).toMatchObject({
      email: 'grace@example.com',
      eventId: event.id,
      token: invitation.token,
    })
  })
})
