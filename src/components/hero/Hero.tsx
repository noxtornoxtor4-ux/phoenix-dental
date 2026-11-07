import { ArrowRight, Clock, MapPin, MessageCircle, Phone, ScanLine, Wallet } from 'lucide-react'
import { clinic } from '../../config/clinic'
import { useI18n } from '../../i18n/useI18n'

const featureIcons = [ScanLine, Wallet, MessageCircle]

export function Hero() {
  const { t } = useI18n()
  const { open, close } = clinic.hours

  return (
    <section
      id="top"
      className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pt-16 md:pb-24"
    >
      <div className="animate-rise">
        <h1 className="font-display text-[2rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.6rem]">
          {t.hero.titleStart}{' '}
          <span className="bg-linear-to-r from-accent to-accent-300 bg-clip-text text-transparent">
            {t.hero.titleAccent}
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-pretty text-muted sm:text-lg">{t.hero.subtitle}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#booking"
            className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 font-bold text-white shadow-glow transition hover:bg-accent-600 active:scale-[0.98]"
          >
            {t.hero.book}
            <ArrowRight className="size-5" />
          </a>
          <a
            href={clinic.phoneHref}
            className="glass flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold transition hover:bg-field active:scale-[0.98]"
          >
            <Phone className="size-5 text-accent" />
            {clinic.phoneDisplay}
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2">
          {t.hero.features.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <li
                key={feature}
                className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-muted"
              >
                <Icon className="size-3.5 text-accent" />
                {feature}
              </li>
            )
          })}
        </ul>
      </div>

      <aside className="glass animate-rise rounded-[2rem] p-6 [animation-delay:120ms] sm:p-8">
        <p className="font-display text-xs font-bold tracking-[0.3em] text-accent uppercase">The Phoenix Dental Studio</p>
        <p className="mt-2 font-display text-2xl font-bold">{t.location.title}</p>

        <ul className="mt-6 space-y-4 text-sm">
          <li className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
            <span>{t.location.address}</span>
          </li>
          <li className="flex gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-accent" />
            <span>
              {open}–{close}
              <span className="block text-muted">{t.location.hoursTitle}</span>
            </span>
          </li>
          <li className="flex gap-3">
            <ScanLine className="mt-0.5 size-5 shrink-0 text-accent" />
            <span>{t.location.xray}</span>
          </li>
        </ul>

      </aside>
    </section>
  )
}
