import { CirclePlay, Menu, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export function Header({
  menuOpen,
  setMenuOpen,
  setModal,
}: {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  setModal: (modal: string) => void
}) {
  return (
    <header>
      <div className="nav-shell">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <img src="/logo.png" alt="" width={40} height={40} />
          </span>
          Event<span>AI</span>
        </Link>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <Link to="/#features" onClick={() => setMenuOpen(false)}>
            Features
          </Link>
          <Link to="/#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </Link>
          <button onClick={() => setModal('demo')}>Live Demo</button>
          <button onClick={() => setModal('Pricing')}>Pricing</button>
        </nav>
        <div className="nav-actions">
          <button className="sign-in" onClick={() => setModal('signin')}>
            Sign In
          </button>
          <Button className="home-button nav-demo" onClick={() => setModal('demo')}>
            <CirclePlay /> Try Demo — Guest
          </Button>
          <button
            className="profile-button"
            aria-label="Sign in to your account"
            onClick={() => setModal('signin')}
          >
            <UserRound size={20} />
          </button>
          <button
            className="menu-button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
