import { AudioLines, Brain, Sunrise } from 'lucide-react'

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

export const featuredEvent: Event = {
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
