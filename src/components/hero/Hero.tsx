import { ArrowRight, MessageCircle, ScanLine, Sparkles, Wallet } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'
import { BeforeAfterSlider } from './BeforeAfterSlider'

const featureIcons = [ScanLine, Wallet, MessageCircle]

export function Hero() {
  const { t } = useI18n()

  return (
    <section
      id="top"
      className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-16 md:pb-24"
    >
      <div className="animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          <Sparkles className="size-3.5" />
          {t.hero.badge}
        </span>

        <h1 className="mt-5 font-display text-[2rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.6rem]">
          {t.hero.titleStart}{' '}
          <span className="bg-linear-to-r from-accent to-accent-300 bg-clip-text text-transparent">
            {t.hero.titleAccent}
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-pretty text-white/70 sm:text-lg">{t.hero.subtitle}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#booking"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 font-bold text-navy-900 shadow-glow transition hover:bg-accent-300 active:scale-[0.98]"
          >
            {t.hero.book}
            <ArrowRight className="size-5" />
          </a>
          <a
            href="#booking"
            className="glass flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold transition hover:bg-white/10 active:scale-[0.98]"
          >
            <ScanLine className="size-5 text-accent" />
            {t.hero.pickTooth}
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2">
          {t.hero.features.map((feature, index) => {
            const Icon = featureIcons[index]
            return (
              <li
                key={feature}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75"
              >
                <Icon className="size-3.5 text-accent" />
                {feature}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="animate-rise [animation-delay:120ms]">
        <BeforeAfterSlider />
      </div>
    </section>
  )
}
