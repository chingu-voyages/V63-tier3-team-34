import { EventCard } from './EventCard'
import { events } from '@/data/events'

export type EventGridProps = {
  city: string
  joined: string[]
  rsvp: (id: string) => void
}

export function EventGrid({ limit, ...props }: EventGridProps & { limit?: number }) {
  return (
    <div className="event-grid">
      {events.slice(0, limit).map((event) => (
        <EventCard key={event.id} event={event} {...props} />
      ))}
    </div>
  )
}
