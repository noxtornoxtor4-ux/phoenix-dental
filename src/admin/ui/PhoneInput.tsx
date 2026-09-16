import { Phone } from 'lucide-react'
import { formatLocalDigits, KG_COUNTRY_CODE, toLocalDigits } from '../../lib/phone'
import { controlClass } from './Field'

interface PhoneInputProps {
  /** Local 9-digit part of a Kyrgyz number. */
  digits: string
  onChange: (digits: string) => void
  invalid?: boolean
}

export function PhoneInput({ digits, onChange, invalid = false }: PhoneInputProps) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 items-center gap-2 text-sm text-white/55">
        <Phone className="size-4 text-white/35" />+{KG_COUNTRY_CODE}
      </span>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="off"
        value={formatLocalDigits(digits)}
        onChange={(event) => onChange(toLocalDigits(event.target.value))}
        placeholder="700 123 456"
        aria-invalid={invalid}
        className={`h-11 pl-[4.75rem] tabular-nums ${controlClass} ${invalid ? 'border-sos' : ''}`}
      />
    </span>
  )
}
