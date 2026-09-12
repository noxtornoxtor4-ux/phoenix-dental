import { ChevronLeft, ChevronRight, ListChecks, MessageCircle, RotateCcw, ScanLine } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { clinic } from '../../config/clinic'
import type { ServiceId } from '../../data/services'
import { useI18n } from '../../i18n/useI18n'
import { buildEstimate, describeEstimate, type BookingSelection } from '../../lib/booking'
import { formatDateTime, formatDuration, formatNumber } from '../../lib/format'
import { isValidLocalDigits, toInternational } from '../../lib/phone'
import { buildBookingMessage, createWhatsappUrl } from '../../lib/whatsapp'
import { SectionHeading } from '../ui/SectionHeading'
import { EstimatePanel } from './EstimatePanel'
import { ServiceList } from './ServiceList'
import { StepContacts } from './StepContacts'
import { StepSchedule } from './StepSchedule'
import { Stepper } from './Stepper'
import { ToothChart } from './ToothChart'

type PickMode = 'chart' | 'list'

const emptySelection: BookingSelection = { teeth: {}, services: [] }
const LAST_STEP = 2

export function BookingSection() {
  const { t } = useI18n()
  const cardRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<PickMode>('chart')
  const [selection, setSelection] = useState<BookingSelection>(emptySelection)
  const [slot, setSlot] = useState<Date | null>(null)
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const estimate = useMemo(() => buildEstimate(selection), [selection])
  const visitMinutes = Math.min(estimate.durationMinutes, clinic.booking.maxVisitMinutes)
  const canContinue = step === 0 ? estimate.lines.length > 0 : step === 1 ? slot !== null : true

  // Any change of the treatment plan changes the visit length, so the chosen time must be picked again.
  const updateSelection = (update: (previous: BookingSelection) => BookingSelection) => {
    setSelection(update)
    setSlot(null)
  }

  const setToothProblem = (tooth: number, problem: ServiceId | null) =>
    updateSelection((previous) => {
      const teeth = { ...previous.teeth }
      if (problem) teeth[tooth] = problem
      else delete teeth[tooth]
      return { ...previous, teeth }
    })

  const toggleService = (id: ServiceId) =>
    updateSelection((previous) => ({
      ...previous,
      services: previous.services.includes(id)
        ? previous.services.filter((item) => item !== id)
        : [...previous.services, id],
    }))

  const goTo = (next: number) => {
    setStep(next)
    setShowErrors(false)
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const price = t.booking.priceFrom(formatNumber(estimate.priceFrom))
  const duration = formatDuration(estimate.durationMinutes, t.units)
  const dateTime = slot ? formatDateTime(slot, t) : ''
  const serviceText = describeEstimate(estimate, {
    tooth: t.toothLabel,
    problems: t.problems,
    services: Object.fromEntries(
      Object.entries(t.services).map(([id, service]) => [id, service.name]),
    ) as Record<ServiceId, string>,
  })

  const submit = () => {
    if (!slot || name.trim() === '' || !isValidLocalDigits(phoneDigits)) {
      setShowErrors(true)
      return
    }
    const text = buildBookingMessage(t.message, {
      service: serviceText,
      price,
      dateTime,
      name: name.trim(),
      phone: toInternational(phoneDigits),
    })
    window.open(createWhatsappUrl(clinic.whatsapp, text), '_blank', 'noopener,noreferrer')
  }

  const modes: { id: PickMode; label: string; icon: typeof ScanLine }[] = [
    { id: 'chart', label: t.booking.modeChart, icon: ScanLine },
    { id: 'list', label: t.booking.modeList, icon: ListChecks },
  ]

  return (
    <section id="booking" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <SectionHeading eyebrow={t.booking.eyebrow} title={t.booking.title} subtitle={t.booking.subtitle} />

      <div ref={cardRef} className="mt-8 grid scroll-mt-24 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="glass rounded-[2rem] p-4 sm:p-6">
          <Stepper steps={t.booking.steps} current={step} />

          <div key={step} className="mt-6 animate-rise">
            {step === 0 && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex flex-1 rounded-2xl bg-white/5 p-1 sm:flex-none">
                    {modes.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={mode === id}
                        onClick={() => setMode(id)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition sm:px-4 ${
                          mode === id ? 'bg-accent text-navy-900' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                  {estimate.lines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => updateSelection(() => emptySelection)}
                      aria-label={t.booking.clear}
                      className="ml-auto flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                    >
                      <RotateCcw className="size-4" />
                      <span className="hidden sm:inline">{t.booking.clear}</span>
                    </button>
                  )}
                </div>

                {mode === 'chart' ? (
                  <ToothChart selection={selection.teeth} onChange={setToothProblem} />
                ) : (
                  <ServiceList selected={selection.services} onToggle={toggleService} />
                )}
              </>
            )}

            {step === 1 && <StepSchedule durationMinutes={visitMinutes} value={slot} onChange={setSlot} />}

            {step === 2 && (
              <StepContacts
                name={name}
                phoneDigits={phoneDigits}
                showErrors={showErrors}
                onNameChange={setName}
                onPhoneChange={setPhoneDigits}
                summary={{ service: serviceText, dateTime, price, duration }}
              />
            )}
          </div>

          <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-10 mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-navy-800/95 p-2.5 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                aria-label={t.booking.back}
                className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 transition hover:bg-white/5 md:w-auto md:px-4"
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
                  className="flex h-12 shrink-0 items-center gap-1 rounded-xl bg-accent pr-3 pl-5 font-bold text-navy-900 shadow-glow transition hover:bg-accent-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                >
                  {t.booking.next}
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-sm font-bold whitespace-nowrap text-navy-950 shadow-[0_10px_30px_-8px_rgb(37_211_102/0.7)] transition active:scale-[0.98] sm:px-5 sm:text-base md:ml-auto md:flex-none"
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
