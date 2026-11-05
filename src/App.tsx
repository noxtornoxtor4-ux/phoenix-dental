import { Backdrop } from './components/Backdrop'
import { BookingPage } from './components/BookingPage'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/hero/Hero'
import { InstallGuide } from './components/InstallGuide'
import { LocationSection } from './components/LocationSection'
import { useRoute } from './lib/route'

export default function App() {
  const route = useRoute()

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <Backdrop />

      {route === 'booking' ? (
        <BookingPage />
      ) : (
        <>
          <Header />
          <main>
            <Hero />
            <LocationSection />
          </main>
          <Footer />
        </>
      )}

      <InstallGuide />
    </div>
  )
}
