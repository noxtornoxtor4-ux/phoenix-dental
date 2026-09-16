import { useEffect, useState, type ReactNode } from 'react'
import { applyPriceOverrides, services, type PriceOverride, type ServiceCatalog } from '../data/services'
import { fetchSitePrices } from '../lib/publicApi'
import { ServiceCatalogContext } from './ServiceCatalogContext'

const CACHE_KEY = 'phoenix:prices'

function readCachedCatalog(): ServiceCatalog {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as PriceOverride[] | null
    return Array.isArray(cached) ? applyPriceOverrides(services, cached) : services
  } catch {
    return services
  }
}

/** Loads prices from the CRM; the last known prices keep working offline in the installed app. */
export function ServiceCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState(readCachedCatalog)

  useEffect(() => {
    let cancelled = false
    fetchSitePrices(Object.keys(services)).then((rows) => {
      if (cancelled || !rows) return
      setCatalog(applyPriceOverrides(services, rows))
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
      } catch {
        // Prices simply won't be cached.
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return <ServiceCatalogContext value={catalog}>{children}</ServiceCatalogContext>
}
