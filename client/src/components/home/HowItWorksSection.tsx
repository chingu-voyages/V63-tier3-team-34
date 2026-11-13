import { Sparkles, SquarePen, UserRoundCheck } from 'lucide-react'
import { Dispatch } from './Dispatch'

const steps = [
  {
    title: 'Create in 60s',
    description:
      'AI drafts your page, invite copy & schedule instantly from a single sentence prompt. No graphic design skills or coding needed.',
    icon: SquarePen,
  },
  {
    title: '1-Tap RSVP & Check-in',
    description:
      'Seamless web link with frictionless 1-tap confirmation. Guests get instant calendar invites and an ultra-fast QR entry pass at the door.',
    icon: UserRoundCheck,
  },
  {
    title: 'Smart Recaps & Insights',
    description:
      'Automated attendee insights, aggregate photos, attribution metrics, and immediate momentum generated for your next community gathering.',
    icon: Sparkles,
  },
]
export function HowItWorksSection() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-shell">
        <div className="center-heading">
          <span className="eyebrow">3 SIMPLE STEPS</span>
          <h2>How it works</h2>
          <p>
            From an idea in your head to a packed room with automated post-event
            <br /> memory recaps.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <article className="step-card" key={title}>
              <div className="step-top">
                <span>0{index + 1}</span>
                <span className={`icon-tile tone-${(index + 1) % 3}`}>
                  <Icon />
                </span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <Dispatch />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
