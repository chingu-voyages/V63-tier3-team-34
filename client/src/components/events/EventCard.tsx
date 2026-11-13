import { Link } from 'react-router-dom'
import { Check, Clock3, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatars } from '@/components/home/Avatars'
import type { Event } from '@/data/events'

export function EventCard({
  event,
  city,
  joined,
  rsvp,
}: {
  event: Event
  city: string
  joined: string[]
  rsvp: (id: string) => void
}) {
  return (
    <article
      className={`event-card shadow-[0_2px_3px_#29213b06] transition-shadow duration-300 hover:shadow-xl motion-safe:transition-all motion-safe:hover:-translate-y-0.5 ${event.tone}`}
    >
      <div className="event-art">
        <div className="art-labels">
          <span>{event.category}</span>
          <span>{event.status}</span>
        </div>
        <event.icon size={48} strokeWidth={1.8} />
      </div>
      <p className="event-date">
        <Clock3 size={17} /> {event.date}
      </p>
      <h3>
        <Link className="event-card-link" to={`/events/${event.id}`}>
          {event.title.replace('Miami', city)}
        </Link>
      </h3>
      <p className="venue">
        <Navigation size={17} /> {event.venue} • {city}
      </p>
      <div className="organizer">
        <span>{event.initials}</span> Organized by {event.host}
      </div>
      <div className="event-card-bottom">
        <div className="attendee-count">
          <Avatars />
          <span>{event.guests}</span>
        </div>
        <Button
          className="home-button rsvp"
          aria-pressed={joined.includes(event.id)}
          onClick={() => rsvp(event.id)}
        >
          {joined.includes(event.id) ? (
            <>
              <Check /> Going
            </>
          ) : (
            '1-Tap RSVP'
          )}
        </Button>
      </div>
    </article>
  )
}
