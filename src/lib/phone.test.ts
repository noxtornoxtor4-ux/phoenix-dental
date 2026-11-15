import { describe, expect, test } from 'bun:test'
import {
  formatLocalDigits,
  formatPhone,
  isValidLocalDigits,
  phoneCountry,
  toE164,
  toInternational,
  toLocalDigits,
} from './phone'

describe('phone', () => {
  test('extracts local digits from different input styles', () => {
    expect(toLocalDigits('+996 (700) 12-34-56')).toBe('700123456')
    expect(toLocalDigits('0700123456')).toBe('700123456')
    expect(toLocalDigits('700 123')).toBe('700123')
    expect(toLocalDigits('70012345678')).toBe('700123456')
  })

  test('formats partial and full numbers', () => {
    expect(formatLocalDigits('7001234')).toBe('700 123 4')
    expect(toInternational('700123456')).toBe('+996 700 123 456')
  })

  test('validates a complete number', () => {
    expect(isValidLocalDigits('700123456')).toBe(true)
    expect(isValidLocalDigits('70012345')).toBe(false)
  })

  test('stores numbers in E.164 and formats them back', () => {
    expect(toE164('700123456')).toBe('+996700123456')
    expect(formatPhone('+996700123456')).toBe('+996 700 123 456')
    expect(formatPhone('+77011234567')).toBe('+77011234567')
    expect(formatPhone(null)).toBe('')
  })
})

describe('phone numbers from other countries', () => {
  const russia = phoneCountry('RU')
  const kazakhstan = phoneCountry('KZ')
  const usa = phoneCountry('US')
  const other = phoneCountry('OTHER')

  test('drops the home prefix people type out of habit', () => {
    // "8" also starts Russian numbers, so it goes only once the input runs long.
    expect(toLocalDigits('8 912 345 67 89', russia)).toBe('9123456789')
    expect(toLocalDigits('812 345 67 89', russia)).toBe('8123456789')
    expect(toLocalDigits('+7 701 123 45 67', kazakhstan)).toBe('7011234567')
    expect(toLocalDigits('1 202 555 0123', usa)).toBe('2025550123')
  })

  test('groups each number the way its country writes it', () => {
    expect(formatLocalDigits('9123456789', russia)).toBe('912 345 67 89')
    expect(formatLocalDigits('2025550123', usa)).toBe('202 555 0123')
    expect(toInternational('9123456789', russia)).toBe('+7 912 345 67 89')
    expect(toE164('9123456789', russia)).toBe('+79123456789')
  })

  test('checks the length the country allows', () => {
    expect(isValidLocalDigits('9123456789', russia)).toBe(true)
    expect(isValidLocalDigits('912345678', russia)).toBe(false)
    expect(isValidLocalDigits('700123456', phoneCountry('KG'))).toBe(true)
  })

  test('an unlisted country is typed with its code', () => {
    expect(toLocalDigits('+351 912 345 678', other)).toBe('351912345678')
    expect(isValidLocalDigits('351912345678', other)).toBe(true)
    expect(isValidLocalDigits('3519', other)).toBe(false)
    expect(toInternational('351912345678', other)).toBe('+351912345678')
    expect(toE164('351912345678', other)).toBe('+351912345678')
  })
})
