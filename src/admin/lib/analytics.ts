import { formatNumber } from '../../lib/format'
import { addDays, daysBetween, startOfDay, toDateInput } from './dates'
import type { Period } from './finance'

export interface SeriesPoint {
  key: string
  label: string
  value: number
}

const dayLabel = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const monthLabel = new Intl.DateTimeFormat('ru-RU', { month: 'short', year: '2-digit' })
const MAX_DAILY_BUCKETS = 62

/** Sums values into daily buckets, or monthly ones for long periods. Empty buckets are kept. */
export function bucketSeries<T>(items: T[], period: Period, getDate: (item: T) => string, getValue: (item: T) => number): SeriesPoint[] {
  const monthly = daysBetween(period.from, period.to) > MAX_DAILY_BUCKETS
  const keyOf = (date: Date) => (monthly ? toDateInput(date).slice(0, 7) : toDateInput(date))

  const buckets = new Map<string, SeriesPoint>()
  for (let day = startOfDay(period.from); day < period.to; day = addDays(day, 1)) {
    const key = keyOf(day)
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: monthly ? monthLabel.format(day) : dayLabel.format(day), value: 0 })
    }
  }
  for (const item of items) {
    const bucket = buckets.get(keyOf(new Date(getDate(item))))
    if (bucket) bucket.value = Math.round((bucket.value + getValue(item)) * 100) / 100
  }
  return [...buckets.values()]
}

/** Clean axis ticks from zero: steps of 1, 2, 2.5 or 5 × 10ⁿ. */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0]
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= raw) ?? raw
  const steps = Math.ceil(max / step - 1e-9)
  return Array.from({ length: steps + 1 }, (_, index) => Math.round(index * step * 1000) / 1000)
}

/** 950 → "950", 12 900 → "12,9 тыс", 1 250 000 → "1,3 млн". */
export function formatCompact(value: number): string {
  const abs = Math.abs(value)
  const compact = (divider: number, unit: string) => {
    const scaled = value / divider
    const digits = Math.abs(scaled) < 10 && !Number.isInteger(scaled) ? 1 : 0
    return `${scaled.toFixed(digits).replace('.', ',').replace(/,0$/, '')} ${unit}`
  }
  if (abs >= 1_000_000) return compact(1_000_000, 'млн')
  if (abs >= 10_000) return compact(1_000, 'тыс')
  return formatNumber(value)
}

export interface Tally {
  key: string
  value: number
}

/** Groups items by key and sums values, largest first. */
export function tally<T>(items: T[], getKey: (item: T) => string, getValue: (item: T) => number = () => 1): Tally[] {
  const totals = new Map<string, number>()
  for (const item of items) {
    const key = getKey(item)
    totals.set(key, Math.round(((totals.get(key) ?? 0) + getValue(item)) * 100) / 100)
  }
  return [...totals.entries()].map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value)
}

export function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0
}
