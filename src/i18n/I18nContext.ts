import { createContext } from 'react'
import type { Dictionary, Lang } from './translations'

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Dictionary
}

export const I18nContext = createContext<I18nValue | null>(null)
