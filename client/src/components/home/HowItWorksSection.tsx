import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
    <section className="border-t bg-[#fbf9ff] py-11 max-[580px]:py-9" id="how-it-works">
      <div className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5">
        <div className="mb-8 text-center [&_p]:mt-3 [&_p]:text-lg [&_p]:leading-relaxed">
          <Badge variant="secondary" className="mb-3">
            3 SIMPLE STEPS
          </Badge>
          <h2>How it works</h2>
          <p>
            From an idea in your head to a packed room with automated post-event
            <br /> memory recaps.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 max-[1150px]:gap-5 max-[850px]:grid-cols-1">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <Card
              role="article"
              className="gap-3 rounded-[14px] p-6.5 shadow-sm ring-0"
              key={title}
            >
              <div className="flex items-center justify-between [&>span:first-child]:text-4xl [&>span:first-child]:font-bold [&>span:first-child]:text-[#a8c7ba]">
                <span>0{index + 1}</span>
                <span
                  className={
                    index === 0
                      ? 'inline-flex size-10.75 items-center justify-center rounded-lg bg-[#66f5bd] text-[#008363]'
                      : index === 1
                        ? 'inline-flex size-10.75 items-center justify-center rounded-lg bg-[#eaddff] text-[#793ce0]'
                        : 'inline-flex size-10.75 items-center justify-center rounded-lg bg-[#e2dfff] text-[#5145ea]'
                  }
                >
                  <Icon />
                </span>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <Dispatch />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
