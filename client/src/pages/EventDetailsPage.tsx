import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, MapPin, UserRoundCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { events, featuredEvent } from '@/data/events'
import type { EventGridProps } from '@/components/events/EventGrid'

export function EventDetailsPage({ city, joined, rsvp }: EventGridProps) {
  const { eventId } = useParams()
  const event = [...events, featuredEvent].find((item) => item.id === eventId)
  const eventCity = eventId === 'featured' ? 'NYC' : city
  if (!event)
    return (
      <section className="event-page section-shell">
        <h1>Event not found</h1>
        <p>This event is unavailable. Explore the current event listings.</p>
        <Link className="text-link" to="/events">
          Browse all events
        </Link>
      </section>
    )
  const going = joined.includes(event.id)
  return (
    <section className={`event-page event-details section-shell ${event.tone}`}>
      <Link className="text-link" to="/events">
        <ArrowLeft size={18} /> All events
      </Link>
      <div className="event-details-layout">
        <article>
          <div className="event-art event-detail-art">
            <div className="art-labels">
              <span>{event.category}</span>
              <span>{event.status}</span>
            </div>
            <event.icon size={90} strokeWidth={1.5} />
          </div>
          <span className="eyebrow">{event.category}</span>
          <h1>{event.title.replace('Miami', eventCity)}</h1>
          <p className="event-detail">
            <CalendarDays /> {event.date}
          </p>
          <p className="event-detail">
            <MapPin /> {event.venue} • {eventCity}
          </p>
          <div className="event-about">
            <h2>About this event</h2>
            <p>
              Join {event.host} for {event.title.replace('Miami', eventCity)}. Connect with your
              local community at {event.venue}, meet new people, and be part of the conversation.
            </p>
            <h2>Your host</h2>
            <p>{event.host}</p>
          </div>
        </article>
        <aside className="event-booking">
          <span className="status-pill">{event.status}</span>
          <h2>Save your spot</h2>
          <p>{event.guests}</p>
          <Button
            className={`home-button rsvp ${event.tone === 'green' ? 'green' : ''}`}
            aria-pressed={going}
            onClick={() => rsvp(event.id)}
          >
            {going ? <Check /> : <UserRoundCheck />}
            {going ? 'You’re going!' : '1-Tap RSVP'}
          </Button>
          <p aria-live="polite">
            {going
              ? 'Your demo RSVP is confirmed. Click again to cancel.'
              : 'RSVP in one tap. No app download needed.'}
          </p>
          <small>Demo event. No real reservation is made.</small>
        </aside>
      </div>
    </section>
  )
}
