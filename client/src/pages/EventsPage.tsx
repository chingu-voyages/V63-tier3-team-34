import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventGrid, type EventGridProps } from '@/components/events/EventGrid'

export function EventsPage({
  setModal,
  ...props
}: EventGridProps & { setModal: (modal: string) => void }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5 min-h-[65vh] pt-10 pb-16">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4 mb-8"
        to="/"
      >
        <ArrowLeft size={18} /> Back to home
      </Link>
      <div className="mt-2 mb-7.25 flex items-end justify-between gap-7 max-[580px]:flex-col max-[580px]:items-start max-[580px]:gap-3">
        <div>
          <Badge variant="secondary" className="mb-3">
            FIND YOUR NEXT GREAT CONNECTION
          </Badge>
          <h1 className="mt-3 mb-5 text-3xl leading-tight sm:text-5xl">
            All events in {props.city}
          </h1>
          <p>Discover gatherings, meet your community, and RSVP in one tap.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-auto rounded-full px-4 py-2 text-xs [&_span]:underline [&_span]:decoration-dotted font-normal"
          onClick={() => setModal('location')}
        >
          <MapPin size={16} /> {props.city}, FL <span>Change</span>
        </Button>
      </div>
      <EventGrid {...props} />
    </section>
  )
}
