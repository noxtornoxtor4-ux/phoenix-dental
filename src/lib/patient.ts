/** Below this age the clinic needs a parent or guardian on the request. */
export const ADULT_AGE = 18

/** Past this age a date is a typo, not a birthday. */
const OLDEST_AGE = 120

/** Digits as they are typed become дд.мм.гггг: "02032015" → "02.03.2015". */
export function formatBirthInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter((part) => part !== '').join('.')
}

/** "02.03.2015" → that day; null while the date is unfinished or if it never existed. */
export function parseBirthDate(birthDate: string): Date | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(birthDate)
  if (!match) return null

  const [day, month, year] = match.slice(1).map(Number)
  const birth = new Date(year, month - 1, day)
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return null
  return birth
}

/** Full years between the birth date and `today`; null when the date is missing or impossible. */
export function ageOn(birthDate: string, today: Date): number | null {
  const birth = parseBirthDate(birthDate)
  if (!birth || birth > today) return null

  let age = today.getFullYear() - birth.getFullYear()
  const hadBirthday =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hadBirthday) age -= 1
  return age
}

/** A date the clinic can work with: a real day, already past, within a human lifetime. */
export function isValidBirthDate(birthDate: string, today: Date): boolean {
  const age = ageOn(birthDate, today)
  return age !== null && age <= OLDEST_AGE
}
