import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Event } from '../db/schema.js'

vi.mock('../db/events-repo.js', () => ({
  createEvent: vi.fn(),
  findEventByShareToken: vi.fn(),
}))

const { createEvent, findEventByShareToken } = await import('../db/events-repo.js')
const { app } = await import('../app.js')

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
  vi.mocked(findEventByShareToken).mockReset()
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
      endsAt: null,
      description: null,
      location: null,
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
    expect(res.body.details).toEqual(
      expect.arrayContaining(['title is required', 'startsAt must be a valid ISO date']),
    )
    expect(createEvent).not.toHaveBeenCalled()
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

describe('GET /api/events/:shareToken', () => {
  it('returns the event for a known token', async () => {
    vi.mocked(findEventByShareToken).mockResolvedValue(sample)
    const res = await request(app).get(`/api/events/${sample.shareToken}`)
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Kickoff')
    expect(findEventByShareToken).toHaveBeenCalledWith(sample.shareToken)
  })

  it('returns 404 for an unknown token', async () => {
    vi.mocked(findEventByShareToken).mockResolvedValue(undefined)
    const res = await request(app).get('/api/events/nope')
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Event not found')
  })
})
