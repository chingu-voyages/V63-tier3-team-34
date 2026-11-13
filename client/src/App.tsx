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
import './home.css'
import './events.css'

function App() {
  return (
    <BrowserRouter>
      <AppContent />
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
    <div className="home-page" id="top">
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
              <section className="event-page section-shell">
                <h1>Page not found</h1>
                <Link className="text-link" to="/">
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
