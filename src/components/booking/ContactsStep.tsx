import { Cake, Info, Phone, UserRound, Users } from 'lucide-react'
import type { RequestForm } from '../../data/questionnaire'
import { useI18n } from '../../i18n/useI18n'
import { formatLocalDigits, KG_COUNTRY_CODE, toLocalDigits } from '../../lib/phone'
import { needsParent, type RequestErrors } from '../../lib/request'

interface ContactsStepProps {
  value: RequestForm
  errors: RequestErrors
  onChange: (value: RequestForm) => void
  summary: string[]
}

const inputClass =
  'h-14 w-full rounded-2xl border bg-white/5 pr-4 text-base outline-none transition [color-scheme:dark] placeholder:text-white/30 focus:border-accent focus:bg-white/10'

/** Step 3: who the request is from. */
export function ContactsStep({ value, errors, onChange, summary }: ContactsStepProps) {
  const { t } = useI18n()
  const set = <K extends keyof RequestForm>(key: K, next: RequestForm[K]) => onChange({ ...value, [key]: next })
  const withParent = needsParent(value, new Date())
  const border = (invalid: boolean | undefined) => (invalid ? 'border-sos' : 'border-white/10')

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-white/70">{t.booking.fullNameLabel}</span>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
            <input
              value={value.fullName}
              onChange={(event) => set('fullName', event.target.value)}
              autoComplete="name"
              enterKeyHint="next"
              maxLength={120}
              placeholder={t.booking.fullNamePlaceholder}
              aria-invalid={Boolean(errors.fullName)}
              className={`${inputClass} pl-12 ${border(errors.fullName)}`}
            />
          </span>
          {errors.fullName && <span className="mt-1 block text-xs text-sos">{t.booking.fullNameError}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-white/70">{t.booking.birthLabel}</span>
          <span className="relative block">
            <Cake className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
            <input
              type="date"
              value={value.birthDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => set('birthDate', event.target.value)}
              aria-invalid={Boolean(errors.birthDate)}
              className={`${inputClass} pl-12 ${border(errors.birthDate)}`}
            />
          </span>
          {errors.birthDate && <span className="mt-1 block text-xs text-sos">{t.booking.birthError}</span>}
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
              value={formatLocalDigits(value.phoneDigits)}
              onChange={(event) => set('phoneDigits', toLocalDigits(event.target.value))}
              placeholder="700 123 456"
              aria-invalid={Boolean(errors.phone)}
              className={`${inputClass} pl-[5.75rem] tracking-wide tabular-nums ${border(errors.phone)}`}
            />
          </span>
          {errors.phone && <span className="mt-1 block text-xs text-sos">{t.booking.phoneError}</span>}
        </label>

        {withParent && (
          <fieldset className="animate-rise space-y-3 rounded-2xl border border-accent/25 bg-accent/5 p-4">
            <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-accent">
              <Users className="size-4" />
              {t.booking.parentTitle}
            </legend>
            <p className="text-xs text-white/55">{t.booking.parentNote}</p>

            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">{t.booking.parentNameLabel}</span>
              <input
                value={value.parentName}
                onChange={(event) => set('parentName', event.target.value)}
                autoComplete="off"
                maxLength={120}
                aria-invalid={Boolean(errors.parentName)}
                className={`${inputClass} pl-4 ${border(errors.parentName)}`}
              />
              {errors.parentName && <span className="mt-1 block text-xs text-sos">{t.booking.parentNameError}</span>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-white/70">{t.booking.parentPhoneLabel}</span>
              <span className="relative block">
                <span className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center gap-2 text-white/60">
                  <Phone className="size-5 text-white/40" />+{KG_COUNTRY_CODE}
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  enterKeyHint="done"
                  value={formatLocalDigits(value.parentPhoneDigits)}
                  onChange={(event) => set('parentPhoneDigits', toLocalDigits(event.target.value))}
                  placeholder="700 123 456"
                  aria-invalid={Boolean(errors.parentPhone)}
                  className={`${inputClass} pl-[5.75rem] tracking-wide tabular-nums ${border(errors.parentPhone)}`}
                />
              </span>
              {errors.parentPhone && <span className="mt-1 block text-xs text-sos">{t.booking.parentPhoneError}</span>}
            </label>
          </fieldset>
        )}
      </div>

      <div className="rounded-3xl border border-accent/20 bg-accent/5 p-4 md:self-start">
        <p className="mb-3 text-sm font-semibold text-accent">{t.booking.summary}</p>
        <ul className="space-y-2 text-sm text-white/85">
          {summary.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/60" />
              <span className="min-w-0">{line}</span>
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
