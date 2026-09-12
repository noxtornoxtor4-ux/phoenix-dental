const NBSP = ' '

/** 35000 → "35 000" with non-breaking spaces. */
export function formatNumber(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

export interface DurationUnits {
  hour: string
  minute: string
}

/** 90 → "1 ч 30 мин". */
export function formatDuration(minutes: number, units: DurationUnits): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}${NBSP}${units.hour}`)
  if (rest > 0 || hours === 0) parts.push(`${rest}${NBSP}${units.minute}`)
  return parts.join(' ')
}

export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}
