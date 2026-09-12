import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext } from './I18nContext'
import { dictionaries, type Lang } from './translations'

const STORAGE_KEY = 'phoenix:lang'

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in dictionaries) return stored as Lang
  } catch {
    // Storage can be blocked; fall back to the browser language.
  }
  const browser = navigator.language.toLowerCase()
  if (browser.startsWith('ky')) return 'ky'
  if (browser.startsWith('en')) return 'en'
  return 'ru'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice simply won't persist.
    }
  }, [])

  const value = useMemo(() => ({ lang, setLang, t: dictionaries[lang] }), [lang, setLang])

  return <I18nContext value={value}>{children}</I18nContext>
}
