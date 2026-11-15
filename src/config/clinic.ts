// Contact data, schedule and booking rules of the clinic.
export const clinic = {
  name: 'The Phoenix',
  /** WhatsApp number of the reception, digits only, international format. */
  whatsapp: '996504314134',
  phoneDisplay: '+996 504 314 134',
  phoneHref: 'tel:+996504314134',
  booking: {
    slotStepMinutes: 30,
    /** Minimum time between now and the first bookable slot today. */
    leadMinutes: 60,
    /** Longer treatment plans are split into several visits. */
    maxVisitMinutes: 180,
    /** How many days ahead the calendar allows booking. */
    horizonDays: 60,
  },
} as const

export interface DayHours {
  /** "09:00" */
  open: string
  /** "17:00" */
  close: string
}

const fullDay: DayHours = { open: '09:00', close: '17:00' }

/**
 * Opening hours by day of week, as Date#getDay() numbers them: 0 — Sunday.
 * A day that is not listed is a day off.
 */
const hoursByDay: Record<number, DayHours> = {
  1: fullDay,
  2: fullDay,
  3: fullDay,
  4: fullDay,
  5: fullDay,
  6: { open: '09:00', close: '14:00' },
}

/** The hours of a day of week, or null when the clinic is closed that day. */
export function hoursOn(weekday: number): DayHours | null {
  return hoursByDay[weekday] ?? null
}

/** The widest span of the week; a day grid is drawn over it. */
export const hoursSpan: DayHours = {
  open: Object.values(hoursByDay).reduce((min, hours) => (hours.open < min ? hours.open : min), '23:59'),
  close: Object.values(hoursByDay).reduce((max, hours) => (hours.close > max ? hours.close : max), '00:00'),
}
