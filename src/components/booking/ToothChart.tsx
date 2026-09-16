import { X } from 'lucide-react'
import { useState } from 'react'
import { services, type ServiceId } from '../../data/services'
import type { Jaw } from '../../data/teeth'
import { useI18n } from '../../i18n/useI18n'
import type { ToothSelection } from '../../lib/booking'
import { archPlacements } from '../dental/archPlacements'
import { DentalArch } from '../dental/DentalArch'
import { ToothProblemSheet } from './ToothProblemSheet'

const jaws: Jaw[] = ['upper', 'lower']

interface ToothChartProps {
  selection: ToothSelection
  onChange: (tooth: number, problem: ServiceId | null) => void
}

export function ToothChart({ selection, onChange }: ToothChartProps) {
  const { t } = useI18n()
  const [activeJaw, setActiveJaw] = useState<Jaw>('upper')
  const [activeTooth, setActiveTooth] = useState<number | null>(null)

  const selectedTeeth = Object.entries(selection)
    .map(([tooth, problem]) => ({ tooth: Number(tooth), problem }))
    .sort((a, b) => a.tooth - b.tooth)

  const countOn = (jaw: Jaw) => archPlacements[jaw].filter((tooth) => selection[tooth.number]).length

  return (
    <div>
      <div className="mb-3 flex rounded-2xl bg-white/5 p-1 lg:hidden">
        {jaws.map((jaw) => {
          const count = countOn(jaw)
          return (
            <button
              key={jaw}
              type="button"
              aria-pressed={activeJaw === jaw}
              onClick={() => setActiveJaw(jaw)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
                activeJaw === jaw ? 'bg-white text-navy-900' : 'text-white/60'
              }`}
            >
              {jaw === 'upper' ? t.booking.upperJaw : t.booking.lowerJaw}
              {count > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-navy-900">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgb(0_229_255/0.1),transparent_65%)] px-2 py-4 sm:px-4">
        <p className="mb-2 text-center text-xs text-white/50">{t.booking.chartHint}</p>
        <div className="lg:space-y-2">
          {jaws.map((jaw) => (
            <DentalArch
              key={jaw}
              jaw={jaw}
              title={jaw === 'upper' ? t.booking.upperJaw : t.booking.lowerJaw}
              getAppearance={(tooth) => {
                const problem = selection[tooth]
                return {
                  color: problem ? services[problem].color : undefined,
                  label: `${t.booking.toothTitle(tooth)}${problem ? ` — ${t.problems[problem]}` : ''}`,
                }
              }}
              onToothClick={setActiveTooth}
              className={jaw === activeJaw ? 'block' : 'hidden lg:block'}
            />
          ))}
        </div>
      </div>

      {selectedTeeth.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={t.booking.selected}>
          {selectedTeeth.map(({ tooth, problem }) => (
            <li
              key={tooth}
              className="flex animate-rise items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pr-1 pl-3 text-xs"
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: services[problem].color }} />
              <button type="button" onClick={() => setActiveTooth(tooth)} className="font-semibold">
                {t.toothLabel(tooth)} · {t.problems[problem]}
              </button>
              <button
                type="button"
                onClick={() => onChange(tooth, null)}
                aria-label={`${t.booking.removeTooth}: ${t.booking.toothTitle(tooth)}`}
                className="grid size-7 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ToothProblemSheet
        tooth={activeTooth}
        current={activeTooth === null ? undefined : selection[activeTooth]}
        onClose={() => setActiveTooth(null)}
        onSelect={(problem) => {
          if (activeTooth !== null) onChange(activeTooth, problem)
          setActiveTooth(null)
        }}
      />
    </div>
  )
}
