import { describe, expect, test } from 'bun:test'
import { getBookingDays, getDaySlots } from './slots'

const hours = { weekdays: [1, 2, 3, 4, 5, 6], open: '09:00', close: '18:00' }
// 2026-09-14 is a Monday.
const monday = new Date(2026, 8, 14)
const options = (now: Date) => ({ stepMinutes: 30, durationMinutes: 60, leadMinutes: 60, now })

describe('getDaySlots', () => {
  test('respects lead time and closing time', () => {
    const slots = getDaySlots(monday, hours, options(new Date(2026, 8, 14, 10, 10)))
    const available = slots.filter((slot) => slot.available).map((slot) => slot.time)

    expect(slots[0].time).toBe('09:00')
    expect(available[0]).toBe('11:30')
    expect(available.at(-1)).toBe('17:00')
  })

  test('returns no slots on days off', () => {
    expect(getDaySlots(new Date(2026, 8, 13), hours, options(new Date(2026, 8, 1)))).toEqual([])
  })
})

describe('getBookingDays', () => {
  test('includes today while slots are left', () => {
    const days = getBookingDays(3, hours, options(new Date(2026, 8, 14, 10, 0)))
    expect(days.map((day) => day.getDate())).toEqual([14, 15, 16])
  })

  test('skips a finished day and the day off', () => {
    const days = getBookingDays(2, hours, options(new Date(2026, 8, 19, 17, 45)))
    expect(days.map((day) => day.getDate())).toEqual([21, 22])
  })
})
