import { describe, expect, test } from 'bun:test'
import { bucketSeries, formatCompact, niceTicks, percent, tally } from './analytics'

const nbsp = (value: string) => value.replaceAll(' ', ' ')

describe('bucketSeries', () => {
  const items = [
    { at: new Date(2026, 8, 14, 10).toISOString(), amount: 1000 },
    { at: new Date(2026, 8, 14, 18).toISOString(), amount: 500.5 },
    { at: new Date(2026, 8, 16, 9).toISOString(), amount: 2000 },
    { at: new Date(2026, 9, 1, 9).toISOString(), amount: 99 },
  ]

  test('keeps empty days and ignores values outside the period', () => {
    const series = bucketSeries(
      items,
      { from: new Date(2026, 8, 14), to: new Date(2026, 8, 17) },
      (item) => item.at,
      (item) => item.amount,
    )
    expect(series.map((point) => [point.key, point.value])).toEqual([
      ['2026-09-14', 1500.5],
      ['2026-09-15', 0],
      ['2026-09-16', 2000],
    ])
  })

  test('switches to months for long periods', () => {
    const series = bucketSeries(
      items,
      { from: new Date(2026, 6, 1), to: new Date(2026, 10, 1) },
      (item) => item.at,
      (item) => item.amount,
    )
    expect(series.map((point) => [point.key, point.value])).toEqual([
      ['2026-07', 0],
      ['2026-08', 0],
      ['2026-09', 3500.5],
      ['2026-10', 99],
    ])
  })
})

describe('axis helpers', () => {
  test('builds clean ticks', () => {
    expect(niceTicks(0)).toEqual([0])
    expect(niceTicks(3700)).toEqual([0, 1000, 2000, 3000, 4000])
    expect(niceTicks(9)).toEqual([0, 2.5, 5, 7.5, 10])
    expect(niceTicks(40000)).toEqual([0, 10000, 20000, 30000, 40000])
  })

  test('formats compact numbers', () => {
    expect(formatCompact(950)).toBe('950')
    expect(formatCompact(9500)).toBe(nbsp('9 500'))
    expect(formatCompact(12900)).toBe('13 тыс')
    expect(formatCompact(40000)).toBe('40 тыс')
    expect(formatCompact(1_250_000)).toBe('1,3 млн')
  })
})

describe('tally', () => {
  test('counts and sums by key, largest first', () => {
    const rows = [{ k: 'a', v: 2 }, { k: 'b', v: 5 }, { k: 'a', v: 4 }]
    expect(tally(rows, (row) => row.k)).toEqual([
      { key: 'a', value: 2 },
      { key: 'b', value: 1 },
    ])
    expect(tally(rows, (row) => row.k, (row) => row.v)).toEqual([
      { key: 'a', value: 6 },
      { key: 'b', value: 5 },
    ])
    expect(percent(1, 3)).toBe(33)
    expect(percent(1, 0)).toBe(0)
  })
})
