import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react'
import { clinic } from '../config/clinic'
import { useI18n } from '../i18n/useI18n'
import { openingSchedule } from '../lib/schedule'
import { SectionHeading } from './ui/SectionHeading'

export function LocationSection() {
  const { t } = useI18n()
  const schedule = openingSchedule({ weekdaysShort: t.weekdaysShort, dayOff: t.location.dayOff })

  return (
    <section id="location" className="mx-auto max-w-3xl px-4 pt-4 pb-14 md:pt-6 md:pb-20">
      <SectionHeading title={t.location.title} />

      <div className="glass mt-8 rounded-[2rem] p-5 sm:p-8">
        <ul className="space-y-4">
          <li className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
              <MapPin className="size-5" />
            </span>
            <span className="min-w-0 self-center font-semibold">{t.location.address}</span>
          </li>

          <li className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
              <Clock className="size-5" />
            </span>
            <span className="min-w-0 self-center">
              {schedule.map(({ days, hours, closed }) => (
                <span key={days} className={`block ${closed ? 'text-sm text-muted' : 'font-semibold'}`}>
                  {days}: {hours}
                </span>
              ))}
            </span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="#booking"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-4 font-bold text-white shadow-glow transition hover:bg-accent-600 active:scale-[0.98]"
          >
            {t.hero.book}
            <ArrowRight className="size-5" />
          </a>
          <a
            href={clinic.phoneHref}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-card px-5 py-4 font-semibold transition hover:bg-field active:scale-[0.98]"
          >
            <Phone className="size-5 text-accent" />
            {t.location.call}
          </a>
        </div>
      </div>
    </section>
  )
}
