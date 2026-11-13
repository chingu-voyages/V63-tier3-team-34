import { render, screen, fireEvent, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })
  it('renders the homepage sections', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Full event hype.')
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeTruthy()
  })

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
