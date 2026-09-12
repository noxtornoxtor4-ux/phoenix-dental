import { serviceOrder, services, type ServiceId } from '../data/services'

/** Tooth number (FDI) → problem attached to it. */
export type ToothSelection = Record<number, ServiceId>

export interface BookingSelection {
  teeth: ToothSelection
  services: ServiceId[]
}

export interface EstimateLine {
  serviceId: ServiceId
  teeth: number[]
  units: number
  price: number
  durationMinutes: number
}

export interface Estimate {
  lines: EstimateLine[]
  priceFrom: number
  durationMinutes: number
}

function teethWith(selection: BookingSelection, serviceId: ServiceId): number[] {
  return Object.entries(selection.teeth)
    .filter(([, problem]) => problem === serviceId)
    .map(([tooth]) => Number(tooth))
    .sort((a, b) => a - b)
}

export function buildEstimate(selection: BookingSelection): Estimate {
  const lines: EstimateLine[] = []

  for (const serviceId of serviceOrder) {
    const teeth = teethWith(selection, serviceId)
    const listed = selection.services.includes(serviceId)
    if (teeth.length === 0 && !listed) continue

    const service = services[serviceId]
    const units = service.scope === 'tooth' ? Math.max(teeth.length, 1) : 1
    lines.push({
      serviceId,
      teeth,
      units,
      price: service.priceFrom * units,
      durationMinutes: service.durationMinutes * units,
    })
  }

  return {
    lines,
    priceFrom: lines.reduce((sum, line) => sum + line.price, 0),
    durationMinutes: lines.reduce((sum, line) => sum + line.durationMinutes, 0),
  }
}

export interface SelectionLabels {
  tooth: (toothNumber: number) => string
  problems: Record<ServiceId, string>
  services: Record<ServiceId, string>
}

/** Human readable summary, e.g. "№36, №37 — Кариес; Рентген". */
export function describeEstimate(estimate: Estimate, labels: SelectionLabels): string {
  return estimate.lines
    .map((line) =>
      line.teeth.length > 0
        ? `${line.teeth.map(labels.tooth).join(', ')} — ${labels.problems[line.serviceId]}`
        : labels.services[line.serviceId],
    )
    .join('; ')
}
