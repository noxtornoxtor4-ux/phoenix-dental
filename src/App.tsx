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
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 -left-40 size-[36rem] animate-drift rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-48 size-[32rem] animate-drift rounded-full bg-navy-600/40 blur-[120px] [animation-delay:-9s]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

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
