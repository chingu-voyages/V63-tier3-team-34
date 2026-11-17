import { Zap } from 'lucide-react'

export function Dispatch() {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg bg-linear-[100deg,#dcf5f1,#f0edff_65%,#f5f2ff] px-2.25 py-2.75 [&>div]:min-w-0 [&>div]:flex-1 [&_p]:mt-1 [&_p]:text-sm [&_p]:leading-relaxed">
      <span className="rounded-md bg-[#62f4b9] px-1.25 py-2 text-primary-foreground">
        <Zap size={18} />
      </span>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] tracking-wide text-[#009c74] [&_strong]:text-[10px] [&_strong]:tracking-normal [&_strong]:text-[#00856a]">
          <span>AI HYPE DISPATCH</span>
          <strong>Live synced</strong>
        </div>
        <p>
          “8 Series-A founders & 3 angel syndicates confirmed. Fireside breakout opens at 8:15 PM.”
        </p>
      </div>
    </div>
  )
}
