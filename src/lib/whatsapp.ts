/** Opens a chat with the clinic, pre-filled with the request text. */
export function createWhatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}
