export const KG_COUNTRY_CODE = '996'
const LOCAL_LENGTH = 9

/** Extracts the 9-digit local part from any user input: "+996 700…", "0700…", "700…". */
export function toLocalDigits(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith(KG_COUNTRY_CODE) && digits.length > LOCAL_LENGTH) {
    digits = digits.slice(KG_COUNTRY_CODE.length)
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, LOCAL_LENGTH)
}

/** "700123456" → "700 123 456" (works for partial input too). */
export function formatLocalDigits(digits: string): string {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean).join(' ')
}

export function isValidLocalDigits(digits: string): boolean {
  return new RegExp(`^\\d{${LOCAL_LENGTH}}$`).test(digits)
}

export function toInternational(digits: string): string {
  return `+${KG_COUNTRY_CODE} ${formatLocalDigits(digits)}`
}
