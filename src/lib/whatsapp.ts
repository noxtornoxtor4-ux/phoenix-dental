export function createWhatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

export interface BookingMessageLabels {
  greeting: string
  service: string
  price: string
  dateTime: string
  patient: string
}

export interface BookingMessageValues {
  service: string
  price: string
  dateTime: string
  name: string
  phone: string
}

export function buildBookingMessage(labels: BookingMessageLabels, values: BookingMessageValues): string {
  return [
    labels.greeting,
    `📌 ${labels.service}: ${values.service}`,
    `💰 ${labels.price}: ${values.price}`,
    `📅 ${labels.dateTime}: ${values.dateTime}`,
    `👤 ${labels.patient}: ${values.name}, ${values.phone}`,
  ].join('\n')
}

export interface SosMessageLabels {
  title: string
  body: string
}

export function buildSosMessage(labels: SosMessageLabels): string {
  return [`🚨 ${labels.title}`, labels.body].join('\n')
}
