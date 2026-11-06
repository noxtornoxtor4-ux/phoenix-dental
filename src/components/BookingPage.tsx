import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'
import { goHome } from '../lib/route'
import { BookingSection } from './booking/BookingSection'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'

/** The form on its own screen: nothing on the page competes with it. */
export function BookingPage() {
  const { t } = useI18n()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-card/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <button
            type="button"
            onClick={goHome}
            aria-label={t.booking.back}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition hover:bg-field"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button type="button" onClick={goHome} className="min-w-0 flex-1 text-left">
            <Logo />
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main>
        <BookingSection />
      </main>
    </>
  )
}
