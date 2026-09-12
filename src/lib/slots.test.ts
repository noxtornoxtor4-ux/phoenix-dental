import { describe, expect, test } from 'bun:test'
import { getBookingDays, getDaySlots, getMonthGrid, getSlotStatus, withTime } from './slots'

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

describe('getSlotStatus', () => {
  const now = options(new Date(2026, 8, 14, 10, 10))
  const at = (day: number, hh: number, mm: number) => new Date(2026, 8, day, hh, mm)

  test('explains why a custom time is not bookable', () => {
    expect(getSlotStatus(at(13, 12, 0), hours, now)).toBe('dayOff')
    expect(getSlotStatus(at(14, 8, 30), hours, now)).toBe('closed')
    expect(getSlotStatus(at(14, 18, 0), hours, now)).toBe('closed')
    expect(getSlotStatus(at(14, 11, 0), hours, now)).toBe('tooSoon')
    expect(getSlotStatus(at(14, 17, 15), hours, now)).toBe('tooLate')
  })

  test('accepts any minute inside working hours', () => {
    expect(getSlotStatus(at(14, 14, 5), hours, now)).toBe('available')
    expect(getSlotStatus(at(15, 9, 0), hours, now)).toBe('available')
  })
})

describe('withTime', () => {
  test('parses time input values', () => {
    expect(withTime(monday, '14:05')).toEqual(new Date(2026, 8, 14, 14, 5))
    expect(withTime(monday, '09:30:00')).toEqual(new Date(2026, 8, 14, 9, 30))
    expect(withTime(monday, '24:00')).toBeNull()
    expect(withTime(monday, '')).toBeNull()
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

  test('stops at the booking horizon', () => {
    expect(getBookingDays(10, hours, options(new Date(2026, 8, 14, 10, 0)), 2)).toHaveLength(3)
  })
})

describe('getMonthGrid', () => {
  test('pads the first week so that it starts on Monday', () => {
    // September 2026 starts on Tuesday, February 2026 on Sunday.
    const september = getMonthGrid(2026, 8)
    expect(september).toHaveLength(31)
    expect(september[0]).toBeNull()
    expect(september[1]).toEqual(new Date(2026, 8, 1))

    const february = getMonthGrid(2026, 1)
    expect(february.filter((cell) => cell === null)).toHaveLength(6)
    expect(february.at(-1)).toEqual(new Date(2026, 1, 28))
  })
})
