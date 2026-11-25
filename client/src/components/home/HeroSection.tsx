import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import {
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  MapPin,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { featuredEvent, heroContent } from '@/data/events'
import { Avatars } from './Avatars'
import { Dispatch } from './Dispatch'

export function HeroSection({
  joined,
  rsvp,
  setModal,
  signedIn,
}: {
  joined: string[]
  rsvp: (id: string) => void
  setModal: (modal: string) => void
  signedIn: boolean
}) {
  return (
    <section className="grid grid-cols-[1.18fr_1fr] items-center gap-22.5 py-11.5 max-[1150px]:gap-8.75 max-[850px]:grid-cols-2 max-[850px]:gap-6.25 max-[580px]:grid-cols-1 max-[580px]:gap-8 max-[580px]:py-9 mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5">
      <div>
        <Badge
          variant="secondary"
          className="h-auto w-fit flex-wrap gap-1 rounded-3xl border-0 bg-linear-[100deg,#ccecf1,#e3e5ff] px-4 py-1 text-[13px] text-[#42516c] [&>span]:font-semibold [&>span]:text-[#e88c00] max-[580px]:px-2.75 max-[580px]:text-[11px]"
        >
          <span>★ {heroContent.rating.score}</span> · {heroContent.rating.description}
        </Badge>
        <h1 className="mt-5 text-[clamp(44px,4.3vw,58px)] leading-[1.04] tracking-[-1.8px]! max-[850px]:text-[43px] max-[580px]:text-[49px]">
          One link.
          <br />
          <span className="bg-linear-[100deg,#4943dc,#006c51_52%,#6932d3] bg-clip-text text-transparent">
            Full event hype.
          </span>
          <br />
          Zero stress.
        </h1>
        <p className="mt-6 text-lg leading-[1.65] max-[850px]:text-base">
          {heroContent.description}
        </p>
        <div className="mt-5.75 flex gap-4 max-[1150px]:gap-2.5 max-[850px]:flex-col max-[580px]:flex-row">
          <Button size="lg" onClick={() => setModal('demo')}>
            <Sparkles /> Try Demo — Guest
          </Button>
          {signedIn ? (
            <Button size="lg" variant="outline" asChild>
              <Link to="/eventdashboard">
                Go to dashboard <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={() => setModal('signin')}>
              Sign In / Register <ArrowRight />
            </Button>
          )}
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs [&_svg]:text-primary [&_i]:size-1 [&_i]:rounded-full [&_i]:bg-border">
          <CircleCheck size={17} /> Takes 30 seconds <i /> No credit card required <i /> Instant
          guest link
        </p>
        <div className="mt-6.5 flex items-center gap-4 text-[13px] text-muted-foreground max-[850px]:flex-col max-[850px]:items-start max-[850px]:gap-2.5 max-[580px]:flex-row max-[580px]:items-center max-[580px]:text-[11px]">
          <Avatars names={heroContent.socialProof.names} />
          <span>{heroContent.socialProof.description}</span>
        </div>
      </div>
      <Card
        role="article"
        className="gap-0 overflow-visible rounded-2xl p-6.5 shadow-[0_19px_25px_-12px_#27213935] ring-0 max-[850px]:p-4.5 max-[580px]:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant="secondary"
            className="h-auto bg-[#c7fbe5] px-2.5 py-1 font-mono text-sm text-[#008466]"
          >
            ● Going ({featuredEvent.goingCount + (joined.includes(featuredEvent.id) ? 1 : 0)})
          </Badge>
          <Badge
            variant="secondary"
            className="h-auto rounded-sm px-2.25 py-0.75 font-mono text-xs text-muted-foreground"
          >
            ID: {featuredEvent.displayId}
          </Badge>
        </div>
        <div className="relative mt-4.5 mb-5 h-48.5 max-[850px]:h-43.75 max-[580px]:h-50 overflow-hidden rounded-lg [&_img]:size-full [&_img]:object-cover after:absolute after:inset-0 after:bg-linear-to-t after:from-black/70 after:to-transparent [&>div]:absolute [&>div]:bottom-4 [&>div]:left-4 [&>div]:z-10 [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:text-sm [&>div]:font-medium [&>div]:text-white">
          <img src={featuredEvent.image} alt={featuredEvent.imageAlt} />
          <div>
            <BadgeCheck size={20} /> Verified Host • {featuredEvent.host}
          </div>
        </div>
        <h2 className="mb-3 text-[26px]! max-[850px]:text-[23px]!">
          <Link to={`/events/${featuredEvent.id}`}>{featuredEvent.title}</Link>
        </h2>
        <p className="mb-1 flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary">
          <CalendarDays /> <strong>{featuredEvent.date}</strong>
        </p>
        <p className="mb-1 flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary">
          <MapPin /> {featuredEvent.venue}, {featuredEvent.city}
        </p>
        <Dispatch />
        <div className="mt-5.5 flex items-center justify-between gap-3 max-[850px]:flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatars names={['JS', 'LC', 'EW']} />
            <span>{featuredEvent.guests}</span>
          </div>
          <Button
            variant="success"
            aria-pressed={joined.includes(featuredEvent.id)}
            onClick={() => rsvp(featuredEvent.id)}
          >
            <UserRoundCheck />
            {joined.includes(featuredEvent.id) ? 'You’re going!' : '1-Tap RSVP'} <ArrowRight />
          </Button>
        </div>
      </Card>
    </section>
  )
}
