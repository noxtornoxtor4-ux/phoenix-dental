import { describe, expect, test } from 'bun:test'
import { buildBookingMessage, buildSosMessage, createWhatsappUrl } from './whatsapp'

const labels = {
  greeting: 'Здравствуйте! Хочу записаться в клинику PHOENIX (Каракол).',
  service: 'Услуга',
  price: 'Ориентир цены',
  dateTime: 'Дата и время',
  patient: 'Пациент',
  visitFirst: 'Первичный пациент',
  visitReturning: 'Повторный пациент',
  birth: 'Дата рождения',
  parent: 'Родитель',
}

const base = {
  service: 'Терапия',
  price: 'от 1 500 сом',
  dateTime: '15 сентября, 14:00',
  name: 'Айгерим',
  phone: '+996 700 123 456',
}

describe('whatsapp', () => {
  test('a returning patient gets a short message', () => {
    const message = buildBookingMessage(labels, { ...base, visitType: 'returning', birthDate: '', parent: '' })

    expect(message).toBe(
      [
        'Здравствуйте! Хочу записаться в клинику PHOENIX (Каракол).',
        '📌 Услуга: Терапия',
        '💰 Ориентир цены: от 1 500 сом',
        '📅 Дата и время: 15 сентября, 14:00',
        '👤 Пациент: Айгерим, +996 700 123 456',
        '🆕 Повторный пациент',
      ].join('\n'),
    )
  })

  test('a first visit adds the birth date, a child adds the parent', () => {
    const message = buildBookingMessage(labels, {
      ...base,
      name: 'Нурлан',
      visitType: 'first',
      birthDate: '2015-03-02',
      parent: 'Азамат, +996 555 112 233',
    })

    expect(message).toContain('🆕 Первичный пациент')
    expect(message).toContain('🎂 Дата рождения: 2015-03-02')
    expect(message).toContain('👪 Родитель: Азамат, +996 555 112 233')
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
