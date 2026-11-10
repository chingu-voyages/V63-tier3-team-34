import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Client' })).toBeTruthy()
  })

  it('increments and resets the counter', () => {
    render(<App />)
    const counter = screen.getByRole('button', { name: /count/i })
    fireEvent.click(counter)
    fireEvent.click(counter)
    expect(counter.textContent).toBe('Count: 2')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(counter.textContent).toBe('Count: 0')
  })
})
