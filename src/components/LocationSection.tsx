import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react'
import { clinic } from '../config/clinic'
import { useI18n } from '../i18n/useI18n'
import { SectionHeading } from './ui/SectionHeading'

const allWeekdays = [1, 2, 3, 4, 5, 6, 0]

export function LocationSection() {
  const { t } = useI18n()
  const { weekdays, open, close } = clinic.hours

  // Working days are expected to be a continuous range (e.g. Mon–Sat).
  const workDays = `${t.weekdaysShort[weekdays[0]]}–${t.weekdaysShort[weekdays[weekdays.length - 1]]}`
  const daysOff = allWeekdays.filter((day) => !(weekdays as readonly number[]).includes(day))

  const infoRows = [
    { icon: MapPin, title: t.location.address, text: '' },
    {
      icon: Clock,
      title: `${workDays}: ${open}–${close}`,
      text: daysOff.length > 0 ? `${daysOff.map((day) => t.weekdaysShort[day]).join(', ')}: ${t.location.dayOff}` : '',
    },
  ]

  return (
    <section id="location" className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      <SectionHeading eyebrow={t.location.eyebrow} title={t.location.title} />

      <div className="glass mt-8 rounded-[2rem] p-5 sm:p-8">
        <ul className="space-y-4">
          {infoRows.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 self-center">
                <span className="block font-semibold">{title}</span>
                {text && <span className="block text-sm text-muted">{text}</span>}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-muted uppercase">{t.location.hoursTitle}</p>
        <p className="mt-1 font-display text-2xl font-bold">
          {open}–{close}
        </p>

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
