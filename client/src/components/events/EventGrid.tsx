import { EventCard } from './EventCard'
import { events } from '@/data/events'

export type EventGridProps = {
  city: string
  joined: string[]
  rsvp: (id: string) => void
}

export function EventGrid({ limit, ...props }: EventGridProps & { limit?: number }) {
  return (
    <div className="grid grid-cols-3 gap-8 max-[1150px]:gap-5 max-[850px]:grid-cols-2 max-[580px]:grid-cols-1">
      {events.slice(0, limit).map((event) => (
        <EventCard key={event.id} event={event} {...props} />
      ))}
    </div>
  )
}
