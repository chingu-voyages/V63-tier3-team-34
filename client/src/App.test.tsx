import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const ada = {
  id: '0b9d3f0e-6c1f-4f65-9d0f-3f1f0a3c8a11',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  avatarUrl: 'https://avatars.example.com/ada.png',
  createdAt: '2026-11-25T07:08:57.482Z',
}

/** Stands in for the server: answers /api/auth/me with `user` and accepts a logout. */
function stubServer(user: typeof ada | null) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === '/api/auth/me') return Response.json({ user })
    if (url === '/api/auth/logout' && init?.method === 'POST') {
      return new Response(null, { status: 204 })
    }
    return new Response(null, { status: 404 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    stubServer(null)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })
  it('renders the events dashboard', () => {
    window.history.replaceState({}, '', '/eventdashboard')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Events Dashboard' })).toBeTruthy()
  })

  it('renders the homepage sections', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Full event hype.')
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeTruthy()
  })

  it('opens mobile navigation and closes it after navigating', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    const navigation = screen.getByRole('dialog', { name: 'EventAI' })
    fireEvent.click(within(navigation).getByRole('link', { name: 'Features' }))
    expect(window.location.hash).toBe('#features')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('offers GitHub sign-in from the header and closes the dialog', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    const dialog = screen.getByRole('dialog', { name: 'Welcome to EventAI' })
    expect(
      within(dialog).getByRole('link', { name: 'Continue with GitHub' }).getAttribute('href'),
    ).toBe('/api/auth/github?returnTo=%2F')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('sends the user back to the page they signed in from', () => {
    window.history.replaceState({}, '', '/events/ai?ref=share#details')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(screen.getByRole('link', { name: 'Continue with GitHub' }).getAttribute('href')).toBe(
      '/api/auth/github?returnTo=%2Fevents%2Fai%3Fref%3Dshare%23details',
    )
  })

  it('shows who is signed in instead of the sign-in buttons', async () => {
    stubServer(ada)
    render(<App />)
    expect(await screen.findByRole('img', { name: 'Signed in as Ada Lovelace' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Sign In' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Sign in to your account' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Sign In \/ Register/ })).toBeNull()
    expect(screen.getByRole('link', { name: 'Go to dashboard' }).getAttribute('href')).toBe(
      '/eventdashboard',
    )
  })

  it('logs out and goes back to the sign-in buttons', async () => {
    const fetchMock = stubServer(ada)
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('button', { name: 'Sign In' })).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(screen.queryByRole('img', { name: /Signed in as/ })).toBeNull()
    expect(screen.getByRole('button', { name: /Sign In \/ Register/ })).toBeTruthy()
  })

  it('offers Log out in the mobile navigation', async () => {
    stubServer(ada)
    render(<App />)
    await screen.findByRole('img', { name: 'Signed in as Ada Lovelace' })
    fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    const navigation = screen.getByRole('dialog', { name: 'EventAI' })
    fireEvent.click(within(navigation).getByRole('button', { name: 'Log out' }))
    expect(await screen.findByRole('button', { name: 'Sign In' })).toBeTruthy()
  })

  it('stays signed in when the logout request fails', async () => {
    const fetchMock = stubServer(ada)
    render(<App />)
    const logout = await screen.findByRole('button', { name: 'Log out' })
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    fireEvent.click(logout)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy()
  })

  it('shows the sign-in buttons when the server cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    render(<App />)
    const signIn = await screen.findByRole('button', { name: 'Sign In' })
    await waitFor(() => expect(signIn.className).not.toContain('invisible'))
  })

  it('hides the sign-in buttons until the server has answered', async () => {
    let answer!: (response: Response) => void
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))),
    )
    render(<App />)
    const signIn = screen.getByRole('button', { name: 'Sign In' })
    expect(signIn.className).toContain('invisible')
    answer(Response.json({ user: null }))
    await waitFor(() => expect(signIn.className).not.toContain('invisible'))
  })

  it.each(['/', '/events', '/events/ai', '/events/missing', '/missing'])(
    'keeps the official repository link in the footer on %s',
    (path) => {
      window.history.replaceState({}, '', path)
      render(<App />)
      const footer = screen.getByRole('contentinfo')
      expect(
        within(footer).getByRole('link', { name: 'GitHub repository' }).getAttribute('href'),
      ).toBe('https://github.com/chingu-voyages/V63-tier3-team-34')
    },
  )

  it('confirms and cancels an event RSVP', () => {
    render(<App />)
    const button = screen.getAllByRole('button', { name: '1-Tap RSVP' })[1]
    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('false')
  })

  it('changes the demo location', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Miami, FL/ }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Miami Beach' }))
    expect(screen.getByRole('button', { name: /Miami Beach, FL/ })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('supports the guest demo RSVP', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Live Demo' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Try 1-Tap RSVP' }))
    expect(within(dialog).getByRole('button', { name: /RSVP confirmed/ })).toBeTruthy()
  })

  it('navigates to the events page and opens event details', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'View all events' }))
    expect(window.location.pathname).toBe('/events')
    expect(screen.getByRole('heading', { level: 1, name: 'All events in Miami' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Miami AI Founders & Web3 Demo Night' }))
    expect(window.location.pathname).toBe('/events/ai')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Miami AI Founders & Web3 Demo Night' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '1-Tap RSVP' }))
    fireEvent.click(screen.getByRole('link', { name: 'All events' }))
    expect(screen.getByRole('button', { name: 'Going' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('opens event details directly and handles unknown event IDs', () => {
    window.history.replaceState({}, '', '/events/missing')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Event not found' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Browse all events' }))
    expect(screen.getByRole('heading', { name: 'All events in Miami' })).toBeTruthy()
  })

  it('keeps RSVP clicks on the homepage instead of opening details', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: '1-Tap RSVP' })[1])
    expect(window.location.pathname).toBe('/')
    fireEvent.click(screen.getByRole('link', { name: 'Miami AI Founders & Web3 Demo Night' }))
    expect(screen.getByRole('button', { name: 'You’re going!' })).toBeTruthy()
  })
})
