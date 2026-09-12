import { Download } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'
import { usePwaInstall } from '../pwa/usePwaInstall'
import { InstallBanner } from './InstallBanner'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'

export function Header() {
  const { t } = useI18n()
  const { installed, requestInstall } = usePwaInstall()

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-navy-900/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <a href="#top" className="min-w-0 flex-1">
          <Logo subtitle={t.header.address} />
        </a>

        <LanguageSwitcher />

        {!installed && (
          <button
            type="button"
            onClick={requestInstall}
            aria-label={t.header.install}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-2.5 text-sm font-bold text-navy-900 shadow-glow transition hover:bg-accent-300 active:scale-95 sm:px-4"
          >
            <Download className="size-5 sm:size-4" />
            <span className="hidden sm:inline">{t.header.install}</span>
          </button>
        )}
      </div>

      <InstallBanner />
    </header>
  )
}
