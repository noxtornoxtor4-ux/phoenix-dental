import { describe, expect, test } from 'bun:test'
import { addDays, ageFrom, daysBetween, fromDateTimeInputs, startOfWeek, toDateInput, toTimeInput } from './dates'

describe('dates', () => {
  test('finds the Monday of a week', () => {
    // 2026-09-20 is a Sunday, 2026-09-14 is a Monday.
    expect(toDateInput(startOfWeek(new Date(2026, 8, 20, 15)))).toBe('2026-09-14')
    expect(toDateInput(startOfWeek(new Date(2026, 8, 14)))).toBe('2026-09-14')
  })

  test('round-trips form inputs in local time', () => {
    const date = fromDateTimeInputs('2026-09-21', '09:05')!
    expect(toDateInput(date)).toBe('2026-09-21')
    expect(toTimeInput(date)).toBe('09:05')
    expect(fromDateTimeInputs('21.09.2026', '09:05')).toBeNull()
  })

  test('counts days and ages across month boundaries', () => {
    expect(daysBetween(new Date(2026, 8, 28, 23), addDays(new Date(2026, 8, 28), 5))).toBe(5)
    expect(ageFrom('1990-09-17', new Date(2026, 8, 16))).toBe(35)
    expect(ageFrom('1990-09-16', new Date(2026, 8, 16))).toBe(36)
  })
})
