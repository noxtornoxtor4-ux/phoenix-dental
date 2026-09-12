import { describe, expect, test } from 'bun:test'
import type { ServiceId } from '../data/services'
import { buildEstimate, describeEstimate } from './booking'

const names = (value: string) =>
  Object.fromEntries(
    (['therapy', 'pain', 'hygiene', 'prosthetics', 'implant', 'xray'] as ServiceId[]).map((id) => [
      id,
      `${value}:${id}`,
    ]),
  ) as Record<ServiceId, string>

describe('buildEstimate', () => {
  test('returns an empty estimate for an empty selection', () => {
    expect(buildEstimate({ teeth: {}, services: [] })).toEqual({ lines: [], priceFrom: 0, durationMinutes: 0 })
  })

  test('charges per tooth and once per visit', () => {
    const estimate = buildEstimate({
      teeth: { 37: 'therapy', 36: 'therapy', 11: 'hygiene', 21: 'hygiene' },
      services: ['xray', 'therapy'],
    })

    expect(estimate.lines.map(({ serviceId, teeth, units, price }) => ({ serviceId, teeth, units, price }))).toEqual([
      { serviceId: 'therapy', teeth: [36, 37], units: 2, price: 3000 },
      { serviceId: 'hygiene', teeth: [11, 21], units: 1, price: 2500 },
      { serviceId: 'xray', teeth: [], units: 1, price: 400 },
    ])
    expect(estimate.priceFrom).toBe(5900)
    expect(estimate.durationMinutes).toBe(90 + 60 + 10)
  })

  test('counts a listed per-tooth service without teeth as one unit', () => {
    expect(buildEstimate({ teeth: {}, services: ['implant'] }).priceFrom).toBe(35000)
  })
})

describe('describeEstimate', () => {
  test('groups teeth by problem and appends list services', () => {
    const estimate = buildEstimate({ teeth: { 36: 'therapy', 11: 'pain' }, services: ['xray'] })
    const text = describeEstimate(estimate, {
      tooth: (n) => `№${n}`,
      problems: names('problem'),
      services: names('service'),
    })

    expect(text).toBe('№11 — problem:pain; №36 — problem:therapy; service:xray')
  })
})
