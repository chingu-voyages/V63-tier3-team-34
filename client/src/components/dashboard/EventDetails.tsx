import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import type { EventData } from './CreateEvent'

interface EventDetailsProps {
  event: EventData & {
    status?: string
    maxGuests?: number
    admissionPrice?: number
    attendees?: Attendee[]
  }
  onEdit: () => void
  onBack: () => void
}

export interface Attendee {
  id: number
  firstName: string
  lastName: string
  email: string
  status: 'Accepted' | 'Pending' | 'Declined'
}

// interface Event {
//   id: number
//   title: string
//   admissionPrice: number
//   maxGuests: number
//   date: string
//   time: string
//   location: string
//   status: EventStatus
//   image: string
//   attendees?: Attendee[]
// }

export default function EventDetails({ event, onEdit, onBack }: EventDetailsProps) {
  const statusStyles: Record<string, string> = {
    Upcoming: 'bg-green-100 text-green-700',
    Ongoing: 'bg-blue-100 text-blue-700',
    Past: 'bg-slate-100 text-slate-600',
  }

  const attendees = event.attendees ?? []

  const acceptedCount = attendees.filter((attendee) => attendee.status === 'Accepted').length

  const pendingCount = attendees.filter((attendee) => attendee.status === 'Pending').length

  const declinedCount = attendees.filter((attendee) => attendee.status === 'Declined').length

  //   const formattedDate = event.date
  //     ? new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
  //         weekday: 'long',
  //         month: 'long',
  //         day: 'numeric',
  //         year: 'numeric',
  //       })
  //     : 'Date not specified'

  //   const formattedTime = event.time
  //     ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
  //         hour: 'numeric',
  //         minute: '2-digit',
  //       })
  //     : 'Time not specified'

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to Events
      </button>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
        {/* Event Image */}
        <div className="relative h-64 bg-indigo-50 sm:h-80">
          {event.image ? (
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon size={60} className="text-indigo-300" />
            </div>
          )}

          {event.status && (
            <span
              className={`absolute right-5 top-5 rounded-full px-4 py-2 text-xs font-bold ${
                statusStyles[event.status] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {event.status}
            </span>
          )}
        </div>

        {/* Event Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {event.eventType || 'Event'}
            </span>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {event.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">Event overview and information</p>
          </div>

          <button
            onClick={onEdit}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <Edit size={17} />
            Edit Event
          </button>
        </div>

        {/* Event Information */}
        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8">
          {/* Date */}
          <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <CalendarDays size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">Event Date</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{event.date}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Clock size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">Event Time</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{event.time}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <MapPin size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">Location</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {event.location || 'Location not specified'}
              </p>
            </div>
          </div>

          {/* Event Type */}
          <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <ImageIcon size={22} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400">Event Type</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {event.eventType || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Maximum Guests */}
          {event.maxGuests !== undefined && (
            <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Users size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">Guest Capacity</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{event.maxGuests} Guests</p>
              </div>
            </div>
          )}

          {/* Admission Price */}
          {event.admissionPrice !== undefined && (
            <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <DollarSign size={22} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">Admission Price</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {event.admissionPrice === 0 ? 'Free' : `$${event.admissionPrice}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-slate-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">About This Event</h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {event.description || 'No event description provided.'}
          </p>
        </div>

        {/* Attendees */}
        <div className="border-t border-slate-100 p-6 sm:p-8">
          {/* Section Header */}
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendees</h2>
              <p className="mt-1 text-sm text-slate-500">
                View guests and their invitation responses.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
              <Users size={17} />
              {attendees.length} Total
            </div>
          </div>

          {/* RSVP Summary */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">Accepted</p>
              <p className="mt-1 text-2xl font-bold text-green-800">{acceptedCount}</p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-700">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-800">{pendingCount}</p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">Declined</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{declinedCount}</p>
            </div>
          </div>

          {/* Attendee List */}
          {attendees.length > 0 ? (
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                >
                  {/* Attendee Information */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {attendee.firstName.charAt(0)}
                      {attendee.lastName.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        {attendee.firstName} {attendee.lastName}
                      </p>
                      <p className="truncate text-sm text-slate-500">{attendee.email}</p>
                    </div>
                  </div>

                  {/* RSVP Status */}
                  <div className="shrink-0">
                    {attendee.status === 'Accepted' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Accepted
                      </span>
                    )}

                    {attendee.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        <Clock size={14} />
                        Pending
                      </span>
                    )}

                    {attendee.status === 'Declined' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                        <XCircle size={14} />
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Users size={30} className="mx-auto mb-3 text-slate-400" />
              <p className="font-semibold text-slate-700">No attendees yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Attendees will appear here when guests respond to invitations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
