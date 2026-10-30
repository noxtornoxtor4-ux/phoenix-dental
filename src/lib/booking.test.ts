import { describe, expect, test } from 'bun:test'
import type { ServiceId } from '../data/services'
import { buildEstimate, describeEstimate } from './booking'

const names = Object.fromEntries(
  (['therapy', 'pain', 'hygiene', 'prosthetics', 'implant', 'xray'] as ServiceId[]).map((id) => [id, `name:${id}`]),
) as Record<ServiceId, string>

describe('buildEstimate', () => {
  test('returns an empty estimate when nothing is picked', () => {
    expect(buildEstimate([])).toEqual({ lines: [], priceFrom: 0, durationMinutes: 0 })
  })

  test('sums prices and visit time in the catalogue order', () => {
    const estimate = buildEstimate(['xray', 'therapy', 'hygiene'])

    expect(estimate.lines.map((line) => line.serviceId)).toEqual(['therapy', 'hygiene', 'xray'])
    expect(estimate.priceFrom).toBe(1500 + 2500 + 400)
    expect(estimate.durationMinutes).toBe(45 + 60 + 10)
  })

  test('ignores duplicates and uses the given price list', () => {
    const catalog = {
      ...buildCatalog(),
      therapy: { id: 'therapy' as const, scope: 'tooth' as const, priceFrom: 1800, durationMinutes: 50, color: '#fff' },
    }
    const estimate = buildEstimate(['therapy', 'therapy'], catalog)

    expect(estimate.lines).toHaveLength(1)
    expect(estimate.priceFrom).toBe(1800)
  })
})

describe('describeEstimate', () => {
  test('lists the picked services', () => {
    expect(describeEstimate(buildEstimate(['xray', 'therapy']), names)).toBe('name:therapy; name:xray')
  })
})

function buildCatalog() {
  return {
    therapy: { id: 'therapy' as const, scope: 'tooth' as const, priceFrom: 1500, durationMinutes: 45, color: '#fff' },
    pain: { id: 'pain' as const, scope: 'tooth' as const, priceFrom: 2000, durationMinutes: 60, color: '#fff' },
    hygiene: { id: 'hygiene' as const, scope: 'visit' as const, priceFrom: 2500, durationMinutes: 60, color: '#fff' },
    prosthetics: { id: 'prosthetics' as const, scope: 'tooth' as const, priceFrom: 6000, durationMinutes: 60, color: '#fff' },
    implant: { id: 'implant' as const, scope: 'tooth' as const, priceFrom: 35000, durationMinutes: 90, color: '#fff' },
    xray: { id: 'xray' as const, scope: 'visit' as const, priceFrom: 400, durationMinutes: 10, color: '#fff' },
  }
}
