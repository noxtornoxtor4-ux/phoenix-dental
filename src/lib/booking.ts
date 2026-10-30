import { serviceOrder, services, type ServiceCatalog, type ServiceId } from '../data/services'

export interface EstimateLine {
  serviceId: ServiceId
  price: number
  durationMinutes: number
}

export interface Estimate {
  lines: EstimateLine[]
  priceFrom: number
  durationMinutes: number
}

/** Indicative price and visit length for the services a visitor picked. */
export function buildEstimate(selected: readonly ServiceId[], catalog: ServiceCatalog = services): Estimate {
  const lines: EstimateLine[] = serviceOrder
    .filter((serviceId) => selected.includes(serviceId))
    .map((serviceId) => ({
      serviceId,
      price: catalog[serviceId].priceFrom,
      durationMinutes: catalog[serviceId].durationMinutes,
    }))

  return {
    lines,
    priceFrom: lines.reduce((sum, line) => sum + line.price, 0),
    durationMinutes: lines.reduce((sum, line) => sum + line.durationMinutes, 0),
  }
}

/** Human readable summary, e.g. "Терапия; Дентальный рентген". */
export function describeEstimate(estimate: Estimate, names: Record<ServiceId, string>): string {
  return estimate.lines.map((line) => names[line.serviceId]).join('; ')
}
