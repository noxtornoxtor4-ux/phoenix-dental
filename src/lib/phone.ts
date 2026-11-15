export type PhoneCountryId =
  | 'KG'
  | 'KZ'
  | 'RU'
  | 'UZ'
  | 'TJ'
  | 'CN'
  | 'KR'
  | 'TR'
  | 'DE'
  | 'GB'
  | 'US'
  | 'OTHER'

export interface PhoneCountry {
  id: PhoneCountryId
  /** Calling code without "+"; empty for "other", where the code is typed with the number. */
  dial: string
  /** Allowed lengths of the number after the code. */
  min: number
  max: number
  /** How the number is spaced out: [3, 3, 3] → "700 123 456". */
  groups: number[]
  /** A real-looking number, shown as the placeholder. */
  example: string
  /** Home prefix no number starts with ("0"): dropped as soon as it is typed. */
  trunk?: string
  /** Home prefix numbers may also start with ("8" in Russia): dropped only once the input runs long. */
  longTrunk?: string
}

/** Kyrgyzstan first, then the neighbours and the usual visitors; anyone else picks "other". */
export const phoneCountries: PhoneCountry[] = [
  { id: 'KG', dial: '996', min: 9, max: 9, groups: [3, 3, 3], example: '700123456', trunk: '0' },
  { id: 'KZ', dial: '7', min: 10, max: 10, groups: [3, 3, 2, 2], example: '7011234567', longTrunk: '8' },
  { id: 'RU', dial: '7', min: 10, max: 10, groups: [3, 3, 2, 2], example: '9123456789', longTrunk: '8' },
  { id: 'UZ', dial: '998', min: 9, max: 9, groups: [2, 3, 2, 2], example: '901234567' },
  { id: 'TJ', dial: '992', min: 9, max: 9, groups: [2, 3, 2, 2], example: '931234567' },
  { id: 'CN', dial: '86', min: 11, max: 11, groups: [3, 4, 4], example: '13812345678' },
  { id: 'KR', dial: '82', min: 9, max: 10, groups: [2, 4, 4], example: '1012345678', trunk: '0' },
  { id: 'TR', dial: '90', min: 10, max: 10, groups: [3, 3, 2, 2], example: '5321234567', trunk: '0' },
  { id: 'DE', dial: '49', min: 7, max: 11, groups: [3, 4, 4], example: '15123456789', trunk: '0' },
  { id: 'GB', dial: '44', min: 10, max: 10, groups: [4, 3, 3], example: '7400123456', trunk: '0' },
  { id: 'US', dial: '1', min: 10, max: 10, groups: [3, 3, 4], example: '2025550123', trunk: '1' },
  // E.164 allows up to 15 digits for the code and the number together.
  { id: 'OTHER', dial: '', min: 8, max: 15, groups: [3, 3, 3, 3, 3], example: '' },
]

const KG = phoneCountries[0]

export const KG_COUNTRY_CODE = KG.dial

export function phoneCountry(id: PhoneCountryId): PhoneCountry {
  return phoneCountries.find((country) => country.id === id) ?? KG
}

/** The number after the code, from any way it is typed: "+996 700…", "0700…", "8 912…", "700…". */
export function toLocalDigits(input: string, country: PhoneCountry = KG): string {
  let digits = input.replace(/\D/g, '')
  const { dial, trunk, longTrunk, max } = country

  if (dial && digits.startsWith(dial) && digits.length > max) digits = digits.slice(dial.length)
  else if (trunk && digits.startsWith(trunk)) digits = digits.slice(trunk.length)
  else if (longTrunk && digits.startsWith(longTrunk) && digits.length > max) digits = digits.slice(longTrunk.length)

  return digits.slice(0, max)
}

/** "700123456" → "700 123 456", grouped the way the country writes it (partial input too). */
export function formatLocalDigits(digits: string, country: PhoneCountry = KG): string {
  const parts: string[] = []
  let rest = digits
  country.groups.forEach((size, index) => {
    // Whatever is left over joins the last group, for countries with longer numbers.
    const last = index === country.groups.length - 1
    const part = last ? rest : rest.slice(0, size)
    if (part) parts.push(part)
    rest = last ? '' : rest.slice(size)
  })
  return parts.join(' ')
}

export function isValidLocalDigits(digits: string, country: PhoneCountry = KG): boolean {
  return /^\d+$/.test(digits) && digits.length >= country.min && digits.length <= country.max
}

/** "+996 700 123 456"; a number typed under "other" already holds its code. */
export function toInternational(digits: string, country: PhoneCountry = KG): string {
  return country.dial ? `+${country.dial} ${formatLocalDigits(digits, country)}` : `+${digits}`
}

/** "700123456" → "+996700123456", the format phones are stored in. */
export function toE164(digits: string, country: PhoneCountry = KG): string {
  return `+${country.dial}${digits}`
}

/** "+996700123456" → "+996 700 123 456"; other formats are returned unchanged. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return ''
  const prefix = `+${KG.dial}`
  const local = value.startsWith(prefix) ? value.slice(prefix.length) : ''
  return isValidLocalDigits(local) ? toInternational(local) : value
}
