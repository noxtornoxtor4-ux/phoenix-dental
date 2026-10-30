import { ChevronLeft, ChevronRight, MessageCircle, RotateCcw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { clinic } from '../../config/clinic'
import type { ServiceId } from '../../data/services'
import { dictionaries, type Dictionary } from '../../i18n/translations'
import { useI18n } from '../../i18n/useI18n'
import { buildEstimate, describeEstimate } from '../../lib/booking'
import { formatDateTime, formatDuration, formatNumber } from '../../lib/format'
import {
  emptyPatientForm,
  formatBirthDate,
  hasErrors,
  validatePatient,
  type PatientErrors,
  type PatientForm,
} from '../../lib/patient'
import { toE164, toInternational } from '../../lib/phone'
import { submitLead } from '../../lib/publicApi'
import { buildBookingMessage, createWhatsappUrl } from '../../lib/whatsapp'
import { useServiceCatalog } from '../../pricing/ServiceCatalogContext'
import { SectionHeading } from '../ui/SectionHeading'
import { EstimatePanel } from './EstimatePanel'
import { ServiceList } from './ServiceList'
import { StepContacts } from './StepContacts'
import { StepSchedule } from './StepSchedule'
import { Stepper } from './Stepper'

const LAST_STEP = 2

function serviceNames(dictionary: Dictionary): Record<ServiceId, string> {
  return Object.fromEntries(
    Object.entries(dictionary.services).map(([id, service]) => [id, service.name]),
  ) as Record<ServiceId, string>
}

export function BookingSection() {
  const { t, lang } = useI18n()
  const catalog = useServiceCatalog()
  const cardRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<ServiceId[]>([])
  const [slot, setSlot] = useState<Date | null>(null)
  const [patient, setPatient] = useState<PatientForm>(emptyPatientForm)
  const [errors, setErrors] = useState<PatientErrors>({})

  const estimate = useMemo(() => buildEstimate(selected, catalog), [selected, catalog])
  const visitMinutes = Math.min(estimate.durationMinutes, clinic.booking.maxVisitMinutes)
  const canContinue = step === 0 ? estimate.lines.length > 0 : step === 1 ? slot !== null : true

  // A different set of services changes the visit length, so the time has to be picked again.
  const updateServices = (update: (previous: ServiceId[]) => ServiceId[]) => {
    setSelected(update)
    setSlot(null)
  }

  const toggleService = (id: ServiceId) =>
    updateServices((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]))

  const goTo = (next: number) => {
    setStep(next)
    setErrors({})
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const price = t.booking.priceFrom(formatNumber(estimate.priceFrom))
  const duration = formatDuration(estimate.durationMinutes, t.units)
  const dateTime = slot ? formatDateTime(slot, t) : ''
  const serviceText = describeEstimate(estimate, serviceNames(t))

  const submit = () => {
    const found = validatePatient(patient, new Date())
    if (!slot || hasErrors(found)) {
      setErrors(found)
      return
    }

    const name = patient.name.trim()
    const phone = toE164(patient.phoneDigits)
    const parent =
      patient.parentName.trim() && patient.parentPhoneDigits
        ? `${patient.parentName.trim()}, ${toInternational(patient.parentPhoneDigits)}`
        : ''
    const details = {
      visitType: patient.visitType,
      birthDate: patient.visitType === 'first' ? formatBirthDate(patient.birthDate) : '',
      parent,
    }

    const text = buildBookingMessage(t.message, {
      service: serviceText,
      price,
      dateTime,
      name,
      phone: toInternational(patient.phoneDigits),
      ...details,
    })
    submitLead({
      kind: 'booking',
      name,
      phone,
      // Staff read requests in Russian regardless of the visitor's language.
      summary: [
        describeEstimate(estimate, serviceNames(dictionaries.ru)),
        patient.visitType === 'first' ? dictionaries.ru.message.visitFirst : dictionaries.ru.message.visitReturning,
        details.birthDate && `${dictionaries.ru.message.birth}: ${details.birthDate}`,
        parent && `${dictionaries.ru.message.parent}: ${parent}`,
      ]
        .filter(Boolean)
        .join(' · '),
      estimate: estimate.priceFrom,
      preferredAt: slot.toISOString(),
      lang,
    })
    window.open(createWhatsappUrl(clinic.whatsapp, text), '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="booking" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <SectionHeading eyebrow={t.booking.eyebrow} title={t.booking.title} subtitle={t.booking.subtitle} />

      <div ref={cardRef} className="mt-8 grid scroll-mt-24 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="glass rounded-[2rem] p-4 sm:p-6">
          <Stepper steps={t.booking.steps} current={step} />

          <div key={step} className="mt-6 animate-rise">
            {step === 0 && (
              <>
                {estimate.lines.length > 0 && (
                  <div className="mb-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => updateServices(() => [])}
                      className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                    >
                      <RotateCcw className="size-4" />
                      {t.booking.clear}
                    </button>
                  </div>
                )}
                <ServiceList selected={selected} onToggle={toggleService} />
              </>
            )}

            {step === 1 && <StepSchedule durationMinutes={visitMinutes} value={slot} onChange={setSlot} />}

            {step === 2 && (
              <StepContacts
                value={patient}
                errors={errors}
                onChange={(next) => {
                  setPatient(next)
                  setErrors({})
                }}
                summary={{ service: serviceText, dateTime, price, duration }}
              />
            )}
          </div>

          <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-10 mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-2.5 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                aria-label={t.booking.back}
                className="grid size-12 shrink-0 place-items-center rounded-full border border-white/10 transition hover:bg-white/5 md:w-auto md:px-4"
              >
                <span className="flex items-center gap-1">
                  <ChevronLeft className="size-5" />
                  <span className="hidden text-sm font-semibold md:inline">{t.booking.back}</span>
                </span>
              </button>
            )}

            {step < LAST_STEP ? (
              <>
                <div className="min-w-0 flex-1 lg:invisible" aria-live="polite">
                  <p className="truncate text-lg leading-tight font-extrabold text-accent tabular-nums">{price}</p>
                  <p className="truncate text-xs text-white/50">
                    {estimate.lines.length > 0 ? `${t.booking.duration}: ${duration}` : t.booking.empty}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  disabled={!canContinue}
                  className="flex h-12 shrink-0 items-center gap-1 rounded-full bg-accent pr-3 pl-5 font-bold text-ink-900 shadow-glow transition hover:bg-accent-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                >
                  {t.booking.next}
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 text-sm font-bold whitespace-nowrap text-ink-950 shadow-[0_10px_30px_-8px_rgb(37_211_102/0.7)] transition active:scale-[0.98] sm:px-5 sm:text-base md:ml-auto md:flex-none"
              >
                <MessageCircle className="size-5" />
                {t.booking.submit}
              </button>
            )}
          </div>
        </div>

        <EstimatePanel estimate={estimate} className="hidden lg:sticky lg:top-24 lg:block" />
      </div>
    </section>
  )
}
