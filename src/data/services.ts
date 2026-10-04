export type ServiceId = 'therapy' | 'pain' | 'hygiene' | 'prosthetics' | 'implant' | 'xray'

/** `tooth` — priced per tooth, `visit` — priced once per visit. */
export type ServiceScope = 'tooth' | 'visit'

export interface Service {
  id: ServiceId
  scope: ServiceScope
  /** Starting price in KGS (som). */
  priceFrom: number
  durationMinutes: number
  color: string
}

// Indicative prices. Keep in sync with the clinic price list.
export const services: Record<ServiceId, Service> = {
  therapy: { id: 'therapy', scope: 'tooth', priceFrom: 1500, durationMinutes: 45, color: '#FFB020' },
  pain: { id: 'pain', scope: 'tooth', priceFrom: 2000, durationMinutes: 60, color: '#FF3B5C' },
  hygiene: { id: 'hygiene', scope: 'visit', priceFrom: 2500, durationMinutes: 60, color: '#DCA457' },
  prosthetics: { id: 'prosthetics', scope: 'tooth', priceFrom: 6000, durationMinutes: 60, color: '#A78BFA' },
  implant: { id: 'implant', scope: 'tooth', priceFrom: 35000, durationMinutes: 90, color: '#34D399' },
  xray: { id: 'xray', scope: 'visit', priceFrom: 400, durationMinutes: 10, color: '#60A5FA' },
}

/** Order used for estimates and messages. */
export const serviceOrder: ServiceId[] = ['pain', 'therapy', 'hygiene', 'prosthetics', 'implant', 'xray']

/** Problems a patient can attach to a tooth on the chart. */
export const toothProblems: ServiceId[] = ['therapy', 'pain', 'hygiene', 'prosthetics', 'implant']

/** Services available in the list mode of the booking wizard. */
export const listServices: ServiceId[] = ['therapy', 'xray', 'hygiene', 'prosthetics', 'implant']

export type ServiceCatalog = Record<ServiceId, Service>

export interface PriceOverride {
  code: string
  price: number
  duration_minutes: number
}

/** Applies prices and durations from the CRM price list to the site catalog. Unknown codes are ignored. */
export function applyPriceOverrides(base: ServiceCatalog, overrides: PriceOverride[]): ServiceCatalog {
  const catalog = { ...base }
  for (const row of overrides) {
    if (!(row.code in catalog)) continue
    const id = row.code as ServiceId
    const price = Number(row.price)
    const duration = Number(row.duration_minutes)
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration <= 0) continue
    catalog[id] = { ...catalog[id], priceFrom: price, durationMinutes: duration }
  }
  return catalog
}
