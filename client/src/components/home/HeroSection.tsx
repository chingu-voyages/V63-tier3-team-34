import { ArrowRight } from 'lucide-react'
import {
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  MapPin,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatars } from './Avatars'
import { Dispatch } from './Dispatch'

export function HeroSection({
  joined,
  rsvp,
  setModal,
}: {
  joined: string[]
  rsvp: (id: string) => void
  setModal: (modal: string) => void
}) {
  return (
    <section className="hero section-shell">
      <div>
        <div className="rating">
          <span>★ 4.9/5</span> · from 2,500+ modern organizers
        </div>
        <h1>
          One link.
          <br />
          <span>Full event hype.</span>
          <br />
          Zero stress.
        </h1>
        <p className="hero-description">
          Create stunning events, pack the room, and get automated AI recaps in seconds.
          Frictionless web RSVP with no app download required for your guests.
        </p>
        <div className="hero-actions">
          <Button className="home-button large" onClick={() => setModal('demo')}>
            <Sparkles /> Try Demo — Guest
          </Button>
          <Button className="home-button light large" onClick={() => setModal('signin')}>
            Sign In / Register <ArrowRight />
          </Button>
        </div>
        <p className="reassurance">
          <CircleCheck size={17} /> Takes 30 seconds <i /> No credit card required <i /> Instant
          guest link
        </p>
        <div className="social-proof">
          <Avatars names={['AK', 'MR', 'SO', '+2.4k']} />
          <span>checked in this week across SF, NYC, and London</span>
        </div>
      </div>
      <article className="featured-event">
        <div className="flex items-center justify-between gap-3">
          <span className="status-pill">● Going ({joined.includes('featured') ? 143 : 142})</span>
          <span className="event-id">ID: #MIX-14</span>
        </div>
        <div className="featured-photo">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1100&q=85"
            alt="Guests gathered at an evening event under warm lights"
          />
          <div>
            <BadgeCheck size={20} /> Verified Host • TechVentures NYC
          </div>
        </div>
        <h2>
          <Link to="/events/featured">Founders & Builders Mixer #14</Link>
        </h2>
        <p className="event-detail">
          <CalendarDays /> <strong>Tomorrow, 7:00 PM – 10:30 PM EST</strong>
        </p>
        <p className="event-detail">
          <MapPin /> SoHo Arts Rooftop • 458 Broome St, NYC
        </p>
        <Dispatch />
        <div className="featured-bottom">
          <div className="attendee-count">
            <Avatars names={['JS', 'LC', 'EW']} />
            <span>+139 more</span>
          </div>
          <Button className="home-button green" onClick={() => rsvp('featured')}>
            <UserRoundCheck />
            {joined.includes('featured') ? 'You’re going!' : '1-Tap RSVP'} <ArrowRight />
          </Button>
        </div>
      </article>
    </section>
  )
}
import { Link } from 'react-router-dom'
