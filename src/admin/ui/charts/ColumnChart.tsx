import { useState } from 'react'
import { formatCompact, niceTicks, type SeriesPoint } from '../../lib/analytics'
import { cardClass } from '../primitives'

interface ColumnChartProps {
  title: string
  subtitle?: string
  data: SeriesPoint[]
  formatValue: (value: number) => string
  /** Dims the previous render while a new period loads. */
  stale?: boolean
}

const PLOT_HEIGHT = 220
const MAX_X_LABELS = 7

/** Single-series column chart: one hue, hairline grid, per-column hover and focus readout, table view. */
export function ColumnChart({ title, subtitle, data, formatValue, stale = false }: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const [asTable, setAsTable] = useState(false)

  const ticks = niceTicks(Math.max(0, ...data.map((point) => point.value)))
  const top = ticks[ticks.length - 1] || 1
  const labelEvery = Math.max(1, Math.ceil(data.length / MAX_X_LABELS))
  const activePoint = active === null ? null : data[active]

  return (
    <section className={`${cardClass} p-5 transition-opacity ${stale ? 'opacity-60' : ''}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-white/45">{subtitle}</p>}
        </div>
        <button
          type="button"
          aria-pressed={asTable}
          onClick={() => setAsTable(!asTable)}
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          {asTable ? 'График' : 'Таблица'}
        </button>
      </div>

      {asTable ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {data.map((point) => (
                <tr key={point.key} className="border-b border-white/5 last:border-0">
                  <td className="py-1.5 text-white/60">{point.label}</td>
                  <td className="py-1.5 text-right font-semibold tabular-nums">{formatValue(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative w-12 shrink-0 text-right text-[11px] text-white/40 tabular-nums" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ bottom: `calc(${(tick / top) * 100}% - 0.5em)` }}>
                {formatCompact(tick)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: PLOT_HEIGHT }} onPointerLeave={() => setActive(null)}>
              {ticks.map((tick) => (
                <div
                  key={tick}
                  aria-hidden="true"
                  className="absolute inset-x-0 border-t border-white/[0.08]"
                  style={{ bottom: `${(tick / top) * 100}%` }}
                />
              ))}

              <div className="absolute inset-0 flex items-stretch gap-[2px]">
                {data.map((point, index) => (
                  <button
                    key={point.key}
                    type="button"
                    aria-label={`${point.label}: ${formatValue(point.value)}`}
                    onPointerEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="group relative flex min-w-0 flex-1 items-end justify-center outline-none"
                  >
                    {point.value > 0 && (
                      <span
                        className={`block w-full max-w-6 rounded-t-[4px] transition-colors ${
                          active === index ? 'bg-accent-300' : 'bg-accent'
                        } group-focus-visible:ring-2 group-focus-visible:ring-white`}
                        style={{ height: `${(point.value / top) * 100}%` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {activePoint && active !== null && (
                <div
                  role="status"
                  className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-ink-900/95 px-3 py-2 text-center whitespace-nowrap shadow-xl"
                  style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
                >
                  <p className="text-sm font-semibold tabular-nums">{formatValue(activePoint.value)}</p>
                  <p className="text-[11px] text-white/50">{activePoint.label}</p>
                </div>
              )}
            </div>

            <div className="mt-2 flex gap-[2px] text-[11px] text-white/40">
              {data.map((point, index) => (
                <span key={point.key} className="min-w-0 flex-1 text-center whitespace-nowrap">
                  {index % labelEvery === 0 ? point.label : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
