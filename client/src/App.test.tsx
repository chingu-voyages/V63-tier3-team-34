import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/eventdashboard')
  })

  it('renders the events dashboard', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Events Dashboard' })).toBeTruthy()
  })
})
