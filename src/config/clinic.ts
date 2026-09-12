// Contact data, schedule and booking rules of the clinic.
// Replace the placeholder phone numbers with the real ones before release.
export const clinic = {
  name: 'PHOENIX',
  /** WhatsApp number of the reception, digits only, international format. */
  whatsapp: '996700000000',
  /** WhatsApp number of the doctor on duty for urgent requests. */
  sosWhatsapp: '996700000000',
  phoneDisplay: '+996 700 000 000',
  phoneHref: 'tel:+996700000000',
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
  maps: {
    query: 'Каракол, улица Токтогула, 263',
    googleRoute: 'https://www.google.com/maps/dir/?api=1&destination=',
    googleEmbed: 'https://www.google.com/maps?output=embed&q=',
    twoGisSearch: 'https://2gis.kg/karakol/search/',
  },
} as const
