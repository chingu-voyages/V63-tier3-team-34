import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { EventGrid, type EventGridProps } from '@/components/events/EventGrid'

export function EventsPage({
  setModal,
  ...props
}: EventGridProps & { setModal: (modal: string) => void }) {
  return (
    <section className="event-page section-shell">
      <Link className="text-link" to="/">
        <ArrowLeft size={18} /> Back to home
      </Link>
      <div className="section-heading">
        <div>
          <span className="eyebrow">FIND YOUR NEXT GREAT CONNECTION</span>
          <h1>All events in {props.city}</h1>
          <p>Discover gatherings, meet your community, and RSVP in one tap.</p>
        </div>
        <button className="location-chip" onClick={() => setModal('location')}>
          <MapPin size={16} /> {props.city}, FL <span>Change</span>
        </button>
      </div>
      <EventGrid {...props} />
    </section>
  )
}
