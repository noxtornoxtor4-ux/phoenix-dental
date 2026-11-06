import { describe, expect, test } from 'bun:test'
import { ageOn, formatBirthInput, isValidBirthDate, parseBirthDate } from './patient'

const today = new Date(2026, 9, 30) // 30 October 2026

describe('formatBirthInput', () => {
  test('puts the dots in as the digits arrive', () => {
    expect(formatBirthInput('')).toBe('')
    expect(formatBirthInput('0')).toBe('0')
    expect(formatBirthInput('02')).toBe('02')
    expect(formatBirthInput('020')).toBe('02.0')
    expect(formatBirthInput('02032015')).toBe('02.03.2015')
  })

  test('ignores anything that is not a digit and stops at eight of them', () => {
    expect(formatBirthInput('02.03.2015')).toBe('02.03.2015')
    expect(formatBirthInput('02/03/2015')).toBe('02.03.2015')
    expect(formatBirthInput('020320159')).toBe('02.03.2015')
  })

  test('a backspace walks back through the dots', () => {
    expect(formatBirthInput('02.0')).toBe('02.0')
    expect(formatBirthInput('02.')).toBe('02')
  })
})

describe('parseBirthDate', () => {
  test('reads a finished date and refuses the rest', () => {
    expect(parseBirthDate('02.03.2015')).toEqual(new Date(2015, 2, 2))
    expect(parseBirthDate('02.03')).toBeNull()
    expect(parseBirthDate('30.02.2001')).toBeNull()
    expect(parseBirthDate('2015-03-02')).toBeNull()
  })
})

describe('ageOn', () => {
  test('counts full years and respects the birthday', () => {
    expect(ageOn('30.10.2000', today)).toBe(26)
    expect(ageOn('31.10.2000', today)).toBe(25)
    expect(ageOn('31.10.2008', today)).toBe(17)
  })

  test('rejects malformed, impossible and future dates', () => {
    expect(ageOn('', today)).toBeNull()
    expect(ageOn('2000-10-30', today)).toBeNull()
    expect(ageOn('30.02.2001', today)).toBeNull()
    expect(ageOn('01.01.2027', today)).toBeNull()
  })
})

describe('isValidBirthDate', () => {
  test('accepts a lifetime and turns down a typo', () => {
    expect(isValidBirthDate('15.05.1993', today)).toBe(true)
    expect(isValidBirthDate('15.05.993', today)).toBe(false)
    expect(isValidBirthDate('15.05.1823', today)).toBe(false)
    expect(isValidBirthDate('15.05.2027', today)).toBe(false)
  })
})
