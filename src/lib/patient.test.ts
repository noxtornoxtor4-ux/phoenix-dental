import { describe, expect, test } from 'bun:test'
import { ageOn, formatBirthDate } from './patient'

const today = new Date(2026, 9, 30) // 30 October 2026

describe('ageOn', () => {
  test('counts full years and respects the birthday', () => {
    expect(ageOn('2000-10-30', today)).toBe(26)
    expect(ageOn('2000-10-31', today)).toBe(25)
    expect(ageOn('2008-10-31', today)).toBe(17)
  })

  test('rejects malformed, impossible and future dates', () => {
    expect(ageOn('', today)).toBeNull()
    expect(ageOn('30.10.2000', today)).toBeNull()
    expect(ageOn('2001-02-30', today)).toBeNull()
    expect(ageOn('2027-01-01', today)).toBeNull()
  })
})

describe('formatBirthDate', () => {
  test('writes the date the way people read it', () => {
    expect(formatBirthDate('2015-03-02')).toBe('02.03.2015')
    expect(formatBirthDate('')).toBe('')
  })
})
