import { Card } from '@/components/ui/card'
export function StatsSection() {
  return (
    <section className="bg-muted py-6.5 max-[580px]:py-5.5" aria-label="EventAI in numbers">
      <div className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5 grid grid-cols-3 gap-6.5 max-[850px]:gap-3.75 max-[580px]:grid-cols-1 max-[580px]:gap-3">
        {[
          { image: '/icon1.png', value: '60s', label: 'Draft to Live Launch' },
          { image: '/icon2.png', value: '1-Tap', label: 'RSVP & Frictionless QR Entry' },
          { image: '/icon4.png', value: '98.4%', label: 'Verified Guest Turnout Rate' },
        ].map(({ image, value, label }) => (
          <Card
            className="flex-row items-center gap-4.5 rounded-[15px] px-4.5 py-5 ring-0 shadow-sm [&_strong]:text-[35px] [&_strong]:font-bold [&_strong]:leading-[1.15] [&_p]:mt-1 [&_p]:text-sm max-[850px]:gap-3 max-[850px]:px-3 max-[850px]:py-4.25 max-[850px]:[&_strong]:text-[29px] max-[580px]:gap-5 max-[580px]:px-5"
            key={value}
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground [&_svg]:size-6 [&_img]:size-full [&_img]:object-contain">
              <img src={image} alt="" width={52} height={52} loading="lazy" />
            </span>
            <div>
              <strong>{value}</strong>
              <p>{label}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
