import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Dialog } from 'radix-ui'
import { Check, MapPin, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [emailSent, setEmailSent] = useState(false)
  return (
    <Dialog.Root
      open={modal !== null}
      onOpenChange={(open) => {
        if (!open) {
          setModal(null)
          setEmailSent(false)
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="home-dialog-overlay" />
        <Dialog.Content className="home-dialog">
          <Dialog.Close className="dialog-close" aria-label="Close">
            <X size={20} />
          </Dialog.Close>
          <span className="icon-tile tone-0">
            <Zap />
          </span>
          <Dialog.Title>
            {modal === 'demo'
              ? 'Your guest demo is ready'
              : modal === 'signin'
                ? 'Welcome to EventAI'
                : modal === 'location'
                  ? 'Find your community'
                  : modal}
          </Dialog.Title>
          <Dialog.Description>
            {modal === 'demo'
              ? 'Try a local preview of our frictionless RSVP. No account or credit card needed.'
              : modal === 'signin'
                ? 'Enter your email to preview the sign-in experience.'
                : modal === 'location'
                  ? 'Choose a nearby city to explore this event browsing preview.'
                  : `${modal} information will be available when EventAI launches. This homepage is a preview.`}
          </Dialog.Description>
          {modal === 'demo' && (
            <div className="demo-content">
              <h3>Founders & Builders Mixer #14</h3>
              <Button className="home-button green" onClick={() => rsvp('featured')}>
                {joined.includes('featured') ? (
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
            <form
              className="signin-form"
              onSubmit={(event) => {
                event.preventDefault()
                setEmailSent(true)
              }}
            >
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="you@example.com" required />
              <Button className="home-button" type="submit">
                Continue with email <ArrowRight />
              </Button>
              {emailSent && <p role="status">Thanks! Email sign-in will be available at launch.</p>}
            </form>
          )}
          {modal === 'location' && (
            <div className="city-options">
              {['Miami', 'Miami Beach', 'Fort Lauderdale'].map((location) => (
                <Button
                  key={location}
                  className="home-button soft"
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
