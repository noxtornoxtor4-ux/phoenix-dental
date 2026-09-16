import { describe, expect, test } from 'bun:test'
import { applyPriceOverrides, services } from './services'

describe('applyPriceOverrides', () => {
  test('updates prices and durations by code', () => {
    const catalog = applyPriceOverrides(services, [
      { code: 'therapy', price: 1800, duration_minutes: 50 },
      { code: 'unknown', price: 1, duration_minutes: 1 },
    ])
    expect(catalog.therapy).toEqual({ ...services.therapy, priceFrom: 1800, durationMinutes: 50 })
    expect(catalog.xray).toBe(services.xray)
    expect(services.therapy.priceFrom).toBe(1500)
  })

  test('ignores invalid values', () => {
    const catalog = applyPriceOverrides(services, [{ code: 'implant', price: Number.NaN, duration_minutes: 90 }])
    expect(catalog.implant).toBe(services.implant)
  })
})
