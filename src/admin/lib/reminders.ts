import { clinic } from '../../config/clinic'
import { formatClock, formatDate } from './dates'

/** WhatsApp reminder text for an upcoming visit. */
export function buildReminderMessage(patientName: string, startsAt: string | Date): string {
  const firstName = patientName.trim().split(/\s+/)[0] ?? ''
  return [
    `Здравствуйте${firstName ? `, ${firstName}` : ''}!`,
    `Напоминаем о записи в стоматологию ${clinic.name}: ${formatDate(startsAt)} в ${formatClock(startsAt)}.`,
    'Адрес: г. Каракол, ул. Токтогула, 263.',
    'Если планы изменились, пожалуйста, сообщите нам.',
  ].join('\n')
}
