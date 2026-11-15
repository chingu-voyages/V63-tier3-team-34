import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventGrid, type EventGridProps } from '@/components/events/EventGrid'

export function EventsSection({
  setModal,
  ...props
}: EventGridProps & { setModal: (modal: string) => void }) {
  return (
    <section className="py-11 mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5" id="events">
      <Button
        type="button"
        variant="outline"
        className="h-auto rounded-full border-[#dcdcf3] bg-secondary px-4.25 py-1 text-[13px] [&_svg]:text-[#5949ed] [&_span]:text-[#5949ed] [&_span]:underline [&_span]:decoration-dotted font-normal"
        onClick={() => setModal('location')}
      >
        <MapPin size={16} /> {props.city}, FL (Demo location) <span>Change</span>
      </Button>
      <div className="mt-2 mb-7.25 flex items-end justify-between gap-7 max-[580px]:flex-col max-[580px]:items-start max-[580px]:gap-3">
        <h2>Browsing events in your current location</h2>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4"
          to="/events"
        >
          View all events <ArrowRight />
        </Link>
      </div>
      <EventGrid {...props} limit={3} />
      <div className="mt-8 flex justify-center">
        <Button variant="secondary" asChild>
          <Link to="/events">
            View all events in {props.city} <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}
