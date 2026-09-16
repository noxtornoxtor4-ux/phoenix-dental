import { describe, expect, test } from 'bun:test'
import { buildPatientSearchFilter } from './patientSearch'

describe('buildPatientSearchFilter', () => {
  test('searches by name', () => {
    expect(buildPatientSearchFilter('  Айгерим  ')).toBe('full_name.ilike."*Айгерим*"')
  })

  test('adds a phone filter for digits, ignoring the leading zero', () => {
    expect(buildPatientSearchFilter('0700 12')).toBe('full_name.ilike."*0700 12*",phone.ilike."*70012*"')
  })

  test('strips characters that break the PostgREST filter syntax', () => {
    expect(buildPatientSearchFilter('Иван,(Петров)*')).toBe('full_name.ilike."*Иван Петров*"')
    expect(buildPatientSearchFilter('%,()')).toBeNull()
  })
})
