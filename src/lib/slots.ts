import { formatTime } from './format'

export interface WorkingHours {
  weekdays: readonly number[]
  open: string
  close: string
}

export interface SlotOptions {
  stepMinutes: number
  durationMinutes: number
  leadMinutes: number
  now: Date
}

export interface TimeSlot {
  time: string
  start: Date
  available: boolean
}

/** Why a visit can or cannot start at a given moment. */
export type SlotStatus = 'available' | 'dayOff' | 'closed' | 'tooSoon' | 'tooLate'

const MINUTE = 60_000
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

/** Combines a day with "HH:MM" (as produced by <input type="time">); null for malformed input. */
export function withTime(day: Date, time: string): Date | null {
  const match = TIME_PATTERN.exec(time)
  if (!match) return null
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(match[1]), Number(match[2]))
}

export function getSlotStatus(
  start: Date,
  hours: WorkingHours,
  options: Omit<SlotOptions, 'stepMinutes'>,
): SlotStatus {
  if (!hours.weekdays.includes(start.getDay())) return 'dayOff'

  const minute = start.getHours() * 60 + start.getMinutes()
  const close = toMinutes(hours.close)
  if (minute < toMinutes(hours.open) || minute >= close) return 'closed'
  if (start.getTime() < options.now.getTime() + options.leadMinutes * MINUTE) return 'tooSoon'
  if (minute + options.durationMinutes > close) return 'tooLate'
  return 'available'
}

export function getDaySlots(day: Date, hours: WorkingHours, options: SlotOptions): TimeSlot[] {
  if (!hours.weekdays.includes(day.getDay())) return []

  const close = toMinutes(hours.close)
  const slots: TimeSlot[] = []

  for (let minute = toMinutes(hours.open); minute < close; minute += options.stepMinutes) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute)
    slots.push({
      time: formatTime(start),
      start,
      available: getSlotStatus(start, hours, options) === 'available',
    })
  }

  return slots
}

export function hasAvailableSlot(day: Date, hours: WorkingHours, options: SlotOptions): boolean {
  return getDaySlots(day, hours, options).some((slot) => slot.available)
}

/** Nearest `count` days that still have at least one free slot, looking at most `horizonDays` ahead. */
export function getBookingDays(
  count: number,
  hours: WorkingHours,
  options: SlotOptions,
  horizonDays = 60,
): Date[] {
  const days: Date[] = []
  const { now } = options

  for (let offset = 0; days.length < count && offset <= horizonDays; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    if (hasAvailableSlot(day, hours, options)) days.push(day)
  }

  return days
}

/** Calendar cells of a month: weeks start on Monday, `null` pads the first week. */
export function getMonthGrid(year: number, month: number): (Date | null)[] {
  const leading = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ]
}
