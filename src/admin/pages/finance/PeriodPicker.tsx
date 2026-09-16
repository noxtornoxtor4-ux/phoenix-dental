import { addDays, startOfDay, toDateInput } from '../../lib/dates'
import type { PeriodPreset } from '../../lib/finance'
import type { PeriodState } from './usePeriod'
import { Input } from '../../ui/Field'

const presets: { id: PeriodPreset; label: string }[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'custom', label: 'Период' },
]

const parseDay = (value: string) => startOfDay(new Date(`${value}T00:00:00`))

export function PeriodPicker({ state }: { state: PeriodState }) {
  const { preset, setPreset, custom, setCustom, period } = state

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-xl bg-white/5 p-1">
        {presets.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={preset === item.id}
            onClick={() => {
              if (item.id === 'custom') setCustom(period)
              setPreset(item.id)
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              preset === item.id ? 'bg-accent text-navy-900' : 'text-white/60 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Input
            type="date"
            aria-label="С"
            value={toDateInput(custom.from)}
            onChange={(e) => e.target.value && setCustom({ ...custom, from: parseDay(e.target.value) })}
            className="h-10 w-auto"
          />
          —
          <Input
            type="date"
            aria-label="По"
            value={toDateInput(addDays(custom.to, -1))}
            onChange={(e) => e.target.value && setCustom({ ...custom, to: addDays(parseDay(e.target.value), 1) })}
            className="h-10 w-auto"
          />
        </div>
      )}
    </div>
  )
}
