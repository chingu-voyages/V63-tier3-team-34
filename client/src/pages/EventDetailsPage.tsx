import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, MapPin, UserRoundCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { events, featuredEvent } from '@/data/events'
import type { EventGridProps } from '@/components/events/EventGrid'

export function EventDetailsPage({ city, joined, rsvp }: EventGridProps) {
  const { eventId } = useParams()
  const event = [...events, featuredEvent].find((item) => item.id === eventId)
  const eventCity = eventId === featuredEvent.id ? featuredEvent.city : city
  if (!event)
    return (
      <section className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5 min-h-[65vh] pt-10 pb-16">
        <h1 className="mt-3 mb-5 text-3xl leading-tight sm:text-5xl">Event not found</h1>
        <p>This event is unavailable. Explore the current event listings.</p>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4"
          to="/events"
        >
          Browse all events
        </Link>
      </section>
    )
  const going = joined.includes(event.id)
  return (
    <section className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5 min-h-[65vh] pt-10 pb-16">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4 mb-8"
        to="/events"
      >
        <ArrowLeft size={18} /> All events
      </Link>
      <div className="grid items-start gap-10 min-[701px]:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] max-[700px]:gap-7">
        <article>
          <div className="relative mb-7 grid h-57.5 place-items-center rounded-lg bg-linear-[35deg,#bcb5f5,#c8c3f3_55%,#acc6c5] text-[#9990e8] min-[701px]:h-80">
            <div className="absolute inset-x-3 top-3 flex flex-wrap justify-between gap-2">
              <Badge variant="secondary">{event.category}</Badge>
              <Badge variant="outline">{event.status}</Badge>
            </div>
            <event.icon size={90} strokeWidth={1.5} />
          </div>
          <Badge variant="secondary" className="mb-3">
            {event.category}
          </Badge>
          <h1 className="mt-3 mb-5 text-3xl leading-tight sm:text-5xl">
            {event.title.replace('Miami', eventCity)}
          </h1>
          <p className="mb-1 flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary">
            <CalendarDays /> {event.date}
          </p>
          <p className="mb-1 flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary">
            <MapPin /> {event.venue} • {eventCity}
          </p>
          <div className="[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[25px] [&_p]:text-[17px] [&_p]:leading-[1.7]">
            <h2>About this event</h2>
            <p>
              Join {event.host} for {event.title.replace('Miami', eventCity)}. Connect with your
              local community at {event.venue}, meet new people, and be part of the conversation.
            </p>
            <h2>Your host</h2>
            <p>{event.host}</p>
          </div>
        </article>
        <Card
          role="complementary"
          className="sticky top-6 items-start gap-5 p-6 max-[700px]:static"
        >
          <Badge variant="secondary">{event.status}</Badge>
          <h2>Save your spot</h2>
          <p>{event.guests}</p>
          <Button
            variant={
              event.tone === 'green' ? 'success' : event.tone === 'purple' ? 'violet' : 'default'
            }
            className="w-full"
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
          <small className="text-muted-foreground">Demo event. No real reservation is made.</small>
        </Card>
      </div>
    </section>
  )
}
