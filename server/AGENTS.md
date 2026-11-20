# Server API reference

This file describes every HTTP endpoint the server exposes. It is written so you can paste the whole thing into an AI assistant (ChatGPT, Claude, Copilot, ...) and then ask it to write frontend code against the API.

If you are an AI assistant reading this: treat it as the complete API. Do not use endpoints, fields or query parameters that are not listed here.

## Basics

- **Base URL:** `/api`. From the React client, always use relative URLs such as `fetch('/api/events')`; the dev server and the production nginx both forward `/api` to this server. Called directly, the server is at `http://localhost:3000/api`.
- **Format:** request and response bodies are JSON. Send `Content-Type: application/json` on every request that has a body.
- **Auth:** none. There are no logins, cookies or tokens.
- **CORS:** only the client origin (`http://localhost:5173` in development) may call the server directly from a browser. Relative `/api` URLs avoid the issue.

## Endpoints at a glance

| Method   | Path                            | What it does                    | Success        |
| -------- | ------------------------------- | ------------------------------- | -------------- |
| `GET`    | `/api`                          | Confirm the API is reachable    | `200`          |
| `GET`    | `/api/health`                   | Check that the server is up     | `200`          |
| `POST`   | `/api/events`                   | Create an event                 | `201` + event  |
| `GET`    | `/api/events/:id`               | Get one event by its id         | `200` + event  |
| `GET`    | `/api/events/share/:shareToken` | Get one event by its share code | `200` + event  |
| `PATCH`  | `/api/events/:id`               | Change some fields of an event  | `200` + event  |
| `DELETE` | `/api/events/:id`               | Delete an event                 | `204`, no body |

Things that do **not** exist:

- No endpoint lists all events. `GET /api/events` returns `404`.
- No `PUT`. Updates use `PATCH`.
- No pagination, search, filtering or sorting.

## The event object

Every endpoint that returns an event returns this shape:

```json
{
  "id": "ba34b75b-bd29-4ed8-944a-31ec5d690cd8",
  "shareToken": "N-BmF19VFtFEA6IPMJqotw",
  "title": "Team Kickoff",
  "description": "Sprint 1 planning",
  "location": "Zoom",
  "startsAt": "2026-12-01T18:00:00.000Z",
  "endsAt": "2026-12-01T19:30:00.000Z",
  "createdAt": "2026-11-20T07:08:57.482Z",
  "updatedAt": "2026-11-20T07:08:57.482Z"
}
```

| Field         | Type             | Notes                                                                 |
| ------------- | ---------------- | --------------------------------------------------------------------- |
| `id`          | string (UUID)    | Set by the server. Used in the URL to get, update or delete the event |
| `shareToken`  | string           | Set by the server. 22 URL-safe characters, for shareable links        |
| `title`       | string           | Never empty                                                           |
| `description` | string or `null` |                                                                       |
| `location`    | string or `null` |                                                                       |
| `startsAt`    | string           | ISO 8601 date-time in UTC                                             |
| `endsAt`      | string or `null` | ISO 8601 date-time in UTC                                             |
| `createdAt`   | string           | ISO 8601 date-time in UTC. Set by the server                          |
| `updatedAt`   | string           | ISO 8601 date-time in UTC. Changes on every successful update         |

TypeScript types for the client:

```ts
export interface Event {
  id: string
  shareToken: string
  title: string
  description: string | null
  location: string | null
  startsAt: string // ISO 8601, e.g. "2026-12-01T18:00:00.000Z"
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  title: string
  startsAt: string // ISO 8601 with a timezone
  endsAt?: string | null
  description?: string | null
  location?: string | null
}

// Send only the fields you want to change.
export interface UpdateEventInput {
  title?: string
  startsAt?: string
  endsAt?: string | null
  description?: string | null
  location?: string | null
}

export interface ApiError {
  error: string
  details?: string[]
}
```

## Rules for input fields

These apply to both `POST` and `PATCH`.

- **Dates** (`startsAt`, `endsAt`) must be ISO 8601 date-times that include seconds and a timezone: `2026-12-01T18:00:00Z` or `2026-12-01T13:00:00-05:00`. In JavaScript, `new Date(value).toISOString()` always produces a valid value. These are rejected: `2026-12-01` (no time), `2026-12-01T18:00:00` (no timezone), `2026-12-01T18:00Z` (no seconds), and numbers.
- **`endsAt` cannot be earlier than `startsAt`.**
- **Text** (`title`, `description`, `location`) is trimmed of leading and trailing spaces.
- **`title`** cannot be empty or only spaces.
- **`description`, `location`, `endsAt`** are optional. `null` and `""` both mean "no value" and are stored as `null`.
- **Unknown fields are ignored.** You cannot set `id`, `shareToken`, `createdAt` or `updatedAt`; sending them has no effect.

## Errors

Every error response is JSON with an `error` string. Validation errors also have a `details` array with one message per problem.

| Status | When                                     | Body                                                          |
| ------ | ---------------------------------------- | ------------------------------------------------------------- |
| `400`  | The body or the id in the URL is invalid | `{ "error": "Validation failed", "details": ["...", "..."] }` |
| `400`  | The body is not valid JSON               | `{ "error": "<message from the JSON parser>" }`               |
| `404`  | No event has that id or share token      | `{ "error": "Event not found" }`                              |
| `404`  | The URL or method is not an endpoint     | `{ "error": "Route not found: GET /api/whatever" }`           |
| `500`  | Something broke on the server            | `{ "error": "Internal server error" }`                        |

Validation messages you can get in `details`:

- `title is required`, `title must be a string`, `title cannot be empty`
- `startsAt is required`
- `startsAt must be an ISO 8601 date-time with a timezone, e.g. 2026-12-01T18:00:00Z` (same for `endsAt`)
- `endsAt must be after startsAt`
- `description must be a string`, `location must be a string`
- `id must be a valid UUID`
- `at least one of title, description, location, startsAt, endsAt is required` (`PATCH` only)
- `Request body must be a JSON object`

## Endpoint details

### `GET /api`

Confirms the API is reachable and points to the health check. No input.

Response `200`:

```json
{ "message": "API is running", "health": "/api/health" }
```

### `GET /api/health`

Checks that the server is running. No input.

Response `200`:

```json
{ "status": "ok", "uptime": 12.345 }
```

`uptime` is the number of seconds the server has been running.

### `POST /api/events`

Creates an event.

Request body:

| Field         | Required | Type                    |
| ------------- | -------- | ----------------------- |
| `title`       | yes      | string                  |
| `startsAt`    | yes      | ISO date-time           |
| `endsAt`      | no       | ISO date-time or `null` |
| `description` | no       | string or `null`        |
| `location`    | no       | string or `null`        |

Example request:

```http
POST /api/events
Content-Type: application/json

{
  "title": "Team Kickoff",
  "description": "Sprint 1 planning",
  "location": "Zoom",
  "startsAt": "2026-12-01T18:00:00Z",
  "endsAt": "2026-12-01T19:30:00Z"
}
```

Response `201`: the created event object, including the new `id` and `shareToken`.

Errors: `400` if validation fails. Example:

```json
{
  "error": "Validation failed",
  "details": [
    "title is required",
    "startsAt must be an ISO 8601 date-time with a timezone, e.g. 2026-12-01T18:00:00Z"
  ]
}
```

### `GET /api/events/:id`

Returns one event by its `id`.

- `:id` must be a UUID, for example `/api/events/ba34b75b-bd29-4ed8-944a-31ec5d690cd8`.
- No request body.

Response `200`: the event object.

Errors: `400` if `:id` is not a UUID, `404` if no event has that id.

### `GET /api/events/share/:shareToken`

Returns one event by its `shareToken`. Use this for shareable links, where the URL carries the share token instead of the id.

- Example: `/api/events/share/N-BmF19VFtFEA6IPMJqotw`.
- No request body.

Response `200`: the event object (same shape as above, including `id`).

Errors: `404` if no event has that share token.

### `PATCH /api/events/:id`

Changes some fields of an event. Send only the fields you want to change; anything you leave out keeps its current value.

- `:id` must be a UUID.
- The body must contain at least one of `title`, `description`, `location`, `startsAt`, `endsAt`.
- `description`, `location` and `endsAt` can be cleared by sending `null`.
- `title` and `startsAt` can be changed but not cleared.
- If you send only one of the two dates, it is checked against the other one already stored. For example, moving `startsAt` to after the stored `endsAt` is rejected; send both dates together to move the whole event.

Example request, renaming an event and removing its location:

```http
PATCH /api/events/ba34b75b-bd29-4ed8-944a-31ec5d690cd8
Content-Type: application/json

{
  "title": "Team Kickoff v2",
  "location": null
}
```

Response `200`: the full updated event object. `updatedAt` has a new value; `id`, `shareToken` and `createdAt` never change.

Errors: `400` if `:id` is not a UUID or validation fails, `404` if no event has that id.

### `DELETE /api/events/:id`

Deletes an event permanently.

- `:id` must be a UUID.
- No request body.

Response `204` with an **empty body**. Do not call `response.json()` on it.

Errors: `400` if `:id` is not a UUID, `404` if no event has that id (including one that was already deleted).

## Example client code

A small typed wrapper around `fetch` that handles the empty `204` response and turns error responses into exceptions:

```ts
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (response.status === 204) return undefined as T
  const body = await response.json()
  if (!response.ok) {
    const { error, details } = body as ApiError
    throw new Error(details?.length ? details.join(', ') : error)
  }
  return body as T
}

export const createEvent = (input: CreateEventInput) =>
  api<Event>('/events', { method: 'POST', body: JSON.stringify(input) })

export const getEvent = (id: string) => api<Event>(`/events/${id}`)

export const getEventByShareToken = (shareToken: string) =>
  api<Event>(`/events/share/${encodeURIComponent(shareToken)}`)

export const updateEvent = (id: string, input: UpdateEventInput) =>
  api<Event>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) })

export const deleteEvent = (id: string) => api<void>(`/events/${id}`, { method: 'DELETE' })
```

Turning a date and a time from form inputs into a valid `startsAt`:

```ts
// date = "2026-12-01" from <input type="date">, time = "18:00" from <input type="time">
const startsAt = new Date(`${date}T${time}`).toISOString()
```

## Keeping this file up to date

Update this file whenever an endpoint or a validation rule changes. The source of truth is:

- Routes: `src/app.ts`, `src/routes/events.ts`, `src/routes/health.ts`
- Input validation: `src/schemas/events-schema.ts`
- Business rules: `src/services/events-service.ts`
- Error responses: `src/middleware/error-handler.ts`
- Database columns: `src/db/schema.ts`
