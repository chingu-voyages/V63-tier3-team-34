import { ArrowRight } from 'lucide-react'
import { Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CallToActionSection({ setModal }: { setModal: (modal: string) => void }) {
  return (
    <section className="cta-section section-shell">
      <div className="cta">
        <div>
          <span className="cta-badge">
            <Zap size={16} /> Host Smarter with AI
          </span>
          <h2>Ready to host your next standout event?</h2>
          <p>
            Launch your guest sandbox in 30 seconds. Experience AI event creation, 1-tap RSVPs, and
            live check-in workflows firsthand.
          </p>
        </div>
        <div className="cta-actions">
          <Button className="home-button light" onClick={() => setModal('demo')}>
            <Sparkles /> Try Guest Demo
          </Button>
          <Button className="home-button translucent" asChild>
            <a href="#features">
              Explore Features <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
