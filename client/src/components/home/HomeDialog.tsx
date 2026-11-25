import { useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { featuredEvent } from '@/data/events'
import { Check, MapPin, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GitHubIcon } from './GitHubIcon'

export function HomeDialog({
  modal,
  setModal,
  city,
  setCity,
  joined,
  rsvp,
}: {
  modal: string | null
  setModal: (modal: string | null) => void
  city: string
  setCity: (city: string) => void
  joined: string[]
  rsvp: (id: string) => void
}) {
  // Login is a full-page trip to the server and GitHub; returnTo brings the browser back here.
  const { pathname, search, hash } = useLocation()
  const githubLoginUrl = `/api/auth/github?returnTo=${encodeURIComponent(pathname + search + hash)}`
  return (
    <Dialog
      open={modal !== null}
      onOpenChange={(open) => {
        if (!open) setModal(null)
      }}
    >
      <DialogContent className="rounded-[18px] p-7.5 sm:max-w-115">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground [&_svg]:size-6">
          <Zap />
        </span>
        <DialogHeader>
          <DialogTitle>
            {modal === 'demo'
              ? 'Your guest demo is ready'
              : modal === 'signin'
                ? 'Welcome to EventAI'
                : modal === 'location'
                  ? 'Find your community'
                  : modal}
          </DialogTitle>
          <DialogDescription>
            {modal === 'demo'
              ? 'Try a local preview of our frictionless RSVP. No account or credit card needed.'
              : modal === 'signin'
                ? 'Sign in with your GitHub account to create and manage your events.'
                : modal === 'location'
                  ? 'Choose a nearby city to explore this event browsing preview.'
                  : `${modal} information will be available when EventAI launches. This homepage is a preview.`}
          </DialogDescription>
        </DialogHeader>
        {modal === 'demo' && (
          <div className="flex flex-col gap-4 [&_small]:text-muted-foreground">
            <h3>{featuredEvent.title}</h3>
            <Button variant="success" onClick={() => rsvp(featuredEvent.id)}>
              {joined.includes(featuredEvent.id) ? (
                <>
                  <Check /> RSVP confirmed — you’re going!
                </>
              ) : (
                'Try 1-Tap RSVP'
              )}
            </Button>
            <small>This is a demo RSVP. No real reservation is made.</small>
          </div>
        )}
        {modal === 'signin' && (
          <Button asChild className="bg-[#24292f] text-white hover:bg-[#32383f] hover:text-white">
            <a href={githubLoginUrl}>
              <GitHubIcon className="size-5" />
              Continue with GitHub
            </a>
          </Button>
        )}
        {modal === 'location' && (
          <div className="flex flex-col gap-3">
            {['Miami', 'Miami Beach', 'Fort Lauderdale'].map((location) => (
              <Button
                variant="secondary"
                key={location}

                onClick={() => {
                  setCity(location)
                  setModal(null)
                }}
              >
                <MapPin /> {location} {city === location && <Check />}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
