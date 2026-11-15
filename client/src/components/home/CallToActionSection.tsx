import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CallToActionSection({ setModal }: { setModal: (modal: string) => void }) {
  return (
    <section className="py-11 mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5">
      <Card className="flex flex-row items-center gap-11 rounded-[18px] bg-linear-[105deg,#4942d9,#176d64_55%,#7c54d3] p-11 text-white ring-0 shadow-[0_17px_24px_-14px_#27213945] max-[1150px]:gap-6 max-[1150px]:p-8 max-[850px]:flex-col max-[850px]:items-stretch max-[580px]:p-6.75 [&>div:first-child]:flex-1 [&_p]:mt-3 [&_p]:text-[#e3e7fa]">
        <div>
          <Badge variant="secondary" className="mb-3 bg-white/20 text-white">
            <Zap size={16} /> Host Smarter with AI
          </Badge>
          <h2>Ready to host your next standout event?</h2>
          <p>
            Launch your guest sandbox in 30 seconds. Experience AI event creation, 1-tap RSVPs, and
            live check-in workflows firsthand.
          </p>
        </div>
        <div className="flex gap-4.25 max-[1150px]:flex-col max-[850px]:flex-row max-[580px]:flex-col">
          <Button
            variant="outline"
            className="bg-white text-primary"
            onClick={() => setModal('demo')}
          >
            <Sparkles /> Try Guest Demo
          </Button>
          <Button
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/90 hover:text-primary"
            asChild
          >
            <a href="#features">
              Explore Features <ArrowRight />
            </a>
          </Button>
        </div>
      </Card>
    </section>
  )
}
