import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  LayoutDashboard,
  Calendar,
  ChartNoAxesCombined,
  CircleDollarSign,
  Plus,
  Settings,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  ArrowRight,
  Search,
  Menu,
  X,
} from 'lucide-react'
import StatCard from './StatCard'
import EventCard from './EventCard'
import { exampleEvents } from './exampleEvents'
import CreateEvent from './CreateEvent'
import type { EventData } from './CreateEvent'

type EventFilter = 'All' | 'Upcoming' | 'Ongoing' | 'Past'

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

export default function EventsDashboard() {
  const [events] = useState<Event[]>(exampleEvents)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState({ firstName: 'First', lastName: 'Last', role: 'Guest' })
  const [statusFilter, setStatusFilter] = useState<EventFilter>('All')
  const [selection, setSelection] = useState('Dashboard')
  const [currentPage, setCurrentPage] = useState(1)

  const EVENTS_PER_PAGE = 12

  const handleSave = (event: EventData) => {
    console.log('Event saved:', event)

    // Later, connect this to your backend/API.
  }

  const handleCancel = () => {
    console.log('Event creation cancelled')
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'All' || event.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [events, search, statusFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)

  // Get events for current page
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE

  const currentEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE)

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  const upcomingCount = events.filter((event) => event.status === 'Upcoming').length

  const ongoingCount = events.filter((event) => event.status === 'Ongoing').length

  const pastCount = events.filter((event) => event.status === 'Past').length

  return (
    <div className="flex min-h-screen bg-[#f5f6ff] text-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-indigo-100 bg-white px-4 py-6 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-indigo-700" />
            <span className="text-lg font-extrabold tracking-tight">EventPlanner</span>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'Dashboard'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('Dashboard')
            }}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </div>

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'My Events'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('My Events')
            }}
          >
            <Calendar size={19} />
            My Events
          </div>

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'Create Event'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('Create Event')
            }}
          >
            <Plus size={19} />
            Create Event
          </div>

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'Analytics'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('Analytics')
            }}
          >
            <ChartNoAxesCombined size={19} />
            Analytics
          </div>

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'Financial'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('Financial')
            }}
          >
            <CircleDollarSign size={19} />
            Financial
          </div>

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'Groups'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('Groups')
            }}
          >
            <Users size={19} />
            Groups
          </div>

          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:cursor-pointer ${
              selection === 'Settings'
                ? 'bg-indigo-100 font-semibold text-indigo-700'
                : 'font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700'
            }`}
            onClick={() => {
              setSelection('Settings')
            }}
          >
            <Settings size={19} />
            Settings
          </div>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 border-t border-indigo-100 pt-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
            {user.firstName.slice(0, 1)}
            {user.lastName.slice(0, 1)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.firstName + ' ' + user.lastName}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>

          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header / Hero banner */}
        <section className="relative mb-6 flex min-h-48 flex-col justify-center overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-indigo-950/60 to-transparent" />

          <div className="relative z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-4 rounded-lg bg-white/20 p-2 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Events Dashboard</h1>

            <p className="mt-2 text-sm text-indigo-100 sm:text-base">
              Manage your events and stay organized
            </p>
          </div>

          {/* {selection !== 'Create Event' ? (
            <div
              className="relative z-10 mt-6 inline-flex items-center justify-center gap-2 self-start rounded-lg bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 sm:mt-0"
              onClick={() => {
                setSelection('Create Event')
              }}
            >
              <Plus size={18} />
              Create Event
            </div>
          ) : null} */}
        </section>

        {selection === 'Dashboard' ? (
          <div>
            {/* Statistics */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Events"
                value={events.length}
                icon={<CalendarDays size={23} />}
                color="bg-purple-100"
                iconColor="text-purple-700"
                onClick={() => {
                  setStatusFilter('All')
                  setCurrentPage(1)
                }}
                isActive={statusFilter === 'All'}
              />

              <StatCard
                title="Upcoming"
                value={upcomingCount}
                icon={<CheckCircle2 size={23} />}
                color="bg-green-100"
                iconColor="text-green-600"
                onClick={() => {
                  setStatusFilter('Upcoming')
                  setCurrentPage(1)
                }}
                isActive={statusFilter === 'Upcoming'}
              />

              <StatCard
                title="Ongoing"
                value={ongoingCount}
                icon={<PlayCircle size={23} />}
                color="bg-blue-100"
                iconColor="text-blue-600"
                onClick={() => {
                  setStatusFilter('Ongoing')
                  setCurrentPage(1)
                }}
                isActive={statusFilter === 'Ongoing'}
              />

              <StatCard
                title="Completed"
                value={pastCount}
                icon={<CheckCircle2 size={23} />}
                color="bg-slate-200"
                iconColor="text-slate-600"
                onClick={() => {
                  setStatusFilter('Past')
                  setCurrentPage(1)
                }}
                isActive={statusFilter === 'Past'}
              />
            </section>

            {/* Upcoming events heading */}
            <section>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">
                    {statusFilter === 'All'
                      ? 'All Events'
                      : statusFilter === 'Past'
                        ? 'Completed Events'
                        : `${statusFilter} Events`}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Keep track of what's happening next.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="w-[300px] flex items-center gap-2 rounded-lg border border-indigo-100 bg-white px-3 py-2 shadow-sm">
                    <Search size={16} className="text-slate-400" />

                    <input
                      type="text"
                      placeholder="Search events..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-36"
                    />
                  </div>
                </div>
              </div>

              {/* Event cards */}
              {currentEvents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {currentEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-8 flex flex-col items-center gap-4 border-t border-indigo-100 pt-6">
                    {/* Results information */}
                    <p className="text-sm text-slate-500">
                      Showing{' '}
                      <span className="font-semibold text-slate-800">
                        {startIndex + 1}-
                        {Math.min(startIndex + EVENTS_PER_PAGE, filteredEvents.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-slate-800">{filteredEvents.length}</span>{' '}
                      events
                    </p>

                    {/* Centered pagination buttons */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2">
                        {/* Previous */}
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="rounded-lg border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'border border-indigo-100 bg-white text-slate-600 hover:bg-indigo-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        {/* Next */}
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="rounded-lg border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-indigo-200 bg-white p-10 text-center">
                  <CalendarDays size={36} className="mx-auto mb-3 text-slate-300" />

                  <h3 className="font-semibold text-slate-700">No events found</h3>

                  <p className="mt-1 text-sm text-slate-500">Try another search term.</p>
                </div>
              )}
            </section>
          </div>
        ) : null}
        {selection === 'Create Event' ? (
          <CreateEvent onSave={handleSave} onCancel={handleCancel} />
        ) : null}
      </main>
    </div>
  )
}
