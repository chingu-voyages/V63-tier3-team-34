import { AudioLines, Brain, Sunrise } from 'lucide-react'

export const heroContent = {
  rating: {
    score: '4.9/5',
    description: 'from 2,500+ modern organizers',
  },
  description:
    'Create stunning events, pack the room, and get automated AI recaps in seconds. Frictionless web RSVP with no app download required for your guests.',
  socialProof: {
    names: ['AK', 'MR', 'SO', '+2.4k'],
    description: 'checked in this week across SF, NYC, and London',
  },
}

export const events = [
  {
    id: 'ai',
    category: 'AI & TECH',
    status: 'Going fast (94/120)',
    title: 'Miami AI Founders & Web3 Demo Night',
    date: 'Thu, Oct 24 • 7:00 PM EDT',
    venue: 'Wynwood Arts District',
    host: 'Miami Tech Collective',
    initials: 'MT',
    guests: '+58 friends going',
    icon: Brain,
    tone: 'indigo',
  },
  {
    id: 'music',
    category: 'MUSIC & ROOFTOP',
    status: 'Limited Spots',
    title: 'Sunset Rooftop Afro-House & Electronic Live',
    date: 'Fri, Oct 25 • 6:30 PM EDT',
    venue: 'South Beach Oasis Rooftop',
    host: 'Pulse Miami',
    initials: 'PM',
    guests: '+92 going',
    icon: AudioLines,
    tone: 'green',
  },
  {
    id: 'social',
    category: 'FOUNDERS & SOCIAL',
    status: 'Free with RSVP',
    title: 'Biscayne Bay Sunset Mixer & Founders Social',
    date: 'Sat, Oct 26 • 7:30 PM EDT',
    venue: 'Brickell Waterfront',
    host: 'Miami Venture Club',
    initials: 'MV',
    guests: '+142 going',
    icon: Sunrise,
    tone: 'purple',
  },
]

export type Event = (typeof events)[number]

export const featuredEvent: Event & {
  goingCount: number
  city: string
  displayId: string
  image: string
  imageAlt: string
} = {
  image: '/event_pic.avif',
  imageAlt: 'Founders and builders mixer event',
  goingCount: 142,
  city: 'NYC',
  displayId: '#MIX-14',
  id: 'featured',
  category: 'FOUNDERS & SOCIAL',
  status: 'Going (142)',
  title: 'Founders & Builders Mixer #14',
  date: 'Tomorrow, 7:00 PM – 10:30 PM EST',
  venue: 'SoHo Arts Rooftop • 458 Broome St',
  host: 'TechVentures NYC',
  initials: 'TV',
  guests: '+139 more',
  icon: Sunrise,
  tone: 'green',
}
