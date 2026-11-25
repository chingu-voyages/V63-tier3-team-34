import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Event, User } from '../db/schema.js'

vi.mock('../db/events-repo.js', () => ({
  createEvent: vi.fn(),
  findEventById: vi.fn(),
  findEventByShareToken: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

vi.mock('../db/sessions-repo.js', () => ({
  findUserBySessionId: vi.fn(),
}))

const { createEvent, findEventById, findEventByShareToken, updateEvent, deleteEvent } =
  await import('../db/events-repo.js')
const { findUserBySessionId } = await import('../db/sessions-repo.js')
const { app } = await import('../app.js')

const invalidDate = (name: string) =>
  `${name} must be an ISO 8601 date-time with a timezone, e.g. 2026-12-01T18:00:00Z`

const host: User = {
  id: '0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: null,
  createdAt: new Date('2026-11-01T00:00:00Z'),
  updatedAt: new Date('2026-11-01T00:00:00Z'),
}

const sample: Event = {
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
  guestEmails: [],
  maxGuests: null,
  admissionPrice: null,
  isPublic: false,
  rsvpEnabled: true,
  createdAt: new Date('2026-11-12T00:00:00Z'),
  updatedAt: new Date('2026-11-12T00:00:00Z'),
}

beforeEach(() => {
  vi.mocked(createEvent).mockReset()
  vi.mocked(findEventById).mockReset()
  vi.mocked(findEventByShareToken).mockReset()
  vi.mocked(updateEvent).mockReset()
  vi.mocked(deleteEvent).mockReset()
  // Any request that carries a session cookie is treated as the host being logged in.
  vi.mocked(findUserBySessionId).mockReset().mockResolvedValue(host)
})

/** A create request from a logged-in user. */
const postEvent = () => request(app).post('/api/events').set('Cookie', 'session=test-token')

describe('POST /api/events', () => {
  it('rejects a request without a session cookie', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00Z' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Authentication required' })
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('rejects an unknown or expired session', async () => {
    vi.mocked(findUserBySessionId).mockResolvedValue(undefined)
    const res = await postEvent().send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00Z' })
    expect(res.status).toBe(401)
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('ignores a client-supplied hostId', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      hostId: '11111111-1111-4111-8111-111111111111',
    })
    expect(vi.mocked(createEvent).mock.calls[0]![0]).toHaveProperty('hostId', host.id)
  })

  it('creates an event and returns it with a shareToken', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await postEvent().send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00Z' })
    expect(res.status).toBe(201)
    expect(res.body.shareToken).toBe(sample.shareToken)
    expect(createEvent).toHaveBeenCalledWith({
      hostId: host.id,
      title: 'Kickoff',
      startsAt: new Date('2026-12-01T18:00:00Z'),
    })
  })

  it('trims text and stores blank optional fields as null', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await postEvent().send({
      title: ' Kickoff ',
      startsAt: '2026-12-01T20:00:00+02:00',
      endsAt: '',
      description: '  ',
      location: ' HQ ',
    })
    expect(res.status).toBe(201)
    expect(createEvent).toHaveBeenCalledWith({
      hostId: host.id,
      title: 'Kickoff',
      startsAt: new Date('2026-12-01T18:00:00Z'),
      endsAt: null,
      description: null,
      location: 'HQ',
    })
  })

  it('accepts the event type, image, guest and settings fields', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      eventType: ' Team Building ',
      imageUrl: 'https://images.example.com/kickoff.png',
      guestEmails: [' Ada@Example.com ', 'ada@example.com', 'grace@example.com'],
      maxGuests: 50,
      admissionPrice: 19.99,
      isPublic: true,
      rsvpEnabled: false,
    })
    expect(res.status).toBe(201)
    expect(createEvent).toHaveBeenCalledWith({
      hostId: host.id,
      title: 'Kickoff',
      startsAt: new Date('2026-12-01T18:00:00Z'),
      eventType: 'Team Building',
      imageUrl: 'https://images.example.com/kickoff.png',
      guestEmails: ['ada@example.com', 'grace@example.com'],
      maxGuests: 50,
      admissionPrice: 19.99,
      isPublic: true,
      rsvpEnabled: false,
    })
  })

  it('treats blank optional number and image fields as null', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      eventType: '',
      imageUrl: '',
      maxGuests: '',
      admissionPrice: '',
    })
    expect(res.status).toBe(201)
    expect(createEvent).toHaveBeenCalledWith({
      hostId: host.id,
      title: 'Kickoff',
      startsAt: new Date('2026-12-01T18:00:00Z'),
      eventType: null,
      imageUrl: null,
      maxGuests: null,
      admissionPrice: null,
    })
  })

  it('rejects invalid event type, image, guest and settings fields', async () => {
    const res = await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      eventType: 'x'.repeat(51),
      imageUrl: 'blob:http://localhost:5173/3f1c',
      guestEmails: ['ada@example.com', 'not-an-email'],
      maxGuests: 0,
      admissionPrice: 9.999,
      isPublic: 'yes',
      rsvpEnabled: null,
    })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([
      'eventType must be at most 50 characters',
      'imageUrl must be an http or https URL',
      'guestEmails: "not-an-email" is not a valid email address',
      'maxGuests must be a whole number of at least 1',
      'admissionPrice must be a number of at least 0 with at most 2 decimal places',
      'isPublic must be true or false',
      'rsvpEnabled must be true or false',
    ])
    expect(createEvent).not.toHaveBeenCalled()
  })

  it.each([
    [
      'maxGuests as a string',
      { maxGuests: '50' },
      'maxGuests must be a whole number of at least 1',
    ],
    [
      'maxGuests with decimals',
      { maxGuests: 2.5 },
      'maxGuests must be a whole number of at least 1',
    ],
    [
      'maxGuests beyond the column range',
      { maxGuests: 3_000_000_000 },
      'maxGuests must be a whole number of at least 1',
    ],
    [
      'a negative admissionPrice',
      { admissionPrice: -1 },
      'admissionPrice must be a number of at least 0 with at most 2 decimal places',
    ],
    [
      'an admissionPrice beyond the column range',
      { admissionPrice: 100_000_000 },
      'admissionPrice must be a number of at least 0 with at most 2 decimal places',
    ],
    [
      'guestEmails as a string',
      { guestEmails: 'ada@example.com' },
      'guestEmails must be an array of email addresses',
    ],
    [
      'a non-string guest email',
      { guestEmails: [5] },
      'guestEmails must be an array of email addresses',
    ],
    [
      'a javascript: imageUrl',
      { imageUrl: 'javascript:alert(1)' },
      'imageUrl must be an http or https URL',
    ],
    [
      'a data: imageUrl',
      { imageUrl: 'data:image/png;base64,AAAA' },
      'imageUrl must be an http or https URL',
    ],
  ])('rejects %s', async (_name, fields, expected) => {
    const res = await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      ...fields,
    })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([expected])
  })

  it('accepts a localhost imageUrl and a free admissionPrice of 0', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      imageUrl: 'http://localhost:3000/kickoff.png',
      admissionPrice: 0,
    })
    expect(res.status).toBe(201)
  })

  it('ignores a client-supplied shareToken', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      shareToken: 'mine',
    })
    expect(vi.mocked(createEvent).mock.calls[0]![0]).not.toHaveProperty('shareToken')
  })

  it('rejects a missing title and invalid dates', async () => {
    const res = await postEvent().send({
      startsAt: 'yesterday-ish',
      endsAt: '2026-12-01T18:00:00Z',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
    expect(res.body.details).toEqual(['title is required', invalidDate('startsAt')])
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('rejects a date-time without a timezone', async () => {
    const res = await postEvent().send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00' })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([invalidDate('startsAt')])
  })

  it('rejects a request without a JSON body', async () => {
    const res = await postEvent()
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['Request body must be a JSON object'])
  })

  it('rejects endsAt before startsAt', async () => {
    const res = await postEvent().send({
      title: 'Kickoff',
      startsAt: '2026-12-01T18:00:00Z',
      endsAt: '2026-12-01T17:00:00Z',
    })
    expect(res.status).toBe(400)
    expect(res.body.details).toContain('endsAt must be after startsAt')
  })
})

describe('GET /api/events/share/:shareToken', () => {
  it('returns the event for a known token', async () => {
    vi.mocked(findEventByShareToken).mockResolvedValue(sample)
    const res = await request(app).get(`/api/events/share/${sample.shareToken}`)
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Kickoff')
    expect(findEventByShareToken).toHaveBeenCalledWith(sample.shareToken)
  })

  it('returns 404 for an unknown token', async () => {
    vi.mocked(findEventByShareToken).mockResolvedValue(undefined)
    const res = await request(app).get('/api/events/share/nope')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Event not found')
  })
})

describe('GET /api/events/:id', () => {
  it('returns the event for a known id', async () => {
    vi.mocked(findEventById).mockResolvedValue(sample)
    const res = await request(app).get(`/api/events/${sample.id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(sample.id)
    expect(findEventById).toHaveBeenCalledWith(sample.id)
  })

  it('returns 404 for an unknown id', async () => {
    vi.mocked(findEventById).mockResolvedValue(undefined)
    const res = await request(app).get(`/api/events/${sample.id}`)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Event not found')
  })

  it('rejects an id that is not a UUID without querying', async () => {
    const res = await request(app).get('/api/events/not-a-uuid')
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['id must be a valid UUID'])
    expect(findEventById).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/events/:id', () => {
  it('updates only the fields that were sent', async () => {
    vi.mocked(findEventById).mockResolvedValue(sample)
    vi.mocked(updateEvent).mockResolvedValue({ ...sample, title: 'Kickoff v2' })
    const res = await request(app).patch(`/api/events/${sample.id}`).send({ title: ' Kickoff v2 ' })
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Kickoff v2')
    expect(updateEvent).toHaveBeenCalledWith(sample.id, { title: 'Kickoff v2' })
  })

  it('clears nullable fields sent as null', async () => {
    const existing = { ...sample, location: 'HQ', endsAt: new Date('2026-12-01T20:00:00Z') }
    vi.mocked(findEventById).mockResolvedValue(existing)
    vi.mocked(updateEvent).mockResolvedValue(sample)
    const res = await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({ location: null, endsAt: null })
    expect(res.status).toBe(200)
    expect(updateEvent).toHaveBeenCalledWith(sample.id, { location: null, endsAt: null })
  })

  it('updates the event type, image, guest and settings fields', async () => {
    vi.mocked(findEventById).mockResolvedValue(sample)
    vi.mocked(updateEvent).mockResolvedValue(sample)
    const res = await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({
        eventType: 'Workshop',
        guestEmails: ['Grace@Example.com'],
        maxGuests: 20,
        isPublic: true,
        rsvpEnabled: false,
      })
    expect(res.status).toBe(200)
    expect(updateEvent).toHaveBeenCalledWith(sample.id, {
      eventType: 'Workshop',
      guestEmails: ['grace@example.com'],
      maxGuests: 20,
      isPublic: true,
      rsvpEnabled: false,
    })
  })

  it('clears the nullable new fields with null and the guest list with []', async () => {
    vi.mocked(findEventById).mockResolvedValue(sample)
    vi.mocked(updateEvent).mockResolvedValue(sample)
    const cleared = {
      eventType: null,
      imageUrl: null,
      maxGuests: null,
      admissionPrice: null,
      guestEmails: [],
    }
    const res = await request(app).patch(`/api/events/${sample.id}`).send(cleared)
    expect(res.status).toBe(200)
    expect(updateEvent).toHaveBeenCalledWith(sample.id, cleared)
  })

  it('rejects null for the guest list and the boolean settings', async () => {
    const res = await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({ guestEmails: null, isPublic: null, rsvpEnabled: null })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([
      'guestEmails must be an array of email addresses',
      'isPublic must be true or false',
      'rsvpEnabled must be true or false',
    ])
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('ignores id and shareToken in the body', async () => {
    vi.mocked(findEventById).mockResolvedValue(sample)
    vi.mocked(updateEvent).mockResolvedValue(sample)
    await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({ title: 'Kickoff', id: 'other', shareToken: 'mine' })
    expect(updateEvent).toHaveBeenCalledWith(sample.id, { title: 'Kickoff' })
  })

  it('rejects an empty title, a cleared startsAt and invalid dates', async () => {
    const res = await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({ title: '  ', startsAt: null, endsAt: 'later' })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([
      'title cannot be empty',
      invalidDate('startsAt'),
      invalidDate('endsAt'),
    ])
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('rejects a body with no updatable fields', async () => {
    const res = await request(app).patch(`/api/events/${sample.id}`).send({ shareToken: 'mine' })
    expect(res.status).toBe(400)
    expect(findEventById).not.toHaveBeenCalled()
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('rejects a new endsAt that is before the stored startsAt', async () => {
    vi.mocked(findEventById).mockResolvedValue(sample)
    const res = await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({ endsAt: '2026-12-01T17:00:00Z' })
    expect(res.status).toBe(400)
    expect(res.body.details).toContain('endsAt must be after startsAt')
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('rejects a new startsAt that is after the stored endsAt', async () => {
    vi.mocked(findEventById).mockResolvedValue({
      ...sample,
      endsAt: new Date('2026-12-01T20:00:00Z'),
    })
    const res = await request(app)
      .patch(`/api/events/${sample.id}`)
      .send({ startsAt: '2026-12-01T21:00:00Z' })
    expect(res.status).toBe(400)
    expect(res.body.details).toContain('endsAt must be after startsAt')
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown id', async () => {
    vi.mocked(findEventById).mockResolvedValue(undefined)
    const res = await request(app).patch(`/api/events/${sample.id}`).send({ title: 'Kickoff' })
    expect(res.status).toBe(404)
    expect(updateEvent).not.toHaveBeenCalled()
  })

  it('rejects an id that is not a UUID', async () => {
    const res = await request(app).patch('/api/events/not-a-uuid').send({ title: 'Kickoff' })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['id must be a valid UUID'])
    expect(findEventById).not.toHaveBeenCalled()
  })
})

describe('DELETE /api/events/:id', () => {
  it('deletes the event and returns 204', async () => {
    vi.mocked(deleteEvent).mockResolvedValue(true)
    const res = await request(app).delete(`/api/events/${sample.id}`)
    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
    expect(deleteEvent).toHaveBeenCalledWith(sample.id)
  })

  it('returns 404 for an unknown id', async () => {
    vi.mocked(deleteEvent).mockResolvedValue(false)
    const res = await request(app).delete(`/api/events/${sample.id}`)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Event not found')
  })

  it('rejects an id that is not a UUID without querying', async () => {
    const res = await request(app).delete('/api/events/not-a-uuid')
    expect(res.status).toBe(400)
    expect(deleteEvent).not.toHaveBeenCalled()
  })
})
