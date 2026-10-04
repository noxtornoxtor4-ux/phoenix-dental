import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { isSameDay } from '../../lib/format'
import { getMonthGrid } from '../../lib/slots'

interface CalendarProps {
  selected: Date | null
  today: Date
  lastDay: Date
  isDisabled: (date: Date) => boolean
  onSelect: (date: Date) => void
}

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

const navButtonClass =
  'grid size-10 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent'

export function Calendar({ selected, today, lastDay, isDisabled, onSelect }: CalendarProps) {
  const { t } = useI18n()
  const [view, setView] = useState(() => monthStart(selected ?? today))

  const firstMonth = monthStart(today)
  const lastMonth = monthStart(lastDay)
  const canGoBack = view > firstMonth
  const canGoForward = view < lastMonth
  // Clamped because quick repeated clicks can land before the buttons re-render as disabled.
  const shiftMonth = (delta: number) =>
    setView((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + delta, 1)
      if (next < firstMonth) return firstMonth
      if (next > lastMonth) return lastMonth
      return next
    })

  // Dictionaries list weekdays from Sunday; the grid starts on Monday.
  const weekdays = [...t.weekdaysShort.slice(1), t.weekdaysShort[0]]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label={t.booking.prevMonth}
          className={navButtonClass}
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-display text-sm font-semibold" aria-live="polite">
          {t.monthsNominative[view.getMonth()]} {view.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoForward}
          aria-label={t.booking.nextMonth}
          className={navButtonClass}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((weekday) => (
          <span key={weekday} className="py-1 text-center text-[11px] font-semibold text-white/40">
            {weekday}
          </span>
        ))}

        {getMonthGrid(view.getFullYear(), view.getMonth()).map((date, index) => {
          if (!date) return <span key={`pad-${index}`} />

          const active = selected !== null && isSameDay(date, selected)
          const isToday = isSameDay(date, today)
          return (
            <button
              key={date.getTime()}
              type="button"
              disabled={isDisabled(date)}
              aria-pressed={active}
              aria-label={t.formatDate(date.getDate(), t.months[date.getMonth()])}
              onClick={() => onSelect(date)}
              className={`h-11 rounded-xl text-sm font-semibold tabular-nums transition active:scale-95 disabled:cursor-not-allowed disabled:text-white/20 disabled:active:scale-100 ${
                active ? 'bg-accent text-ink-900 shadow-glow' : 'hover:bg-white/10 disabled:hover:bg-transparent'
              } ${isToday && !active ? 'ring-1 ring-accent/60 ring-inset' : ''}`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
