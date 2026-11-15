import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dispatch } from './Dispatch'

export function FeaturesSection() {
  return (
    <section className="bg-muted py-11 max-[580px]:py-9" id="features">
      <div className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5">
        <div className="mt-2 mb-7.25 flex items-end justify-between gap-7 max-[580px]:flex-col max-[580px]:items-start max-[580px]:gap-3 [&>div]:flex-1 [&>p]:max-w-md">
          <div>
            <Badge variant="secondary" className="mb-3 bg-[#b2f5df] text-[#008265]">
              MODERN HOST SUPERPOWERS
            </Badge>
            <h2>Built for modern community builders</h2>
          </div>
          <p>
            Everything you love about intimate social gatherings, backed by frictionless
            enterprise-grade infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 max-[1150px]:gap-5 max-[580px]:grid-cols-1">
          <Card
            role="article"
            className="gap-4 rounded-[15px] p-6.5 shadow-sm ring-0 [&>p]:leading-relaxed"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground [&_svg]:size-6 [&_img]:size-full [&_img]:object-contain">
              <img src="/icon3.png" alt="" width={52} height={52} loading="lazy" />
            </span>
            <h3>Automated Guest Comms</h3>
            <p>
              Send personalized SMS and email updates with doors opening, parking codes, or surprise
              speaker announcements without unmanageable chaotic group chats.
            </p>
            <Dispatch />
            <div className="ml-auto max-w-[80%] rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
              Just walked in, looks insane! 🔥
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <Badge variant="secondary">99.2% Deliverability</Badge>
              <Badge variant="secondary">Zero Spam Filter</Badge>
            </div>
          </Card>
          <Card
            role="article"
            className="gap-4 rounded-[15px] p-6.5 shadow-sm ring-0 [&>p]:leading-relaxed"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground [&_svg]:size-6 [&_img]:size-full [&_img]:object-contain">
              <img src="/icon2.png" alt="" width={52} height={52} loading="lazy" />
            </span>
            <h3>Effortless Check-in Telemetry</h3>
            <p>
              Scan tickets in sub-second bursts at the entrance. Track live capacity, ingress pace,
              and VIP guest arrivals in real time from any smartphone.
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4 [&>div]:flex [&>div]:flex-wrap [&>div]:justify-between [&>div]:gap-2 [&>div]:text-xs">
              <div>
                <strong>Live Door Ingress Rate</strong>
                <span>4.2 scans / min</span>
              </div>
              <img
                className="mt-3 block h-auto w-full rounded-lg"
                src="/chart.png"
                alt="Door entry rate rises through the evening, peaks around 8:15 PM, and eases by 9:00 PM."
                width={640}
                height={360}
                loading="lazy"
              />
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <Badge variant="secondary" className="bg-[#68f5bc] text-[#008363]">
                0.3s Scan Latency
              </Badge>
              <Badge variant="secondary">Offline Capable</Badge>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
