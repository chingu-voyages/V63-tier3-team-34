import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Check, Clock3, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <Card
      role="article"
      className="relative h-full gap-0 overflow-visible rounded-[17px] border border-border p-4.25 ring-0 shadow-sm transition-shadow hover:shadow-xl motion-reduce:transition-none"
    >
      <div
        className={`relative grid h-47.5 place-items-center rounded-[13px] max-[580px]:h-50 ${event.tone === 'green' ? 'bg-linear-[35deg,#a8c5c7,#c8c5f6_65%] text-[#80a6ac]' : event.tone === 'purple' ? 'bg-linear-[35deg,#bfb0f1,#c5c8f4,#b5ccd3] text-[#a38ae6]' : 'bg-linear-[35deg,#bcb5f5,#c8c3f3_55%,#acc6c5] text-[#9990e8]'}`}
      >
        <div className="absolute inset-x-3.25 top-4.5 flex justify-between gap-1 **:data-[slot=badge]:text-[10px] **:data-[slot=badge]:font-mono">
          <Badge variant="secondary" className="rounded-sm bg-[#484d69] text-white">
            {event.category}
          </Badge>
          <Badge
            variant="outline"
            className={
              event.tone === 'purple'
                ? 'border-0 bg-[#e9d9ff] text-[#371280]'
                : 'border-0 bg-[#79efc0] text-[#00745c]'
            }
          >
            {event.status}
          </Badge>
        </div>
        <event.icon size={48} strokeWidth={1.8} />
      </div>
      <p
        className={`mt-3 mb-1.75 flex items-center gap-1.25 text-[13px] font-medium ${event.tone === 'green' ? 'text-[#008363]' : event.tone === 'purple' ? 'text-[#7c38e2]' : 'text-[#5c4bef]'}`}
      >
        <Clock3 size={17} /> {event.date}
      </p>
      <h3 className="text-[19px]! tracking-[-0.3px]!">
        <Link
          className="after:absolute after:inset-0 after:rounded-[17px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-solid focus-visible:after:outline-ring focus-visible:after:outline-offset-4"
          to={`/events/${event.id}`}
        >
          {event.title.replace('Miami', city)}
        </Link>
      </h3>
      <p className="mt-1.75 flex items-center gap-1.5 text-sm [&_svg]:shrink-0 [&_svg]:text-[#7e869a]">
        <Navigation size={17} /> {event.venue} • {city}
      </p>
      <div className="mt-2 mb-7.5 flex items-center gap-1.25 border-t py-1.5 text-xs text-muted-foreground">
        <Avatar size="sm">
          <AvatarFallback className="bg-primary font-mono text-[10px] text-primary-foreground">
            {event.initials}
          </AvatarFallback>
        </Avatar>{' '}
        Organized by {event.host}
      </div>
      <div className="mt-auto flex items-center justify-between gap-1.25 border-t pt-4.25 max-[1150px]:flex-col max-[1150px]:items-start max-[1150px]:gap-3 max-[580px]:flex-row max-[580px]:items-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatars />
          <span>{event.guests}</span>
        </div>
        <Button
          variant={
            event.tone === 'green' ? 'success' : event.tone === 'purple' ? 'violet' : 'default'
          }
          className="relative z-10 h-9.75 px-3.5 text-[13px]"
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
    </Card>
  )
}
