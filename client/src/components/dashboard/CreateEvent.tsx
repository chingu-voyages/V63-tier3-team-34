import React, { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  ImagePlus,
  ChevronDown,
  // ArrowLeft,
  Users,
  Settings,
  X,
  Search,
  UserPlus,
  // Upload,
} from 'lucide-react'

export interface EventData {
  id?: string
  title: string
  description: string
  date: string
  time: string
  location: string
  eventType: string
  image?: string
  coordinates?: {
    lat: number
    lon: number
  }
  invitedGuests?: InvitedGuest[]
}

interface CreateEditEventProps {
  initialEvent?: EventData
  onSave: (event: EventData) => void
  onCancel: () => void
}

interface CitySuggestion {
  name?: string
  street?: string
  housenumber?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  formatted: string
  lat: number
  lon: number
  result_type?: string
}

interface GeoapifyResponse {
  results: CitySuggestion[]
}

export interface InvitedGuest {
  id: number
  firstName: string
  lastName: string
  email: string
}

type Tab = 'details' | 'guests' | 'settings'

const defaultEvent: EventData = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  eventType: 'Team Building',
  image: '',
}

export default function CreateEvent({ initialEvent, onSave, onCancel }: CreateEditEventProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [event, setEvent] = useState<EventData>(initialEvent || defaultEvent)
  const [imagePreview, setImagePreview] = useState(initialEvent?.image || '')
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [locationSelected, setLocationSelected] = useState(Boolean(initialEvent?.location))
  const [locationError, setLocationError] = useState('')
  const [invitedGuests, setInvitedGuests] = useState<InvitedGuest[]>(
    initialEvent?.invitedGuests ?? [],
  )
  const [guestSearch, setGuestSearch] = useState('')
  const [invitedSearch, setInvitedSearch] = useState('')

  const exampleUsers: InvitedGuest[] = [
    { id: 1, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com' },
    { id: 2, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com' },
    { id: 3, firstName: 'Michael', lastName: 'Brown', email: 'michael.b@example.com' },
    { id: 4, firstName: 'Emily', lastName: 'Davis', email: 'emily.d@example.com' },
    { id: 5, firstName: 'David', lastName: 'Wilson', email: 'david.w@example.com' },
    { id: 6, firstName: 'Jessica', lastName: 'Taylor', email: 'jessica.t@example.com' },
    { id: 7, firstName: 'James', lastName: 'Anderson', email: 'james.a@example.com' },
    { id: 8, firstName: 'Ashley', lastName: 'Thomas', email: 'ashley.t@example.com' },
    { id: 9, firstName: 'Robert', lastName: 'Jackson', email: 'robert.j@example.com' },
    { id: 10, firstName: 'Amanda', lastName: 'White', email: 'amanda.w@example.com' },
    { id: 11, firstName: 'Daniel', lastName: 'Martin', email: 'daniel.m@example.com' },
    { id: 12, firstName: 'Olivia', lastName: 'Harris', email: 'olivia.h@example.com' },
    { id: 13, firstName: 'Christopher', lastName: 'Lee', email: 'chris.lee@example.com' },
    { id: 14, firstName: 'Sophia', lastName: 'Clark', email: 'sophia.c@example.com' },
    { id: 15, firstName: 'Matthew', lastName: 'Lewis', email: 'matthew.l@example.com' },
  ]

  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number
    lon: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formRef = useRef<HTMLFormElement>(null)

  const isEditing = Boolean(initialEvent)

  useEffect(() => {
    const query = event.location.trim()

    // Don't search until the user types at least 3 characters.
    if (query.length < 3 || locationSelected) {
      setCitySuggestions([])
      setIsSearching(false)
      return
    }

    const controller = new AbortController()

    // Debounce requests to avoid calling the API on every keystroke.
    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      setLocationError('')

      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY

        if (!apiKey) {
          throw new Error('Missing Geoapify API key.')
        }

        const params = new URLSearchParams({
          text: query,
          format: 'json',
          limit: '6',
          apiKey,
        })

        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to retrieve city suggestions.')
        }

        const data: GeoapifyResponse = await response.json()

        setCitySuggestions(data.results || [])
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        console.error('Location autocomplete error:', error)
        setCitySuggestions([])
        setLocationError('Unable to load suggestions. Please try again.')
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, 350)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [event.location, locationSelected])

  const updateField = (field: keyof EventData, value: string) => {
    setEvent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.')
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setImagePreview(imageUrl)
    updateField('image', imageUrl)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!event.title.trim()) {
      alert('Please enter an event title.')
      return
    }

    if (!event.date || !event.time) {
      alert('Please select an event date and time.')
      return
    }

    onSave({
      ...event,
      invitedGuests,
      coordinates: selectedCoordinates ?? undefined,
    })
  }

  const tabs = [
    { id: 'details' as Tab, label: 'Event Details', icon: CalendarDays },
    { id: 'guests' as Tab, label: 'Guests & Invitations', icon: Users },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-800'

  // Filter available users by first name, last name, or full name
  const filteredUsers = exampleUsers.filter((user) => {
    const search = guestSearch.toLowerCase().trim()

    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()

    const alreadyInvited = invitedGuests.some((guest) => guest.id === user.id)

    return search.length > 0 && fullName.includes(search) && !alreadyInvited
  })

  // Filter the invited guests list
  const filteredInvitedGuests = invitedGuests.filter((guest) => {
    const search = invitedSearch.toLowerCase().trim()

    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase()

    return fullName.includes(search) || guest.email.toLowerCase().includes(search)
  })

  // Add a guest
  const addGuest = (user: InvitedGuest) => {
    setInvitedGuests((prev) => {
      if (prev.some((guest) => guest.id === user.id)) {
        return prev
      }

      return [...prev, user]
    })

    setGuestSearch('')
  }

  // Remove a guest
  const removeGuest = (guestId: number) => {
    setInvitedGuests((prev) => prev.filter((guest) => guest.id !== guestId))
  }

  return (
    <div className="w-full  flex items-center justify-center">
      <div className="w-[680px] h-[720px] rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <CalendarDays size={22} />
            </div>

            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {isEditing ? 'Edit Event' : 'Create Event'}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-7 border-b border-slate-100 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 py-4 text-xs font-semibold transition ${
                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-indigo-600" />
              )}
            </button>
          ))}
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          {/* Event Details */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-[1fr_180px]">
              <div className="space-y-4">
                {/* Event Title */}
                <div>
                  <label className={labelClass}>
                    Event Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Enter event title"
                    value={event.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>

                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Tell guests about your event..."
                    value={event.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    {event.description.length}/500
                  </p>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      Date <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="date"
                        required
                        value={event.date}
                        onChange={(e) => updateField('date', e.target.value)}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Time <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Clock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="time"
                        required
                        value={event.time}
                        onChange={(e) => updateField('time', e.target.value)}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                </div>

                {/* Location Autocomplete */}
                <div>
                  <label className={labelClass}>Event Location</label>

                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3.5 z-10 text-slate-500" />

                    <input
                      type="text"
                      required
                      placeholder="Search for a city worldwide..."
                      value={event.location}
                      autoComplete="off"
                      onChange={(e) => {
                        updateField('location', e.target.value)
                        setLocationSelected(false)
                        setLocationError('')
                      }}
                      onFocus={() => {
                        if (event.location.trim().length >= 3) {
                          setLocationSelected(false)
                        }
                      }}
                      className={`${inputClass} pl-9`}
                    />

                    {/* Loading Indicator */}
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                      </div>
                    )}

                    {/* City Suggestions */}
                    {citySuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        {citySuggestions.map((city, index) => (
                          <button
                            key={`${city.lat}-${city.lon}-${index}`}
                            type="button"
                            onClick={() => {
                              updateField('location', city.formatted)
                              setSelectedCoordinates({
                                lat: city.lat,
                                lon: city.lon,
                              })
                              setLocationSelected(true)
                              setCitySuggestions([])
                            }}
                            className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-indigo-50"
                          >
                            <MapPin size={17} className="mt-1 shrink-0 text-indigo-500" />

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {city.formatted}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {[city.state, city.country].filter(Boolean).join(', ')}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search Status */}
                  {isSearching && (
                    <p className="mt-2 text-xs text-slate-400">Searching worldwide...</p>
                  )}

                  {locationError && <p className="mt-2 text-xs text-red-500">{locationError}</p>}

                  {!isSearching &&
                    !locationError &&
                    event.location.trim().length >= 3 &&
                    !locationSelected &&
                    citySuggestions.length === 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        No matching cities found. You can still enter a location manually.
                      </p>
                    )}

                  <p className="mt-2 text-[10px] text-slate-400">
                    Start typing to find cities anywhere in the world.
                  </p>
                </div>

                {/* Event Type */}
                <div>
                  <label className={labelClass}>Event Type</label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-purple-400" />

                    <select
                      value={event.eventType}
                      onChange={(e) => updateField('eventType', e.target.value)}
                      className={`${inputClass} appearance-none pl-9 pr-9`}
                    >
                      <option>Team Building</option>
                      <option>Social</option>
                      <option>Conference</option>
                      <option>Workshop</option>
                      <option>Networking</option>
                      <option>Product Launch</option>
                      <option>Other</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex min-h-[190px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/70 transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="h-full min-h-[190px] w-full object-cover"
                    />
                  ) : (
                    <>
                      <ImagePlus
                        size={34}
                        strokeWidth={1.5}
                        className="mb-3 text-indigo-500 transition group-hover:scale-110"
                      />

                      <span className="text-xs font-semibold text-slate-700">
                        Upload an event image
                      </span>

                      <span className="mt-1 text-[10px] text-slate-400">JPG, PNG up to 5MB</span>
                    </>
                  )}
                </button>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('')
                      updateField('image', '')
                    }}
                    className="mt-2 flex items-center justify-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <X size={13} />
                    Remove image
                  </button>
                )}

                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Add an image to make your event stand out.
                </p>
              </div>
            </div>
          )}

          {/* Guests Tab */}
          {activeTab === 'guests' && (
            <div className="min-h-[522px] max-h-[522px] space-y-5 p-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Guests & Invitations</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Search for users and manage your event invitations.
                </p>
              </div>

              {/* Guest Selection */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Find Guests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Find Guests</label>
                    <span className="text-xs text-slate-400">
                      {exampleUsers.length - invitedGuests.length} available
                    </span>
                  </div>

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      placeholder="Search first or last name..."
                      className={`${inputClass} pl-9`}
                    />

                    {/* Matching Users Dropdown */}
                    {guestSearch.trim().length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => addGuest(user)}
                              className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-3 text-left transition last:border-0 hover:bg-indigo-50"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">{user.email}</p>
                              </div>

                              <UserPlus size={17} className="shrink-0 text-indigo-500" />
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-4 text-center text-xs text-slate-400">
                            No matching users found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Select a user from the search results to invite them.
                  </p>
                </div>

                {/* Invited Guests */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Invited Guests</label>

                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                      {invitedGuests.length} invited
                    </span>
                  </div>

                  {/* Search Existing Invitations */}
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={invitedSearch}
                      onChange={(e) => setInvitedSearch(e.target.value)}
                      placeholder="Search invited guests..."
                      className={`${inputClass} pl-9`}
                    />
                  </div>

                  {/* Invited Guest List */}
                  <div
                    className={`rounded-xl border border-slate-200 bg-slate-50 p-2 ${
                      invitedGuests.length > 3 ? 'max-h-64 overflow-y-auto' : ''
                    }`}
                  >
                    {filteredInvitedGuests.length > 0 ? (
                      <div className="space-y-1">
                        {filteredInvitedGuests.map((guest) => (
                          <div
                            key={guest.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 shadow-sm"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-800">
                                {guest.firstName} {guest.lastName}
                              </p>

                              <p className="truncate text-[10px] text-slate-400">{guest.email}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeGuest(guest.id)}
                              aria-label={`Remove ${guest.firstName} ${guest.lastName}`}
                              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-24 items-center justify-center px-3 text-center">
                        <p className="text-xs text-slate-400">
                          {invitedGuests.length === 0
                            ? 'No guests invited yet.'
                            : 'No invited guests match your search.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Guest Capacity and Admission Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Maximum Guest Capacity</label>

                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Admission Price</label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0 for free events"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="h-[522px] space-y-5 p-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Event Settings</h3>
                <p className="mt-1 text-xs text-slate-500">Configure your event preferences.</p>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Public Event</p>
                  <p className="text-xs text-slate-500">Allow anyone to discover this event.</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Guest Registration</p>
                  <p className="text-xs text-slate-500">Allow guests to RSVP.</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-indigo-600" />
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <div className="flex gap-2">
              {activeTab !== 'details' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'settings' ? 'guests' : 'details')}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Previous
                </button>
              )}

              {activeTab !== 'settings' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()

                    if (activeTab === 'details' || activeTab === 'guests') {
                      const isValid = formRef.current?.reportValidity()

                      if (!isValid) return
                    }

                    setActiveTab(activeTab === 'details' ? 'guests' : 'settings')
                  }}
                  className="rounded-lg bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-7 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  {isEditing ? 'Save Changes' : 'Save Event'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
