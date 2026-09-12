import { CalendarDays, Clock, Info, ListChecks, Phone, UserRound, Wallet } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'
import { formatLocalDigits, isValidLocalDigits, KG_COUNTRY_CODE, toLocalDigits } from '../../lib/phone'

interface StepContactsProps {
  name: string
  phoneDigits: string
  showErrors: boolean
  onNameChange: (name: string) => void
  onPhoneChange: (digits: string) => void
  summary: { service: string; dateTime: string; price: string; duration: string }
}

const inputClass =
  'h-14 w-full rounded-2xl border bg-white/5 pr-4 text-base outline-none transition placeholder:text-white/30 focus:border-accent focus:bg-white/10'

export function StepContacts({ name, phoneDigits, showErrors, onNameChange, onPhoneChange, summary }: StepContactsProps) {
  const { t } = useI18n()
  const nameInvalid = showErrors && name.trim() === ''
  const phoneInvalid = showErrors && !isValidLocalDigits(phoneDigits)

  const summaryRows = [
    { icon: ListChecks, value: summary.service },
    { icon: CalendarDays, value: summary.dateTime },
    { icon: Clock, value: summary.duration },
    { icon: Wallet, value: summary.price },
  ]

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-white/70">{t.booking.nameLabel}</span>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoComplete="name"
              enterKeyHint="next"
              placeholder={t.booking.namePlaceholder}
              aria-invalid={nameInvalid}
              className={`${inputClass} pl-12 ${nameInvalid ? 'border-sos' : 'border-white/10'}`}
            />
          </span>
          {nameInvalid && <span className="mt-1 block text-xs text-sos">{t.booking.nameError}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-white/70">{t.booking.phoneLabel}</span>
          <span className="relative block">
            <span className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center gap-2 text-white/60">
              <Phone className="size-5 text-white/40" />+{KG_COUNTRY_CODE}
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              enterKeyHint="done"
              value={formatLocalDigits(phoneDigits)}
              onChange={(event) => onPhoneChange(toLocalDigits(event.target.value))}
              placeholder="700 123 456"
              aria-invalid={phoneInvalid}
              className={`${inputClass} pl-[5.75rem] tracking-wide tabular-nums ${phoneInvalid ? 'border-sos' : 'border-white/10'}`}
            />
          </span>
          {phoneInvalid && <span className="mt-1 block text-xs text-sos">{t.booking.phoneError}</span>}
        </label>
      </div>

      <div className="rounded-3xl border border-accent/20 bg-accent/5 p-4">
        <p className="mb-3 text-sm font-semibold text-accent">{t.booking.summary}</p>
        <ul className="space-y-2.5 text-sm">
          {summaryRows.map(({ icon: Icon, value }) => (
            <li key={value} className="flex gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-white/40" />
              <span className="text-white/85">{value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex gap-2 text-xs text-white/50">
          <Info className="size-4 shrink-0" />
          {t.booking.confirmNote}
        </p>
      </div>
    </div>
  )
}
