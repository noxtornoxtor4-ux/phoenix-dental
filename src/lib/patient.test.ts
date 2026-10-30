import { describe, expect, test } from 'bun:test'
import {
  ageOn,
  emptyPatientForm,
  formatBirthDate,
  hasErrors,
  isMinor,
  validatePatient,
  type PatientForm,
} from './patient'

const today = new Date(2026, 9, 30) // 30 October 2026
const form = (patch: Partial<PatientForm>): PatientForm => ({ ...emptyPatientForm, ...patch })

describe('ageOn', () => {
  test('counts full years and respects the birthday', () => {
    expect(ageOn('2000-10-30', today)).toBe(26)
    expect(ageOn('2000-10-31', today)).toBe(25)
    expect(ageOn('2008-10-31', today)).toBe(17)
  })

  test('rejects malformed, impossible and future dates', () => {
    expect(ageOn('', today)).toBeNull()
    expect(ageOn('30.10.2000', today)).toBeNull()
    expect(ageOn('2001-02-30', today)).toBeNull()
    expect(ageOn('2027-01-01', today)).toBeNull()
  })
})

describe('formatBirthDate', () => {
  test('writes the date the way people read it', () => {
    expect(formatBirthDate('2015-03-02')).toBe('02.03.2015')
    expect(formatBirthDate('')).toBe('')
  })
})

describe('validatePatient', () => {
  test('a returning patient only gives a name and a phone', () => {
    expect(validatePatient(form({ visitType: 'returning', name: 'Айгерим', phoneDigits: '700123456' }), today)).toEqual({})
    expect(validatePatient(form({ visitType: 'returning', name: ' ', phoneDigits: '70012' }), today)).toEqual({
      name: true,
      phone: true,
    })
  })

  test('a first visit also needs a birth date', () => {
    const base = { visitType: 'first' as const, name: 'Айгерим', phoneDigits: '700123456' }
    expect(validatePatient(form({ ...base, birthDate: '1998-05-12' }), today)).toEqual({})
    expect(validatePatient(form({ ...base }), today)).toEqual({ birthDate: true })
  })

  test('a child needs a parent name and phone', () => {
    const child = {
      visitType: 'first' as const,
      name: 'Нурлан',
      phoneDigits: '700123456',
      birthDate: '2015-03-02',
    }
    expect(isMinor(form(child), today)).toBe(true)
    expect(validatePatient(form(child), today)).toEqual({ parentName: true, parentPhone: true })

    const withParent = form({ ...child, parentName: 'Азамат', parentPhoneDigits: '555112233' })
    expect(hasErrors(validatePatient(withParent, today))).toBe(false)
  })

  test('an adult on a first visit is not asked about parents', () => {
    const adult = form({ visitType: 'first', name: 'Айгерим', phoneDigits: '700123456', birthDate: '1990-01-01' })
    expect(isMinor(adult, today)).toBe(false)
    expect(validatePatient(adult, today)).toEqual({})
  })
})
