import { CalendarDays } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

/** Fixed booking button on phones, where the header button scrolls out of reach. */
export function BookingDock() {
  const { t } = useI18n()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
      <a
        href="#booking"
        className="glass mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-accent px-4 py-4 font-bold text-ink-900 shadow-2xl shadow-black/50 transition active:scale-95"
      >
        <CalendarDays className="size-5" />
        {t.dock.book}
      </a>
    </div>
  )
}
