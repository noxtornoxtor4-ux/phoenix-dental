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

const MINUTE = 60_000

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

export function getDaySlots(day: Date, hours: WorkingHours, options: SlotOptions): TimeSlot[] {
  if (!hours.weekdays.includes(day.getDay())) return []

  const open = toMinutes(hours.open)
  const close = toMinutes(hours.close)
  const earliest = options.now.getTime() + options.leadMinutes * MINUTE
  const slots: TimeSlot[] = []

  for (let minute = open; minute < close; minute += options.stepMinutes) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute)
    slots.push({
      time: formatTime(start),
      start,
      available: start.getTime() >= earliest && minute + options.durationMinutes <= close,
    })
  }

  return slots
}

/** Nearest `count` days that still have at least one free slot. */
export function getBookingDays(count: number, hours: WorkingHours, options: SlotOptions): Date[] {
  const days: Date[] = []
  const { now } = options

  for (let offset = 0; days.length < count && offset < count * 3; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
    if (getDaySlots(day, hours, options).some((slot) => slot.available)) days.push(day)
  }

  return days
}
