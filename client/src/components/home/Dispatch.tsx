import { Zap } from 'lucide-react'

export function Dispatch() {
  return (
    <div className="dispatch">
      <span className="dispatch-icon">
        <Zap size={18} />
      </span>
      <div>
        <div className="dispatch-heading">
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
