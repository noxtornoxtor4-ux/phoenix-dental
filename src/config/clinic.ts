// Contact data, schedule and booking rules of the clinic.
export const clinic = {
  name: 'The Phoenix',
  /** WhatsApp number of the reception, digits only, international format. */
  whatsapp: '996504314134',
  phoneDisplay: '+996 504 314 134',
  phoneHref: 'tel:+996504314134',
  hasDentalXray: true,
  hours: {
    /** Days of week as returned by Date#getDay(): 0 — Sunday. */
    weekdays: [1, 2, 3, 4, 5, 6],
    open: '09:00',
    close: '18:00',
  },
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
