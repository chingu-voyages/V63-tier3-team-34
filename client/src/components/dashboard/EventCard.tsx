import { CalendarDays, MapPin, DollarSign, UserGroup } from 'lucide-react'

type EventStatus = 'Upcoming' | 'Ongoing' | 'Past'

interface Event {
  id: number
  title: string
  admissionPrice: number
  maxGuests: number
  date: string
  time: string
  location: string
  status: EventStatus
  image: string
}

interface EventCardProps {
  event: Event
}

const statusStyles: Record<EventStatus, string> = {
  Upcoming: 'bg-green-100 text-green-700',
  Ongoing: 'bg-blue-100 text-blue-700',
  Past: 'bg-purple-100 text-purple-700',
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-32 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      <div className="p-3">
        <h3 className="truncate font-bold text-slate-900">{event.title}</h3>
        <div className="flex justify-between">
          <div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays size={14} className="shrink-0 text-indigo-600" />
              <span>{event.date}</span>
              <span>•</span>
              <span>{event.time}</span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={14} className="shrink-0 text-indigo-600" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <DollarSign size={14} className="shrink-0 text-indigo-600" />
              {event.admissionPrice === 0 ? (
                <span className="truncate">Admission Price: Free</span>
              ) : (
                <span className="truncate">Admission Price: ${event.admissionPrice}</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <UserGroup size={14} className="shrink-0 text-indigo-600" />
              <span className="truncate">Capacity: {event.maxGuests}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
