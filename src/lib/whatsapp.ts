export function createWhatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

export interface BookingMessageLabels {
  greeting: string
  service: string
  price: string
  dateTime: string
  patient: string
  visitFirst: string
  visitReturning: string
  birth: string
  parent: string
}

export interface BookingMessageValues {
  service: string
  price: string
  dateTime: string
  name: string
  phone: string
  visitType: 'first' | 'returning'
  /** First visit only. */
  birthDate: string
  /** Parent name and phone in one line; empty for adults. */
  parent: string
}

export function buildBookingMessage(labels: BookingMessageLabels, values: BookingMessageValues): string {
  return [
    labels.greeting,
    `📌 ${labels.service}: ${values.service}`,
    `💰 ${labels.price}: ${values.price}`,
    `📅 ${labels.dateTime}: ${values.dateTime}`,
    `👤 ${labels.patient}: ${values.name}, ${values.phone}`,
    `🆕 ${values.visitType === 'first' ? labels.visitFirst : labels.visitReturning}`,
    values.birthDate && `🎂 ${labels.birth}: ${values.birthDate}`,
    values.parent && `👪 ${labels.parent}: ${values.parent}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export interface SosMessageLabels {
  title: string
  body: string
}

export function buildSosMessage(labels: SosMessageLabels): string {
  return [`🚨 ${labels.title}`, labels.body].join('\n')
}
