import { Smartphone, X } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { usePwaInstall } from '../pwa/usePwaInstall'

const STORAGE_KEY = 'phoenix:install-banner-dismissed-at'
const HIDE_FOR_MS = 7 * 24 * 60 * 60 * 1000

function wasDismissedRecently(): boolean {
  try {
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY))
    return dismissedAt > 0 && Date.now() - dismissedAt < HIDE_FOR_MS
  } catch {
    return false
  }
}

export function InstallBanner() {
  const { t } = useI18n()
  const { installed, requestInstall } = usePwaInstall()
  const [dismissed, setDismissed] = useState(wasDismissedRecently)

  if (installed || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // The banner will simply show again next time.
    }
  }

  return (
    <div className="animate-rise border-t border-white/5 bg-gradient-to-r from-accent/10 via-transparent to-accent/10 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
          <Smartphone className="size-5" />
        </span>
        <p className="flex-1 text-xs leading-snug text-white/80">{t.install.banner}</p>
        <button
          type="button"
          onClick={requestInstall}
          className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-xs font-bold text-navy-900 active:scale-95"
        >
          {t.install.action}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.install.dismiss}
          className="-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-white/50 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
