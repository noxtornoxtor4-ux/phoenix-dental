import { ChevronDown, Phone } from 'lucide-react'
import { useId } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { formatLocalDigits, phoneCountries, phoneCountry, toLocalDigits, type PhoneCountryId } from '../../lib/phone'

export interface PhoneValue {
  country: PhoneCountryId
  digits: string
}

interface PhoneFieldProps {
  label: string
  value: PhoneValue
  /** Shown under the field; also marks it red. */
  error?: string
  autoComplete: string
  onChange: (value: PhoneValue) => void
}

/**
 * A phone number with its country code. The code is a native list laid over "+996 ▾",
 * so a phone opens its own picker while the field shows only the code.
 */
export function PhoneField({ label, value, error, autoComplete, onChange }: PhoneFieldProps) {
  const { t } = useI18n()
  const id = useId()
  const country = phoneCountry(value.country)

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-muted">
        {label}
      </label>

      <span
        className={`flex h-14 w-full items-center rounded-2xl border bg-field transition focus-within:border-accent focus-within:bg-card ${
          error ? 'border-sos' : 'border-line'
        }`}
      >
        <span className="relative flex h-full shrink-0 items-center gap-1.5 border-r border-line pr-2.5 pl-4 text-muted">
          <Phone className="size-5" />
          <span className="font-medium text-ink tabular-nums">+{country.dial}</span>
          <ChevronDown className="size-4" />
          <select
            value={value.country}
            onChange={(event) => {
              const next = phoneCountry(event.target.value as PhoneCountryId)
              onChange({ country: next.id, digits: value.digits.slice(0, next.max) })
            }}
            aria-label={t.booking.phoneCountryLabel}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {phoneCountries.map((option) => (
              <option key={option.id} value={option.id}>
                {t.booking.phoneCountries[option.id]}
                {option.dial ? ` (+${option.dial})` : ''}
              </option>
            ))}
          </select>
        </span>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          enterKeyHint="done"
          value={formatLocalDigits(value.digits, country)}
          onChange={(event) => onChange({ country: value.country, digits: toLocalDigits(event.target.value, country) })}
          placeholder={country.example ? formatLocalDigits(country.example, country) : t.booking.otherPhonePlaceholder}
          aria-invalid={Boolean(error)}
          className="h-full min-w-0 flex-1 bg-transparent pr-4 pl-3 text-base tracking-wide tabular-nums outline-none placeholder:text-muted"
        />
      </span>

      {error && <span className="mt-1 block text-xs text-sos">{error}</span>}
    </div>
  )
}
