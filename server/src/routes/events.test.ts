import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Event } from '../db/schema.js'

vi.mock('../db/events-repo.js', () => ({
  createEvent: vi.fn(),
  findEventById: vi.fn(),
  findEventByShareToken: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

const { createEvent, findEventById, findEventByShareToken, updateEvent, deleteEvent } =
  await import('../db/events-repo.js')
const { app } = await import('../app.js')

const invalidDate = (name: string) =>
  `${name} must be an ISO 8601 date-time with a timezone, e.g. 2026-12-01T18:00:00Z`

const sample: Event = {
  id: '14835685-efc2-45f6-b5fc-c78b59d99fc0',
  shareToken: '4u-5zoKZ90hicHJ8buaX7A',
  title: 'Kickoff',
  description: null,
  location: null,
  startsAt: new Date('2026-12-01T18:00:00Z'),
  endsAt: null,
  createdAt: new Date('2026-11-12T00:00:00Z'),
  updatedAt: new Date('2026-11-12T00:00:00Z'),
}

beforeEach(() => {
  vi.mocked(createEvent).mockReset()
  vi.mocked(findEventById).mockReset()
  vi.mocked(findEventByShareToken).mockReset()
  vi.mocked(updateEvent).mockReset()
  vi.mocked(deleteEvent).mockReset()
})

describe('POST /api/events', () => {
  it('creates an event and returns it with a shareToken', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00Z' })
    expect(res.status).toBe(201)
    expect(res.body.shareToken).toBe(sample.shareToken)
    expect(createEvent).toHaveBeenCalledWith({
      title: 'Kickoff',
      startsAt: new Date('2026-12-01T18:00:00Z'),
    })
  })

  it('trims text and stores blank optional fields as null', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    const res = await request(app).post('/api/events').send({
      title: ' Kickoff ',
      startsAt: '2026-12-01T20:00:00+02:00',
      endsAt: '',
      description: '  ',
      location: ' HQ ',
    })
    expect(res.status).toBe(201)
    expect(createEvent).toHaveBeenCalledWith({
      title: 'Kickoff',
      startsAt: new Date('2026-12-01T18:00:00Z'),
      endsAt: null,
      description: null,
      location: 'HQ',
    })
  })

  it('ignores a client-supplied shareToken', async () => {
    vi.mocked(createEvent).mockResolvedValue(sample)
    await request(app)
      .post('/api/events')
      .send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00Z', shareToken: 'mine' })
    expect(vi.mocked(createEvent).mock.calls[0]![0]).not.toHaveProperty('shareToken')
  })

  it('rejects a missing title and invalid dates', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ startsAt: 'yesterday-ish', endsAt: '2026-12-01T18:00:00Z' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Validation failed')
    expect(res.body.details).toEqual(['title is required', invalidDate('startsAt')])
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('rejects a date-time without a timezone', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Kickoff', startsAt: '2026-12-01T18:00:00' })
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual([invalidDate('startsAt')])
  })

  it('rejects a request without a JSON body', async () => {
    const res = await request(app).post('/api/events')
    expect(res.status).toBe(400)
    expect(res.body.details).toEqual(['Request body must be a JSON object'])
  })

  it('rejects endsAt before startsAt', async () => {
    const res = await request(app).post('/api/events').send({
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
