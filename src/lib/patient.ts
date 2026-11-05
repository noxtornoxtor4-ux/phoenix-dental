/** Below this age the clinic needs a parent or guardian on the request. */
export const ADULT_AGE = 18

/** Full years between the birth date and `today`; null when the date is missing or impossible. */
export function ageOn(birthDate: string, today: Date): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!match) return null

  const [year, month, day] = match.slice(1).map(Number)
  const birth = new Date(year, month - 1, day)
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return null
  if (birth > today) return null

  let age = today.getFullYear() - year
  const hadBirthday = today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day)
  if (!hadBirthday) age -= 1
  return age
}

/** "2015-03-02" → "02.03.2015"; anything else is returned unchanged. */
export function formatBirthDate(birthDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  return match ? `${match[3]}.${match[2]}.${match[1]}` : birthDate
}
