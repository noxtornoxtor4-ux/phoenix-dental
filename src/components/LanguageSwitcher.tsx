import { useI18n } from '../i18n/useI18n'
import { languages } from '../i18n/translations'

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t.header.language}
      className="flex shrink-0 rounded-full border border-line bg-card p-0.5"
    >
      {languages.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`h-8 min-w-9 rounded-full px-2 text-[11px] font-bold tracking-wide transition ${
            lang === code ? 'bg-accent text-white shadow-glow' : 'text-muted hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
