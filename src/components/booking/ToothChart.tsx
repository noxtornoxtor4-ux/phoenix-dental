import { X } from 'lucide-react'
import { useState } from 'react'
import { services, type ServiceId } from '../../data/services'
import { teethByJaw, type Jaw, type ToothKind } from '../../data/teeth'
import { useI18n } from '../../i18n/useI18n'
import { layoutArch, type ArchGeometry, type ToothPlacement } from '../../lib/archLayout'
import type { ToothSelection } from '../../lib/booking'
import { ToothProblemSheet } from './ToothProblemSheet'

const VIEW_WIDTH = 340
const VIEW_HEIGHT = 256

const geometry: Record<Jaw, ArchGeometry> = {
  upper: { cx: 170, cy: 236, rx: 132, ry: 196, gap: 3, labelOffset: 11 },
  lower: { cx: 170, cy: 20, rx: 132, ry: 196, gap: 3, labelOffset: 11 },
}

const placements: Record<Jaw, ToothPlacement[]> = {
  upper: layoutArch(teethByJaw.upper, 'upper', geometry.upper),
  lower: layoutArch(teethByJaw.lower, 'lower', geometry.lower),
}

const jaws: Jaw[] = ['upper', 'lower']

// Corner radii relative to the tooth size: [along the arch, across it].
const cornerRadius: Record<ToothKind, [number, number]> = {
  incisor: [0.3, 0.45],
  canine: [0.5, 0.5],
  premolar: [0.45, 0.42],
  molar: [0.34, 0.34],
}

function fissurePath(kind: ToothKind, w: number, d: number): string | null {
  switch (kind) {
    case 'canine':
      return `M0 ${-d * 0.18}L0 ${d * 0.18}`
    case 'premolar':
      return `M${-w * 0.24} 0Q0 ${d * 0.12} ${w * 0.24} 0`
    case 'molar':
      return `M${-w * 0.3} ${-d * 0.04}Q0 ${d * 0.1} ${w * 0.3} ${-d * 0.04}M${-w * 0.02} ${-d * 0.3}Q${w * 0.08} 0 ${-w * 0.02} ${d * 0.3}`
    default:
      return null
  }
}

interface ArchProps {
  jaw: Jaw
  selection: ToothSelection
  onToothClick: (tooth: number) => void
  className: string
}

function Arch({ jaw, selection, onToothClick, className }: ArchProps) {
  const { t } = useI18n()
  const label = jaw === 'upper' ? t.booking.upperJaw : t.booking.lowerJaw
  const enamelId = `enamel-${jaw}`

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="group"
      aria-label={label}
      className={`mx-auto w-full max-w-[420px] touch-manipulation select-none ${className}`}
    >
      <defs>
        <linearGradient id={enamelId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#C9DDEA" />
        </linearGradient>
      </defs>

      <text
        x={VIEW_WIDTH / 2}
        y={jaw === 'upper' ? 150 : 106}
        textAnchor="middle"
        className="fill-white/35 text-[11px] font-semibold tracking-[0.15em] uppercase"
      >
        {label}
      </text>

      {placements[jaw].map((tooth) => {
        const problem = selection[tooth.number]
        const color = problem ? services[problem].color : undefined
        const [rx, ry] = cornerRadius[tooth.kind]
        const fissure = fissurePath(tooth.kind, tooth.width, tooth.depth)

        return (
          <g
            key={tooth.number}
            role="button"
            tabIndex={0}
            aria-pressed={Boolean(problem)}
            aria-label={`${t.booking.toothTitle(tooth.number)}${problem ? ` — ${t.problems[problem]}` : ''}`}
            onClick={() => onToothClick(tooth.number)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onToothClick(tooth.number)
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <g transform={`translate(${tooth.x} ${tooth.y}) rotate(${tooth.angle})`}>
              {/* Enlarged transparent hit area for comfortable taps. */}
              <rect
                x={-tooth.width / 2}
                y={-tooth.depth / 2 - 16}
                width={tooth.width}
                height={tooth.depth + 32}
                fill="transparent"
              />
              <rect
                x={-tooth.width / 2 + 1}
                y={-tooth.depth / 2}
                width={tooth.width - 2}
                height={tooth.depth}
                rx={tooth.width * rx}
                ry={tooth.depth * ry}
                fill={color ?? `url(#${enamelId})`}
                stroke={color ? '#FFFFFF' : 'rgb(255 255 255 / 0.35)'}
                strokeWidth={color ? 1.5 : 1}
                style={color ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
                className="transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:stroke-accent group-focus-visible:[stroke-width:3]"
              />
              {fissure && (
                <path
                  d={fissure}
                  fill="none"
                  stroke={color ? 'rgb(11 19 43 / 0.45)' : 'rgb(58 80 107 / 0.55)'}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
              )}
            </g>
            <text
              x={tooth.labelX}
              y={tooth.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              className={`text-[9px] font-bold transition-colors group-hover:fill-accent ${
                problem ? 'fill-white' : 'fill-white/40'
              }`}
            >
              {tooth.number}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

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

  const countOn = (jaw: Jaw) => placements[jaw].filter((tooth) => selection[tooth.number]).length

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
            <Arch
              key={jaw}
              jaw={jaw}
              selection={selection}
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
