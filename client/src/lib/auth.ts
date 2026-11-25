import { useEffect, useState } from 'react'

/** The logged-in user, as returned by GET /api/auth/me. */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string // '' when unknown
  avatarUrl: string | null
  createdAt: string
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me')
    if (!response.ok) return null
    return ((await response.json()) as { user: User | null }).user
  } catch {
    // The server being unreachable should not break the page; show it as signed out.
    return null
  }
}

/**
 * Who is signed in. `user` is `undefined` until the server has answered, then the user or `null`.
 * The session itself lives in an HttpOnly cookie that the browser sends on its own, so there is
 * no token to store here.
 */
export function useAuth(): { user: User | null | undefined; logout: () => Promise<void> } {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    void fetchCurrentUser().then((current) => {
      if (!cancelled) setUser(current)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const logout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (response.ok) setUser(null)
  }

  return { user, logout }
}
