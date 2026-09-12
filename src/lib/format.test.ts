import { describe, expect, test } from 'bun:test'
import { formatDuration, formatNumber, formatTime } from './format'

const units = { hour: 'ч', minute: 'мин' }
/** Expected values are written with regular spaces for readability. */
const nbsp = (value: string) => value.replaceAll(' ', ' ')

describe('format', () => {
  test('groups thousands with non-breaking spaces', () => {
    expect(formatNumber(35000)).toBe(nbsp('35 000'))
    expect(formatNumber(400)).toBe('400')
    expect(formatNumber(1234567)).toBe(nbsp('1 234 567'))
  })

  test('formats durations', () => {
    expect(formatDuration(45, units)).toBe(nbsp('45 мин'))
    expect(formatDuration(60, units)).toBe(nbsp('1 ч'))
    expect(formatDuration(160, units)).toBe(`${nbsp('2 ч')} ${nbsp('40 мин')}`)
    expect(formatDuration(0, units)).toBe(nbsp('0 мин'))
  })

  test('formats time with leading zeros', () => {
    expect(formatTime(new Date(2026, 8, 15, 9, 5))).toBe('09:05')
  })
})
