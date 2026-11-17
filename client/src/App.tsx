import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailsPage } from '@/pages/EventDetailsPage'
import { Header } from '@/components/home/Header'
import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { EventsSection } from '@/components/home/EventsSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { CallToActionSection } from '@/components/home/CallToActionSection'
import { Footer } from '@/components/home/Footer'
import { HomeDialog } from '@/components/home/HomeDialog'
import EventDashboard from '@/components/dashboard/EventDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/eventdashboard" element={<EventDashboard />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  )
}

function AppContent() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView?.()
    else window.scrollTo?.(0, 0)
  }, [pathname, hash])
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [city, setCity] = useState('Miami')
  const [joined, setJoined] = useState<string[]>([])
  const rsvp = (id: string) =>
    setJoined((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  return (
    <div
      className="min-h-screen bg-background text-foreground [&_h1]:font-bold [&_h1]:tracking-tight text-[15px] leading-[1.55] [&_h2]:text-[clamp(26px,2.3vw,36px)] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:tracking-[-0.9px] [&_h3]:text-[25px] [&_h3]:font-bold [&_h3]:leading-[1.3] [&_h3]:tracking-[-0.5px] [&_p]:text-muted-foreground"
      id="top"
    >
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} setModal={setModal} />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection joined={joined} rsvp={rsvp} setModal={setModal} />
                <StatsSection />
                <EventsSection city={city} joined={joined} rsvp={rsvp} setModal={setModal} />
                <HowItWorksSection />
                <FeaturesSection />
                <CallToActionSection setModal={setModal} />
              </>
            }
          />
          <Route
            path="/events"
            element={<EventsPage city={city} joined={joined} rsvp={rsvp} setModal={setModal} />}
          />
          <Route
            path="/events/:eventId"
            element={<EventDetailsPage city={city} joined={joined} rsvp={rsvp} />}
          />
          <Route
            path="*"
            element={
              <section className="mx-auto w-full max-w-7xl px-7 max-[850px]:px-5.5 min-h-[65vh] pt-10 pb-16">
                <h1 className="mt-3 mb-5 text-3xl leading-tight sm:text-5xl">Page not found</h1>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4"
                  to="/"
                >
                  Back to home
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <Footer setModal={setModal} />
      <HomeDialog
        modal={modal}
        setModal={setModal}
        city={city}
        setCity={setCity}
        joined={joined}
        rsvp={rsvp}
      />
    </div>
  )
}
export default App
