import React, { useRef, useState } from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  ImagePlus,
  ChevronDown,
  ArrowLeft,
  Users,
  Settings,
  X,
  Upload,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface EventData {
  id?: string
  title: string
  description: string
  date: string
  time: string
  location: string
  eventType: string
  image?: string
}

interface CreateEditEventProps {
  initialEvent?: EventData
  onSave: (event: EventData) => void
  onCancel: () => void
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

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = Boolean(initialEvent)

  const navigate = useNavigate()

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

    onSave(event)
  }

  const tabs = [
    { id: 'details' as Tab, label: 'Event Details', icon: CalendarDays },
    { id: 'guests' as Tab, label: 'Guests & Invitations', icon: Users },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

  const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-800'

  return (
    <div className="w-full  flex items-center justify-center">
      <div className="w-[680px] h-[700px] rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
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

        <form onSubmit={handleSubmit}>
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

                {/* Location */}
                <div>
                  <label className={labelClass}>Location</label>

                  <div className="relative">
                    <MapPin
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"
                      placeholder="Enter event location"
                      value={event.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </div>
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
            <div className="h-[498px] space-y-5 p-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Guests & Invitations</h3>
                <p className="mt-1 text-xs text-slate-500">Manage who can attend your event.</p>
              </div>

              <div>
                <label className={labelClass}>Invite Guests</label>
                <textarea
                  rows={4}
                  placeholder="Enter guest email addresses, separated by commas..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Maximum Guest Capacity</label>
                <input type="number" min="1" placeholder="e.g. 50" className={inputClass} />
              </div>

              {/* Admission Price */}
              <div>
                <label className={labelClass}>Admission Price</label>
                <input type="number" min="1" placeholder="e.g. 50" className={inputClass} />
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="h-[498px] space-y-5 p-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Event Settings</h3>
                <p className="mt-1 text-xs text-slate-500">Configure your event preferences.</p>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Public Event</p>
                  <p className="text-xs text-slate-500">Allow anyone to discover this event.</p>
                </div>
                <input type="checkbox" className="h-4 w-4 accent-indigo-600" />
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
                  onClick={() => setActiveTab(activeTab === 'details' ? 'guests' : 'settings')}
                  className="rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
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
