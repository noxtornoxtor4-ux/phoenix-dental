import { describe, expect, test } from 'bun:test'
import { createWhatsappUrl } from './whatsapp'

describe('createWhatsappUrl', () => {
  test('keeps only digits in the number and encodes the text', () => {
    const url = createWhatsappUrl('+996 504 314 134', 'Новая заявка с сайта!\n1. Жалоба: болит зуб')

    expect(url.startsWith('https://wa.me/996504314134?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Новая заявка с сайта!\n1. Жалоба: болит зуб')
  })
})
