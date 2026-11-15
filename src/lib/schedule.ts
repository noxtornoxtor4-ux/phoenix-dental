import { hoursOn, type DayHours } from '../config/clinic'

export interface ScheduleLabels {
  /** Short weekday names, Sunday first, the way Date#getDay() numbers them. */
  weekdaysShort: string[]
  dayOff: string
}

export interface ScheduleLine {
  /** "Пн–Пт" or "Сб". */
  days: string
  /** "09:00–17:00", or the day-off wording. */
  hours: string
  closed: boolean
}

/** The week as a visitor reads it, Monday first. */
const WEEK = [1, 2, 3, 4, 5, 6, 0]

/**
 * The opening hours as lines for the address card: days in a row that share their
 * hours become one range, so a usual week is "Пн–Пт", "Сб" and "Вс".
 */
export function openingSchedule(
  labels: ScheduleLabels,
  hoursFor: (weekday: number) => DayHours | null = hoursOn,
): ScheduleLine[] {
  const runs: { days: number[]; hours: DayHours | null }[] = []

  for (const day of WEEK) {
    const hours = hoursFor(day)
    const last = runs.at(-1)
    if (last && last.hours?.open === hours?.open && last.hours?.close === hours?.close) last.days.push(day)
    else runs.push({ days: [day], hours })
  }

  return runs.map(({ days, hours }) => ({
    days:
      days.length > 1
        ? `${labels.weekdaysShort[days[0]]}–${labels.weekdaysShort[days[days.length - 1]]}`
        : labels.weekdaysShort[days[0]],
    hours: hours ? `${hours.open}–${hours.close}` : labels.dayOff,
    closed: hours === null,
  }))
}
