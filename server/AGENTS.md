# Server API reference

This file describes every HTTP endpoint the server exposes. It is written so you can paste the whole thing into an AI assistant (ChatGPT, Claude, Copilot, ...) and then ask it to write frontend code against the API.

If you are an AI assistant reading this: treat it as the complete API. Do not use endpoints, fields or query parameters that are not listed here.

## Basics

- **Base URL:** `/api`. From the React client, always use relative URLs such as `fetch('/api/events')`; the dev server and the production nginx both forward `/api` to this server. Called directly, the server is at `http://localhost:3000/api`.
- **Format:** request and response bodies are JSON. Send `Content-Type: application/json` on every request that has a body.
- **Auth:** users log in with GitHub. The server then sets an `HttpOnly` session cookie, which the browser sends back automatically on every `/api` request; client code never reads or stores a token. Creating an event needs a login, and only the host of an event (the user who created it) can change or delete it. Reading events works for anonymous visitors, and so does answering an invitation: a guest is identified by the secret token in their invitation link, not by a login. See [Logging in](#logging-in).
- **CORS:** only the client origin (`http://localhost:5173` in development) may call the server directly from a browser. Relative `/api` URLs avoid the issue.

## Endpoints at a glance

| Method   | Path                                        | What it does                       | Success                      |
| -------- | ------------------------------------------- | ---------------------------------- | ---------------------------- |
| `GET`    | `/api`                                      | Confirm the API is reachable       | `200`                        |
| `GET`    | `/api/health`                               | Check that the server is up        | `200`                        |
| `GET`    | `/api/auth/github`                          | Start a GitHub login (a link)      | `302` redirect               |
| `GET`    | `/api/auth/me`                              | Get the logged-in user, if any     | `200` + user                 |
| `POST`   | `/api/auth/logout`                          | Log out                            | `204`, no body               |
| `POST`   | `/api/events`                               | Create an event (login needed)     | `201` + event                |
| `GET`    | `/api/events/:id`                           | Get one event by its id            | `200` + event                |
| `GET`    | `/api/events/share/:shareToken`             | Get one event by its share code    | `200` + event                |
| `PATCH`  | `/api/events/:id`                           | Change an event (host only)        | `200` + event                |
| `DELETE` | `/api/events/:id`                           | Delete an event (host only)        | `204`, no body               |
| `POST`   | `/api/events/:id/invitations`               | Invite guests (host only)          | `201` + invitations          |
| `GET`    | `/api/events/:id/invitations`               | List an event's guests (host only) | `200` + invitations          |
| `DELETE` | `/api/events/:id/invitations/:invitationId` | Uninvite a guest (host only)       | `204`, no body               |
| `GET`    | `/api/invitations/:token`                   | A guest views their invitation     | `200` + invitation and event |
| `PATCH`  | `/api/invitations/:token`                   | A guest accepts or declines        | `200` + invitation and event |

Things that do **not** exist:

- No email/password login, no sign-up form and no "forgot password". An account is created the first time someone logs in with GitHub.
- No Google login (or any provider other than GitHub) yet.
- No endpoint to edit or delete a user, and none to list or search users.
- No endpoint lists all events. `GET /api/events` returns `404`.
- No `PUT`. Updates use `PATCH`.
- No pagination, search, filtering or sorting.
- No image upload. An event stores a link to an image (`imageUrl`), not the image file.
- No `guestEmails` on an event. Guests are invited through the invitations endpoints; a `guestEmails` field sent when creating or changing an event is ignored.
- No invitation emails: inviting a guest only stores the invitation. The host has to pass on the guest's link.
- No RSVP for people who were not invited: nobody can add themselves to an event, also not to a public one. `isPublic` is only stored and returned.
- No page in the client for the guest's link yet. The link format is up to the client, for example `/rsvp/<token>`.

## Logging in

Login is a full-page redirect, not a `fetch` call:

1. The client sends the browser to `/api/auth/github` with a normal link: `<a href="/api/auth/github">Continue with GitHub</a>`. Do not use `fetch` and do not use a React Router `<Link>` for this.
2. The server redirects to GitHub, where the user approves.
3. GitHub sends the browser back to the server, which creates the user (first login only), sets the session cookie and redirects to the client: to `/`, or to the path given in `returnTo`.
4. The client calls `GET /api/auth/me` when it loads to find out who is logged in.

Details:

- **`returnTo`:** add `?returnTo=/eventdashboard` to the login link to land on that page after login. It must be a path on the client that starts with `/`; anything else is ignored and the user lands on `/`.
- **Failed login:** the browser is sent to `/?authError=<code>` on the client instead. Read it with `new URLSearchParams(location.search).get('authError')` and show a message.

  | `authError`        | Meaning                                                                |
  | ------------------ | ---------------------------------------------------------------------- |
  | `access_denied`    | The user pressed Cancel on the GitHub page                             |
  | `email_unverified` | The GitHub account has no verified primary email address               |
  | `invalid_state`    | The login took more than 10 minutes or was not started here. Try again |
  | `provider_error`   | GitHub could not be reached or rejected the login. Try again           |
  | `not_configured`   | The server has no GitHub client id/secret (see `.env.example`)         |

- **Session length:** 30 days from login, or until `POST /api/auth/logout`.
- **The cookie:** named `session`, `HttpOnly` (JavaScript cannot read it) and `SameSite=Lax`. `fetch('/api/...')` sends it by default; no `credentials` option or `Authorization` header is needed.

### The user object

```json
{
  "id": "0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11",
  "email": "ada@example.com",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "avatarUrl": "https://avatars.githubusercontent.com/u/583231?v=4",
  "createdAt": "2026-11-25T07:08:57.482Z"
}
```

| Field       | Type             | Notes                                                                                       |
| ----------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `id`        | string (UUID)    | Set by the server. The same value as `hostId` on the events this user created               |
| `email`     | string           | Lower-cased and verified by GitHub, so it can be compared with the `email` of an invitation |
| `firstName` | string           | Never empty. The GitHub username when the GitHub profile has no name                        |
| `lastName`  | string           | `""` when the provider only knows one name. Never `null`                                    |
| `avatarUrl` | string or `null` | Profile picture hosted by GitHub                                                            |
| `createdAt` | string           | ISO 8601 date-time in UTC of the first login                                                |

The name and picture are copied from GitHub at the first login and not refreshed afterwards. There is no `role` field: whether someone is the host of an event is `event.hostId === user.id`.

## The event object

Every endpoint that returns an event returns this shape:

```json
{
  "id": "ba34b75b-bd29-4ed8-944a-31ec5d690cd8",
  "shareToken": "N-BmF19VFtFEA6IPMJqotw",
  "hostId": "0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11",
  "title": "Team Kickoff",
  "description": "Sprint 1 planning",
  "location": "Zoom",
  "startsAt": "2026-12-01T18:00:00.000Z",
  "endsAt": "2026-12-01T19:30:00.000Z",
  "eventType": "Team Building",
  "imageUrl": "https://images.example.com/kickoff.png",
  "maxGuests": 50,
  "admissionPrice": 19.99,
  "isPublic": false,
  "rsvpEnabled": true,
  "createdAt": "2026-11-20T07:08:57.482Z",
  "updatedAt": "2026-11-20T07:08:57.482Z"
}
```

| Field            | Type             | Notes                                                                                                                                         |
| ---------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | string (UUID)    | Set by the server. Used in the URL to get, update or delete the event                                                                         |
| `shareToken`     | string           | Set by the server. 22 URL-safe characters, for shareable links                                                                                |
| `hostId`         | string or `null` | Set by the server: the `id` of the user who created the event. `null` on events from before logins existed, which nobody can change or delete |
| `title`          | string           | Never empty                                                                                                                                   |
| `description`    | string or `null` |                                                                                                                                               |
| `location`       | string or `null` |                                                                                                                                               |
| `startsAt`       | string           | ISO 8601 date-time in UTC                                                                                                                     |
| `endsAt`         | string or `null` | ISO 8601 date-time in UTC                                                                                                                     |
| `eventType`      | string or `null` | Free text, e.g. `"Team Building"`. The server does not restrict the values                                                                    |
| `imageUrl`       | string or `null` | Link to an image hosted somewhere else                                                                                                        |
| `maxGuests`      | number or `null` | Whole number, 1 or more: how many guests can accept. `null` means no limit                                                                    |
| `admissionPrice` | number or `null` | 0 or more, at most 2 decimal places. No currency is stored. `null` means not set                                                              |
| `isPublic`       | boolean          | `false` unless set                                                                                                                            |
| `rsvpEnabled`    | boolean          | `true` unless set. When `false`, guests cannot accept or decline                                                                              |
| `createdAt`      | string           | ISO 8601 date-time in UTC. Set by the server                                                                                                  |
| `updatedAt`      | string           | ISO 8601 date-time in UTC. Changes on every successful update                                                                                 |

TypeScript types for the client:

```ts
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string // '' when unknown
  avatarUrl: string | null
  createdAt: string
}

export interface Event {
  id: string
  shareToken: string
  hostId: string | null // User.id of the creator
  title: string
  description: string | null
  location: string | null
  startsAt: string // ISO 8601, e.g. "2026-12-01T18:00:00.000Z"
  endsAt: string | null
  eventType: string | null
  imageUrl: string | null
  maxGuests: number | null
  admissionPrice: number | null
  isPublic: boolean
  rsvpEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  title: string
  startsAt: string // ISO 8601 with a timezone
  endsAt?: string | null
  description?: string | null
  location?: string | null
  eventType?: string | null
  imageUrl?: string | null
  maxGuests?: number | null
  admissionPrice?: number | null
  isPublic?: boolean
  rsvpEnabled?: boolean
}

// Send only the fields you want to change.
export interface UpdateEventInput {
  title?: string
  startsAt?: string
  endsAt?: string | null
  description?: string | null
  location?: string | null
  eventType?: string | null
  imageUrl?: string | null
  maxGuests?: number | null
  admissionPrice?: number | null
  isPublic?: boolean
  rsvpEnabled?: boolean
}

export interface ApiError {
  error: string
  details?: string[]
}
```

## The invitation object

An invitation is one guest invited to one event. Guests are known by their email address and do not need an account.

```json
{
  "id": "7a1f6a52-4b53-4b0e-9a3c-0d6c1f2b9e10",
  "eventId": "ba34b75b-bd29-4ed8-944a-31ec5d690cd8",
  "email": "grace@example.com",
  "firstName": "Grace",
  "lastName": "Hopper",
  "status": "pending",
  "token": "kq3ZcVbnT0O1p9u4mYx2Hg",
  "respondedAt": null,
  "createdAt": "2026-11-25T07:08:57.482Z",
  "updatedAt": "2026-11-25T07:08:57.482Z"
}
```

| Field         | Type             | Notes                                                                                                                                         |
| ------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | string (UUID)    | Set by the server. Used in the URL to uninvite the guest                                                                                      |
| `eventId`     | string (UUID)    | The event the guest is invited to                                                                                                             |
| `email`       | string           | Lower-cased. A guest can be invited to the same event only once                                                                               |
| `firstName`   | string or `null` | Optional; `null` when the host did not give a name                                                                                            |
| `lastName`    | string or `null` | Optional; `null` when the host did not give a name                                                                                            |
| `status`      | string           | `"pending"` until the guest answers, then `"accepted"` or `"declined"`                                                                        |
| `token`       | string           | Set by the server. A secret that identifies this guest, meant for the guest's personal link. Treat it like a password for that one invitation |
| `respondedAt` | string or `null` | ISO 8601 date-time in UTC of the guest's answer. `null` while `pending`                                                                       |
| `createdAt`   | string           | ISO 8601 date-time in UTC. Set by the server                                                                                                  |
| `updatedAt`   | string           | ISO 8601 date-time in UTC                                                                                                                     |

```ts
export interface Invitation {
  id: string
  eventId: string
  email: string
  firstName: string | null
  lastName: string | null
  status: 'pending' | 'accepted' | 'declined'
  token: string
  respondedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GuestInput {
  email: string
  firstName?: string | null
  lastName?: string | null
}
```

Invitations are deleted together with their event.

**The guest's link.** The server sends no email, so the host passes the link on. Build it in the client from the `token`, for example `https://your-site/rsvp/kq3ZcVbnT0O1p9u4mYx2Hg`. The page behind that link reads the token from the URL and calls `GET /api/invitations/:token` and `PATCH /api/invitations/:token`. Anyone who has the link can answer for that guest, so show it only to the host.

The guest endpoints return the invitation together with its event:

```ts
export interface InvitationWithEvent {
  invitation: Invitation
  event: Event
}
```

## Rules for input fields

These apply to both `POST` and `PATCH` on events.

- **Dates** (`startsAt`, `endsAt`) must be ISO 8601 date-times that include seconds and a timezone: `2026-12-01T18:00:00Z` or `2026-12-01T13:00:00-05:00`. In JavaScript, `new Date(value).toISOString()` always produces a valid value. These are rejected: `2026-12-01` (no time), `2026-12-01T18:00:00` (no timezone), `2026-12-01T18:00Z` (no seconds), and numbers.
- **`endsAt` cannot be earlier than `startsAt`.**
- **Text** (`title`, `description`, `location`, `eventType`) is trimmed of leading and trailing spaces.
- **`title`** cannot be empty or only spaces.
- **`eventType`** is free text of at most 50 characters. The server does not check it against a list.
- **`imageUrl`** must be a full `http://` or `https://` link of at most 2048 characters. The server does not accept image files. A `blob:` URL from `URL.createObjectURL` or a `data:` URL is rejected: upload the image to a host first, then send the link it gives you.
- **`maxGuests`** must be a JSON number: a whole number of 1 or more. The string `"50"` is rejected, so convert form values with `Number(value)`.
- **`admissionPrice`** must be a JSON number of 0 or more with at most 2 decimal places, such as `19.99`. The string `"19.99"` is rejected.
- **`isPublic`, `rsvpEnabled`** must be `true` or `false`. The strings `"true"` and `"false"` are rejected.
- **Optional fields with no value:** for `description`, `location`, `endsAt`, `eventType`, `imageUrl`, `maxGuests` and `admissionPrice`, `null` and `""` both mean "no value" and are stored as `null`.
- **Defaults on create:** a field you leave out is stored as `null`, except `isPublic` (`false`) and `rsvpEnabled` (`true`).
- **Unknown fields are ignored.** You cannot set `id`, `shareToken`, `hostId`, `createdAt` or `updatedAt`; sending them has no effect. `hostId` is always the logged-in user.

## Errors

Every error response is JSON with an `error` string. Validation errors also have a `details` array with one message per problem.

| Status | When                                                              | Body                                                          |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| `400`  | The body or the id in the URL is invalid                          | `{ "error": "Validation failed", "details": ["...", "..."] }` |
| `400`  | The body is not valid JSON                                        | `{ "error": "<message from the JSON parser>" }`               |
| `401`  | The endpoint needs a login and there is no valid session          | `{ "error": "Authentication required" }`                      |
| `403`  | The user is logged in but is not the host of the event            | `{ "error": "Only the host of this event can do that" }`      |
| `404`  | No event has that id or share token                               | `{ "error": "Event not found" }`                              |
| `404`  | The event has no invitation with that id                          | `{ "error": "Invitation not found" }`                         |
| `404`  | No invitation has that token (also after the guest was uninvited) | `{ "error": "Invitation not found" }`                         |
| `409`  | A guest answers but the event has `rsvpEnabled: false`            | `{ "error": "This event is not taking responses" }`           |
| `409`  | A guest accepts but `maxGuests` guests have already accepted      | `{ "error": "This event is full" }`                           |
| `404`  | The URL or method is not an endpoint                              | `{ "error": "Route not found: GET /api/whatever" }`           |
| `500`  | Something broke on the server                                     | `{ "error": "Internal server error" }`                        |

Validation messages you can get in `details`:

- `title is required`, `title must be a string`, `title cannot be empty`
- `startsAt is required`
- `startsAt must be an ISO 8601 date-time with a timezone, e.g. 2026-12-01T18:00:00Z` (same for `endsAt`)
- `endsAt must be after startsAt`
- `description must be a string`, `location must be a string`, `eventType must be a string`
- `eventType must be at most 50 characters`
- `imageUrl must be an http or https URL`, `imageUrl must be at most 2048 characters`
- `maxGuests must be a whole number of at least 1`
- `admissionPrice must be a number of at least 0 with at most 2 decimal places`
- `isPublic must be true or false`, `rsvpEnabled must be true or false`
- `id must be a valid UUID`, `invitationId must be a valid UUID`
- `guests must be an array of 1 to 100 objects like { "email": "ada@example.com" }`
- `guests: every guest needs an email`
- `guests: "not-an-email" is not a valid email address`
- `status must be accepted or declined`
- `firstName must be a string`, `firstName must be at most 100 characters` (same for `lastName`)
- `provider must be one of github`
- `at least one of title, startsAt, endsAt, description, location, eventType, imageUrl, maxGuests, admissionPrice, isPublic, rsvpEnabled is required` (`PATCH` only)
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

### `GET /api/auth/github`

Starts a login. Open it with a link or `window.location.assign(...)`, never with `fetch`; see [Logging in](#logging-in).

- Optional query parameter `returnTo`: the client path to land on afterwards, e.g. `/api/auth/github?returnTo=/eventdashboard`.

Response `302`: a redirect to GitHub. The login ends with a redirect back to the client, to `returnTo` on success or to `/?authError=<code>` on failure.

(GitHub sends the browser back through `GET /api/auth/github/callback`. The client never calls that URL itself.)

### `GET /api/auth/me`

Returns the logged-in user. No input. Call it once when the app loads.

Response `200`, logged in:

```json
{
  "user": {
    "id": "0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11",
    "email": "ada@example.com",
    "firstName": "Ada",
    "lastName": "Lovelace",
    "avatarUrl": "https://avatars.githubusercontent.com/u/583231?v=4",
    "createdAt": "2026-11-25T07:08:57.482Z"
  }
}
```

Response `200`, not logged in (this is not an error, so there is no `401` here):

```json
{ "user": null }
```

### `POST /api/auth/logout`

Ends the session and removes the cookie. No request body.

Response `204` with an **empty body**, also when nobody was logged in.

### `POST /api/events`

Creates an event. **Needs a login:** the logged-in user becomes the event's host (`hostId`).

Request body:

| Field            | Required | Type                        | If left out |
| ---------------- | -------- | --------------------------- | ----------- |
| `title`          | yes      | string                      |             |
| `startsAt`       | yes      | ISO date-time               |             |
| `endsAt`         | no       | ISO date-time or `null`     | `null`      |
| `description`    | no       | string or `null`            | `null`      |
| `location`       | no       | string or `null`            | `null`      |
| `eventType`      | no       | string or `null`            | `null`      |
| `imageUrl`       | no       | http(s) URL or `null`       | `null`      |
| `maxGuests`      | no       | whole number ≥ 1, or `null` | `null`      |
| `admissionPrice` | no       | number ≥ 0, or `null`       | `null`      |
| `isPublic`       | no       | boolean                     | `false`     |
| `rsvpEnabled`    | no       | boolean                     | `true`      |

Example request:

```http
POST /api/events
Content-Type: application/json

{
  "title": "Team Kickoff",
  "description": "Sprint 1 planning",
  "location": "Zoom",
  "startsAt": "2026-12-01T18:00:00Z",
  "endsAt": "2026-12-01T19:30:00Z",
  "eventType": "Team Building",
  "imageUrl": "https://images.example.com/kickoff.png",
  "maxGuests": 50,
  "admissionPrice": 19.99,
  "isPublic": false,
  "rsvpEnabled": true
}
```

Only `title` and `startsAt` are needed; this is also a valid request:

```json
{ "title": "Standup", "startsAt": "2026-12-02T09:00:00Z" }
```

Response `201`: the created event object, including the new `id`, `shareToken` and `hostId`.

Errors: `401` if nobody is logged in (checked before the body is validated), `400` if validation fails. Example:

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

Changes some fields of an event. **Host only:** needs a login, and the logged-in user must be the event's host. Send only the fields you want to change; anything you leave out keeps its current value.

- `:id` must be a UUID.
- The body must contain at least one field from the create table above.
- `description`, `location`, `endsAt`, `eventType`, `imageUrl`, `maxGuests` and `admissionPrice` can be cleared by sending `null`.
- `title`, `startsAt`, `isPublic` and `rsvpEnabled` can be changed but not set to `null`.
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

Errors: `401` if nobody is logged in, `400` if `:id` is not a UUID or validation fails, `404` if no event has that id, `403` if the logged-in user is not the host.

### `DELETE /api/events/:id`

Deletes an event permanently. **Host only:** needs a login, and the logged-in user must be the event's host.

- `:id` must be a UUID.
- No request body.

Response `204` with an **empty body**. Do not call `response.json()` on it.

Errors: `401` if nobody is logged in, `400` if `:id` is not a UUID, `404` if no event has that id (including one that was already deleted), `403` if the logged-in user is not the host.

### `POST /api/events/:id/invitations`

Invites guests to an event. **Host only.** No email is sent: the invitation is only stored.

- `:id` is the event's id (a UUID).

Request body:

```json
{
  "guests": [
    { "email": "grace@example.com", "firstName": "Grace", "lastName": "Hopper" },
    { "email": "alan@example.com" }
  ]
}
```

- `guests` must be an array of 1 to 100 objects, not an array of strings and not one comma-separated string.
- `email` is required for every guest. It is trimmed and lower-cased.
- `firstName` and `lastName` are optional, trimmed and at most 100 characters; `""` and `null` both mean "no name".
- An email that appears twice in the request counts once (the first entry wins).
- A guest who is already invited to the event is left untouched and reported in `alreadyInvited`. This is not an error.

Response `201`:

```json
{
  "invitations": [
    {
      "id": "7a1f6a52-4b53-4b0e-9a3c-0d6c1f2b9e10",
      "eventId": "ba34b75b-bd29-4ed8-944a-31ec5d690cd8",
      "email": "grace@example.com",
      "firstName": "Grace",
      "lastName": "Hopper",
      "status": "pending",
      "token": "kq3ZcVbnT0O1p9u4mYx2Hg",
      "respondedAt": null,
      "createdAt": "2026-11-25T07:08:57.482Z",
      "updatedAt": "2026-11-25T07:08:57.482Z"
    }
  ],
  "alreadyInvited": ["alan@example.com"]
}
```

`invitations` holds only the invitations this request created. `alreadyInvited` holds the emails that were skipped. Either can be empty.

Errors: `401` if nobody is logged in, `400` if `:id` is not a UUID or validation fails, `404` if no event has that id, `403` if the logged-in user is not the host.

### `GET /api/events/:id/invitations`

Returns everyone invited to an event, oldest invitation first. **Host only**, because the list contains email addresses.

Response `200`:

```json
{ "invitations": [] }
```

`invitations` is an array of invitation objects; it is empty when nobody is invited. To show counts, count by `status` on the client.

Errors: `401` if nobody is logged in, `400` if `:id` is not a UUID, `404` if no event has that id, `403` if the logged-in user is not the host.

### `DELETE /api/events/:id/invitations/:invitationId`

Uninvites a guest. **Host only.** The guest's link stops working.

- `:invitationId` is the `id` of the invitation, not the guest's email or `token`.

Response `204` with an **empty body**.

Errors: `401` if nobody is logged in, `400` if either id is not a UUID, `404` if the event does not exist or has no invitation with that id, `403` if the logged-in user is not the host.

### `GET /api/invitations/:token`

Returns one invitation and its event, for the page a guest lands on. **No login.**

- `:token` is the `token` of the invitation, taken from the guest's link.

Response `200`:

```json
{
  "invitation": { "id": "7a1f6a52-4b53-4b0e-9a3c-0d6c1f2b9e10", "status": "pending", "...": "..." },
  "event": { "id": "ba34b75b-bd29-4ed8-944a-31ec5d690cd8", "title": "Team Kickoff", "...": "..." }
}
```

`invitation` is a full invitation object and `event` a full event object. Other guests are not included.

Errors: `404` if no invitation has that token.

### `PATCH /api/invitations/:token`

A guest accepts or declines their invitation. **No login.** The guest can call it again to change their answer.

Request body:

| Field       | Required | Type                         | Notes                                            |
| ----------- | -------- | ---------------------------- | ------------------------------------------------ |
| `status`    | yes      | `"accepted"` or `"declined"` | `"pending"` cannot be sent                       |
| `firstName` | no       | string or `null`             | Left out: the name the host entered is kept      |
| `lastName`  | no       | string or `null`             | Trimmed, at most 100 characters; `""` means none |

```json
{ "status": "accepted", "firstName": "Grace", "lastName": "Hopper" }
```

Rules:

- If the event has `rsvpEnabled: false`, every answer is refused with `409`.
- If the event has a `maxGuests` and that many guests have already accepted, accepting is refused with `409`. Declining always works, and a guest who has already accepted keeps their spot.
- `email`, `eventId` and `token` cannot be changed; sending them has no effect.

Response `200`: the same shape as `GET /api/invitations/:token`, with the new `status` and `respondedAt`.

Errors: `400` if validation fails, `404` if no invitation has that token, `409` if the event is not taking responses or is full. Show the `error` text of a `409` to the guest.

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

// null when nobody is logged in
export const getCurrentUser = async () => (await api<{ user: User | null }>('/auth/me')).user

export const logout = () => api<void>('/auth/logout', { method: 'POST' })

// Login is a page navigation, not a fetch: <a href={githubLoginUrl('/eventdashboard')}>
export const githubLoginUrl = (returnTo = '/') =>
  `/api/auth/github?returnTo=${encodeURIComponent(returnTo)}`

// Throws "Authentication required" when nobody is logged in; check getCurrentUser() first.
export const createEvent = (input: CreateEventInput) =>
  api<Event>('/events', { method: 'POST', body: JSON.stringify(input) })

export const getEvent = (id: string) => api<Event>(`/events/${id}`)

export const getEventByShareToken = (shareToken: string) =>
  api<Event>(`/events/share/${encodeURIComponent(shareToken)}`)

export const updateEvent = (id: string, input: UpdateEventInput) =>
  api<Event>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) })

export const deleteEvent = (id: string) => api<void>(`/events/${id}`, { method: 'DELETE' })

// Host only. Guests who were already invited come back in alreadyInvited, not as an error.
export const inviteGuests = (eventId: string, guests: GuestInput[]) =>
  api<{ invitations: Invitation[]; alreadyInvited: string[] }>(`/events/${eventId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ guests }),
  })

export const getInvitations = async (eventId: string) =>
  (await api<{ invitations: Invitation[] }>(`/events/${eventId}/invitations`)).invitations

export const removeInvitation = (eventId: string, invitationId: string) =>
  api<void>(`/events/${eventId}/invitations/${invitationId}`, { method: 'DELETE' })

// For the guest's page. No login needed; `token` comes from the URL of the guest's link.
export const getInvitation = (token: string) =>
  api<InvitationWithEvent>(`/invitations/${encodeURIComponent(token)}`)

// Throws "This event is full" or "This event is not taking responses" when the answer is refused.
export const answerInvitation = (
  token: string,
  answer: { status: 'accepted' | 'declined'; firstName?: string | null; lastName?: string | null },
) =>
  api<InvitationWithEvent>(`/invitations/${encodeURIComponent(token)}`, {
    method: 'PATCH',
    body: JSON.stringify(answer),
  })
```

Form inputs give you strings, so convert them before sending:

```ts
// date = "2026-12-01" from <input type="date">, time = "18:00" from <input type="time">
const startsAt = new Date(`${date}T${time}`).toISOString()

// "ada@example.com, grace@example.com" from a textarea, for inviteGuests()
const guests = guestText
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean)
  .map((email) => ({ email }))

// "" or "50" from <input type="number">
const maxGuests = capacityText === '' ? null : Number(capacityText)
const admissionPrice = priceText === '' ? null : Number(priceText)

// <input type="checkbox">
const isPublic = publicCheckbox.checked
```

How the create-event form maps to the API:

| Form field             | API field                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Event Title            | `title`                                                                              |
| Description            | `description`                                                                        |
| Date + Time            | `startsAt` (combined, see above)                                                     |
| Location               | `location`                                                                           |
| Event Type             | `eventType`                                                                          |
| Image                  | `imageUrl` (a link, not the file)                                                    |
| Invite Guests          | Not an event field: call `POST /api/events/:id/invitations` after creating the event |
| Maximum Guest Capacity | `maxGuests`                                                                          |
| Admission Price        | `admissionPrice`                                                                     |
| Public Event           | `isPublic`                                                                           |
| Guest Registration     | `rsvpEnabled`                                                                        |

## Keeping this file up to date

Update this file whenever an endpoint or a validation rule changes. The source of truth is:

- Routes: `src/app.ts`, `src/routes/auth.ts`, `src/routes/events.ts`, `src/routes/invitations.ts`, `src/routes/health.ts`
- Which routes need a login: the ones with `requireAuth` (`src/middleware/require-auth.ts`)
- Input validation: `src/schemas/events-schema.ts`, `src/schemas/invitations-schema.ts`, `src/schemas/auth-schema.ts`
- Business rules: `src/services/events-service.ts`, `src/services/invitations-service.ts`, `src/services/auth-service.ts`
- GitHub specifics: `src/auth/oauth-providers.ts`
- Error responses: `src/middleware/error-handler.ts`
- Database columns: `src/db/schema.ts`
