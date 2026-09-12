import { useI18n } from '../i18n/useI18n'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/5 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Logo subtitle={t.header.address} />
        <div className="text-xs text-white/40 sm:text-right">
          <p>
            © {new Date().getFullYear()} PHOENIX. {t.footer.rights}
          </p>
          <p className="mt-1">{t.footer.note}</p>
        </div>
      </div>
    </footer>
  )
}
