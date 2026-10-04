import { Check, Clock, Info } from 'lucide-react'
import { useState } from 'react'
import { clinic } from '../../config/clinic'
import { useI18n } from '../../i18n/useI18n'
import { formatDateTime, formatTime } from '../../lib/format'
import { getBookingDays, getDaySlots, getSlotStatus, hasAvailableSlot, withTime } from '../../lib/slots'
import { Calendar } from './Calendar'

interface StepScheduleProps {
  durationMinutes: number
  value: Date | null
  onChange: (slot: Date | null) => void
}

export function StepSchedule({ durationMinutes, value, onChange }: StepScheduleProps) {
  const { t } = useI18n()
  const { hours, booking } = clinic
  const [now] = useState(() => new Date())

  const options = {
    stepMinutes: booking.slotStepMinutes,
    leadMinutes: booking.leadMinutes,
    durationMinutes,
    now,
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + booking.horizonDays)

  const [day, setDay] = useState<Date | null>(() =>
    value
      ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
      : (getBookingDays(1, hours, options, booking.horizonDays)[0] ?? null),
  )
  const [time, setTime] = useState(() => (value ? formatTime(value) : ''))

  // The parent only receives a start that the clinic can actually accept.
  const pick = (nextDay: Date | null, nextTime: string) => {
    setDay(nextDay)
    setTime(nextTime)
    const start = nextDay ? withTime(nextDay, nextTime) : null
    onChange(start && getSlotStatus(start, hours, options) === 'available' ? start : null)
  }

  const slots = day ? getDaySlots(day, hours, options) : []
  const start = day ? withTime(day, time) : null
  const status = start ? getSlotStatus(start, hours, options) : null
  const error = status && status !== 'available' ? t.booking.timeErrors[status](hours.open, hours.close) : null

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white/70">{t.booking.dateTitle}</h3>
        <Calendar
          selected={day}
          today={today}
          lastDay={lastDay}
          isDisabled={(date) => date > lastDay || !hasAvailableSlot(date, hours, options)}
          onSelect={(date) => pick(date, time)}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white/70">{t.booking.timeTitle}</h3>
        {slots.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => {
              const active = slot.time === time
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  aria-pressed={active}
                  onClick={() => pick(day, slot.time)}
                  className={`h-11 rounded-xl border text-sm font-semibold tabular-nums transition active:scale-95 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent disabled:text-white/20 disabled:line-through ${
                    active
                      ? 'border-accent bg-accent text-ink-900 shadow-glow'
                      : 'border-white/10 bg-white/5 hover:border-accent/50'
                  }`}
                >
                  {slot.time}
                </button>
              )
            })}
          </div>
        )}

        <label className="mt-4 block">
          <span className="mb-1.5 flex items-center gap-2 text-sm text-white/70">
            <Clock className="size-4 text-accent" />
            {t.booking.customTime}
          </span>
          <input
            type="time"
            value={time}
            min={hours.open}
            max={hours.close}
            step={300}
            onChange={(event) => pick(day, event.target.value)}
            aria-invalid={Boolean(error)}
            className={`h-14 w-full rounded-2xl border bg-white/5 px-4 text-lg font-semibold tabular-nums [color-scheme:dark] outline-none transition focus:border-accent focus:bg-white/10 ${
              error ? 'border-sos' : 'border-white/10'
            }`}
          />
          {error && (
            <span role="alert" className="mt-1.5 block text-xs text-sos">
              {error}
            </span>
          )}
        </label>

        {value && (
          <p className="mt-4 flex animate-rise flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
            <Check className="size-4 shrink-0 text-accent" />
            <span className="text-white/60">{t.booking.chosen}:</span>
            <span className="font-semibold">{formatDateTime(value, t)}</span>
          </p>
        )}

        <p className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <Info className="size-4 shrink-0 text-accent" />
          {t.booking.confirmNote}
        </p>
      </div>
    </div>
  )
}
