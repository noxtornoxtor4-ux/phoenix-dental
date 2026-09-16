import { describe, expect, test } from 'bun:test'
import { formatLocalDigits, formatPhone, isValidLocalDigits, toE164, toInternational, toLocalDigits } from './phone'

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
