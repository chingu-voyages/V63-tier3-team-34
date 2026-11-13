import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventGrid, type EventGridProps } from '@/components/events/EventGrid'

export function EventsSection({
  setModal,
  ...props
}: EventGridProps & { setModal: (modal: string) => void }) {
  return (
    <section className="events-section section-shell" id="events">
      <button className="location-chip" onClick={() => setModal('location')}>
        <MapPin size={16} /> {props.city}, FL (Demo location) <span>Change</span>
      </button>
      <div className="section-heading">
        <h2>Browsing events in your current location</h2>
        <Link className="text-link" to="/events">
          View all events <ArrowRight />
        </Link>
      </div>
      <EventGrid {...props} limit={3} />
      <div className="view-all">
        <Button className="home-button soft" asChild>
          <Link to="/events">
            View all events in {props.city} <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}
