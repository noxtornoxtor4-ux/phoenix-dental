import { Info } from 'lucide-react'
import { useState } from 'react'
import { clinic } from '../../config/clinic'
import { useI18n } from '../../i18n/useI18n'
import { isSameDay } from '../../lib/format'
import { getBookingDays, getDaySlots } from '../../lib/slots'

interface StepScheduleProps {
  durationMinutes: number
  value: Date | null
  onChange: (slot: Date) => void
}

export function StepSchedule({ durationMinutes, value, onChange }: StepScheduleProps) {
  const { t } = useI18n()
  const [now] = useState(() => new Date())
  const [pickedDay, setPickedDay] = useState<Date | null>(value)

  const options = {
    stepMinutes: clinic.booking.slotStepMinutes,
    leadMinutes: clinic.booking.leadMinutes,
    durationMinutes,
    now,
  }
  const days = getBookingDays(clinic.booking.daysShown, clinic.hours, options)
  const day = days.find((item) => pickedDay && isSameDay(item, pickedDay)) ?? days[0]
  const slots = day ? getDaySlots(day, clinic.hours, options) : []
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const dayName = (date: Date) => {
    if (isSameDay(date, now)) return t.booking.today
    if (isSameDay(date, tomorrow)) return t.booking.tomorrow
    return t.weekdaysShort[date.getDay()]
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white/70">{t.booking.dateTitle}</h3>
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
        {days.map((item) => {
          const active = day && isSameDay(item, day)
          return (
            <button
              key={item.getTime()}
              type="button"
              aria-pressed={Boolean(active)}
              onClick={() => setPickedDay(item)}
              className={`flex w-[4.5rem] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition active:scale-95 ${
                active ? 'border-accent bg-accent text-navy-900 shadow-glow' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className={`max-w-full truncate px-1 text-[11px] font-semibold ${active ? '' : 'text-white/55'}`}>
                {dayName(item)}
              </span>
              <span className="font-display text-xl font-bold">{item.getDate()}</span>
              <span className={`text-[11px] ${active ? '' : 'text-white/45'}`}>{t.months[item.getMonth()].slice(0, 3)}</span>
            </button>
          )
        })}
      </div>

      <h3 className="mt-5 mb-3 text-sm font-semibold text-white/70">{t.booking.timeTitle}</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {slots.map((slot) => {
          const active = value !== null && value.getTime() === slot.start.getTime()
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              aria-pressed={active}
              onClick={() => onChange(slot.start)}
              className={`h-11 rounded-xl border text-sm font-semibold tabular-nums transition active:scale-95 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent disabled:text-white/20 disabled:line-through ${
                active ? 'border-accent bg-accent text-navy-900 shadow-glow' : 'border-white/10 bg-white/5 hover:border-accent/50'
              }`}
            >
              {slot.time}
            </button>
          )
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-white/50">
        <Info className="size-4 shrink-0 text-accent" />
        {t.booking.confirmNote}
      </p>
    </div>
  )
}
