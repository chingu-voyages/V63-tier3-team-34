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
}))
vi.mock('../db/sessions-repo.js', () => ({
  findUserBySessionId: vi.fn(),
}))

const { findEventById } = await import('../db/events-repo.js')
const { createInvitations, findInvitationsByEventId, deleteInvitation } =
  await import('../db/invitations-repo.js')
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
