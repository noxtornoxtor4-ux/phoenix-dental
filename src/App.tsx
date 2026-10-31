import { Backdrop } from './components/Backdrop'
import { BookingSection } from './components/booking/BookingSection'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/hero/Hero'
import { InstallGuide } from './components/InstallGuide'
import { LocationSection } from './components/LocationSection'
import { SosDock } from './components/SosDock'

export default function App() {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <Backdrop />

      <Header />
      <main>
        <Hero />
        <BookingSection />
        <LocationSection />
      </main>
      <Footer />

      <SosDock />
      <InstallGuide />
    </div>
  )
}
