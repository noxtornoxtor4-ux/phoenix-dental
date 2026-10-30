import { isValidLocalDigits } from './phone'

export type VisitType = 'first' | 'returning'

/** Below this age the clinic needs a parent or guardian on the request. */
export const ADULT_AGE = 18

export interface PatientForm {
  visitType: VisitType
  name: string
  phoneDigits: string
  /** First visit only, as "YYYY-MM-DD". */
  birthDate: string
  parentName: string
  parentPhoneDigits: string
}

export const emptyPatientForm: PatientForm = {
  visitType: 'returning',
  name: '',
  phoneDigits: '',
  birthDate: '',
  parentName: '',
  parentPhoneDigits: '',
}

export type PatientField = 'name' | 'phone' | 'birthDate' | 'parentName' | 'parentPhone'
export type PatientErrors = Partial<Record<PatientField, true>>

/** Full years between the birth date and `today`; null when the date is missing or impossible. */
export function ageOn(birthDate: string, today: Date): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!match) return null

  const [year, month, day] = match.slice(1).map(Number)
  const birth = new Date(year, month - 1, day)
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return null
  if (birth > today) return null

  let age = today.getFullYear() - year
  const hadBirthday =
    today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day)
  if (!hadBirthday) age -= 1
  return age
}

export function isMinor(form: PatientForm, today: Date): boolean {
  if (form.visitType !== 'first') return false
  const age = ageOn(form.birthDate, today)
  return age !== null && age < ADULT_AGE
}

/** Which fields still need attention; an empty object means the form can be sent. */
export function validatePatient(form: PatientForm, today: Date): PatientErrors {
  const errors: PatientErrors = {}
  if (form.name.trim() === '') errors.name = true
  if (!isValidLocalDigits(form.phoneDigits)) errors.phone = true

  if (form.visitType === 'first') {
    if (ageOn(form.birthDate, today) === null) errors.birthDate = true
    if (isMinor(form, today)) {
      if (form.parentName.trim() === '') errors.parentName = true
      if (!isValidLocalDigits(form.parentPhoneDigits)) errors.parentPhone = true
    }
  }

  return errors
}

export function hasErrors(errors: PatientErrors): boolean {
  return Object.keys(errors).length > 0
}

/** "2015-03-02" → "02.03.2015"; anything else is returned unchanged. */
export function formatBirthDate(birthDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  return match ? `${match[3]}.${match[2]}.${match[1]}` : birthDate
}
