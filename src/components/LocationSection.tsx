import { Clock, MapPin, Navigation, Phone, ScanLine } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clinic } from '../config/clinic'
import { useI18n } from '../i18n/useI18n'
import { SectionHeading } from './ui/SectionHeading'

const allWeekdays = [1, 2, 3, 4, 5, 6, 0]
const MAP_PROBE_TIMEOUT_MS = 6000

export function LocationSection() {
  const { t } = useI18n()
  const query = encodeURIComponent(clinic.maps.query)
  const { lat, lon } = clinic.maps
  // The widget takes longitude first; a plain pin keeps the balloon off the map.
  const mapSrc = `${clinic.maps.yandexWidget}?ll=${lon},${lat}&z=17&l=map&lang=ru_RU&pt=${lon},${lat},pm2rdm`
  const routeHref = `${clinic.maps.yandexRoute}?rtext=~${lat},${lon}&rtt=auto`
  const { weekdays, open, close } = clinic.hours

  // Mobile browsers with tracking protection (and offline visits) block the map widget.
  // An iframe reports "load" even for an error page, so reachability is probed separately.
  const [mapBlocked, setMapBlocked] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), MAP_PROBE_TIMEOUT_MS)
    let cancelled = false

    fetch(clinic.maps.yandexWidget, { mode: 'no-cors', signal: controller.signal })
      .catch(() => {
        if (!cancelled) setMapBlocked(true)
      })
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

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
    ...(clinic.hasDentalXray ? [{ icon: ScanLine, title: t.location.xray, text: '' }] : []),
  ]

  return (
    <section id="location" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <SectionHeading eyebrow={t.location.eyebrow} title={t.location.title} />

      <div className="mt-8 grid items-start gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="glass flex flex-col rounded-[2rem] p-5 sm:p-6">
          <ul className="space-y-4">
            {infoRows.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 self-center">
                  <span className="block font-semibold">{title}</span>
                  {text && <span className="block text-sm text-white/55">{text}</span>}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">{t.location.hoursTitle}</p>
          <p className="mt-1 font-display text-2xl font-bold">
            {open}–{close}
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 md:mt-auto md:pt-6">
            <a
              href={routeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-4 font-bold text-ink-900 shadow-glow transition hover:bg-accent-300 active:scale-[0.98] sm:col-span-2"
            >
              <Navigation className="size-5" />
              {t.location.route}
            </a>
            <a
              href={`${clinic.maps.twoGisSearch}${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold transition hover:bg-white/10"
            >
              <span className="grid size-5 place-items-center rounded-md bg-[#19AA1E] text-[9px] font-black text-white">2</span>
              2GIS
            </a>
            <a
              href={clinic.phoneHref}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold transition hover:bg-white/10"
            >
              <Phone className="size-5 text-accent" />
              {t.location.call}
            </a>
          </div>
        </div>

        <div className="glass relative min-h-80 overflow-hidden rounded-[2rem] p-1.5">
          {/* Always under the map: visible while it loads, and instead of it when embeds are blocked. */}
          <a
            href={routeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-1.5 flex flex-col items-center justify-center gap-3 rounded-[1.6rem] bg-[radial-gradient(circle_at_50%_35%,rgb(220_164_87/0.12),transparent_70%)] p-6 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-accent/15 text-accent">
              <MapPin className="size-7" />
            </span>
            <span className="font-display text-lg font-semibold">{t.location.address}</span>
            <span className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-ink-900">
              <Navigation className="size-4" />
              {t.location.route}
            </span>
          </a>
          {!mapBlocked && (
            <iframe
              title={t.location.mapTitle}
              src={mapSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="relative size-full min-h-72 rounded-[1.6rem] border-0 [filter:invert(0.92)_hue-rotate(185deg)_saturate(0.6)_sepia(0.35)_brightness(0.92)]"
            />
          )}
          <span className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full bg-ink-900/85 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            <MapPin className="size-3.5 text-accent" />
            PHOENIX
          </span>
        </div>

        {/* Always readable, even if the map tiles never arrive on a slow phone. */}
        <a
          href={routeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition hover:bg-white/10 md:col-start-2"
        >
          <MapPin className="size-5 shrink-0 text-accent" />
          <span className="min-w-0 flex-1 truncate">{t.location.address}</span>
          <span className="flex shrink-0 items-center gap-1.5 font-semibold text-accent">
            {t.location.route}
            <Navigation className="size-4" />
          </span>
        </a>
      </div>
    </section>
  )
}
