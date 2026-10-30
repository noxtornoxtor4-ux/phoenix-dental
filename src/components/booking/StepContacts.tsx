import { CalendarDays, Cake, Clock, Info, ListChecks, Phone, UserRound, Users, Wallet } from 'lucide-react'
import { useI18n } from '../../i18n/useI18n'
import { isMinor, type PatientErrors, type PatientForm, type VisitType } from '../../lib/patient'
import { formatLocalDigits, KG_COUNTRY_CODE, toLocalDigits } from '../../lib/phone'

interface StepContactsProps {
  value: PatientForm
  errors: PatientErrors
  onChange: (value: PatientForm) => void
  summary: { service: string; dateTime: string; price: string; duration: string }
}

const inputClass =
  'h-14 w-full rounded-2xl border bg-white/5 pr-4 text-base outline-none transition [color-scheme:dark] placeholder:text-white/30 focus:border-accent focus:bg-white/10'

export function StepContacts({ value, errors, onChange, summary }: StepContactsProps) {
  const { t } = useI18n()
  const set = <K extends keyof PatientForm>(key: K, next: PatientForm[K]) => onChange({ ...value, [key]: next })
  const withParent = isMinor(value, new Date())

  const summaryRows = [
    { icon: ListChecks, value: summary.service },
    { icon: CalendarDays, value: summary.dateTime },
    { icon: Clock, value: summary.duration },
    { icon: Wallet, value: summary.price },
  ]

  const visitOptions: { id: VisitType; label: string; hint: string }[] = [
    { id: 'first', label: t.booking.visitFirst, hint: t.booking.visitFirstHint },
    { id: 'returning', label: t.booking.visitReturning, hint: t.booking.visitReturningHint },
  ]

  const border = (invalid: boolean | undefined) => (invalid ? 'border-sos' : 'border-white/10')

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm text-white/70">{t.booking.visitTitle}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {visitOptions.map((option) => {
              const active = value.visitType === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set('visitType', option.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                    active ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className={`block font-semibold ${active ? 'text-accent' : ''}`}>{option.label}</span>
                  <span className="mt-0.5 block text-xs text-white/50">{option.hint}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm text-white/70">{t.booking.nameLabel}</span>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
            <input
              value={value.name}
              onChange={(event) => set('name', event.target.value)}
              autoComplete="name"
              enterKeyHint="next"
              placeholder={t.booking.namePlaceholder}
              aria-invalid={Boolean(errors.name)}
              className={`${inputClass} pl-12 ${border(errors.name)}`}
            />
          </span>
          {errors.name && <span className="mt-1 block text-xs text-sos">{t.booking.nameError}</span>}
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
              enterKeyHint={value.visitType === 'first' ? 'next' : 'done'}
              value={formatLocalDigits(value.phoneDigits)}
              onChange={(event) => set('phoneDigits', toLocalDigits(event.target.value))}
              placeholder="700 123 456"
              aria-invalid={Boolean(errors.phone)}
              className={`${inputClass} pl-[5.75rem] tracking-wide tabular-nums ${border(errors.phone)}`}
            />
          </span>
          {errors.phone && <span className="mt-1 block text-xs text-sos">{t.booking.phoneError}</span>}
        </label>

        {value.visitType === 'first' && (
          <label className="block animate-rise">
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
        )}

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
        <ul className="space-y-2.5 text-sm">
          {summaryRows.map(({ icon: Icon, value: row }) => (
            <li key={row} className="flex gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-white/40" />
              <span className="text-white/85">{row}</span>
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
