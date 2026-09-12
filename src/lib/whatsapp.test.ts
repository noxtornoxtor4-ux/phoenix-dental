import { describe, expect, test } from 'bun:test'
import { buildBookingMessage, buildSosMessage, createWhatsappUrl } from './whatsapp'

describe('whatsapp', () => {
  test('builds the booking message from the template', () => {
    const message = buildBookingMessage(
      {
        greeting: 'Здравствуйте! Хочу записаться в клинику PHOENIX (Каракол).',
        service: 'Услуга / Зуб',
        price: 'Ориентир цены',
        dateTime: 'Дата и время',
        patient: 'Пациент',
      },
      {
        service: '№36 — Кариес',
        price: 'от 1 500 сом',
        dateTime: '15 сентября, 14:00',
        name: 'Айгерим',
        phone: '+996 700 123 456',
      },
    )

    expect(message).toBe(
      [
        'Здравствуйте! Хочу записаться в клинику PHOENIX (Каракол).',
        '📌 Услуга / Зуб: №36 — Кариес',
        '💰 Ориентир цены: от 1 500 сом',
        '📅 Дата и время: 15 сентября, 14:00',
        '👤 Пациент: Айгерим, +996 700 123 456',
      ].join('\n'),
    )
  })

  test('builds the urgent message', () => {
    expect(buildSosMessage({ title: 'СРОЧНО: Острая боль', body: 'Нужна помощь' })).toBe(
      '🚨 СРОЧНО: Острая боль\nНужна помощь',
    )
  })

  test('creates an encoded wa.me link', () => {
    const url = createWhatsappUrl('+996 700 000 000', 'Привет 🚨\nтест')
    expect(url.startsWith('https://wa.me/996700000000?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Привет 🚨\nтест')
  })
})
