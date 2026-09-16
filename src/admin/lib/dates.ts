import { formatNumber } from '../../lib/format'

const DAY = 24 * 60 * 60 * 1000

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes())
}

/** Monday of the week that contains `date`. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date)
  return addDays(day, -((day.getDay() + 6) % 7))
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY)
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Value for <input type="date">, in local time. */
export function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toTimeInput(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Combines <input type="date"> and <input type="time"> values into a local Date. */
export function fromDateTimeInputs(date: string, time: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const timeMatch = /^(\d{2}):(\d{2})/.exec(time)
  if (!match || !timeMatch) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(timeMatch[1]), Number(timeMatch[2]))
}

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
const shortDateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const weekdayFormat = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })

export const formatDate = (value: string | Date) => dateFormat.format(new Date(value))
export const formatShortDate = (value: string | Date) => shortDateFormat.format(new Date(value))
export const formatWeekday = (value: string | Date) => weekdayFormat.format(new Date(value))
export const formatClock = (value: string | Date) => toTimeInput(new Date(value))
export const formatDateTime = (value: string | Date) => `${formatDate(value)}, ${formatClock(value)}`

export function formatSom(value: number): string {
  return `${formatNumber(value)} сом`
}

export function ageFrom(birthDate: string, today = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}
