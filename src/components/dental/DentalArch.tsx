import { useId } from 'react'
import type { Jaw, ToothKind } from '../../data/teeth'
import { ARCH_VIEW_HEIGHT as VIEW_HEIGHT, ARCH_VIEW_WIDTH as VIEW_WIDTH, archPlacements } from './archPlacements'

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

export interface ToothAppearance {
  /** Fill color of a marked tooth; unmarked teeth use the enamel gradient. */
  color?: string
  /** Rendered as a faded outline, e.g. a missing tooth. */
  muted?: boolean
  label: string
}

interface DentalArchProps {
  jaw: Jaw
  title: string
  getAppearance: (tooth: number) => ToothAppearance
  onToothClick: (tooth: number) => void
  className?: string
}

/** One jaw of the FDI chart drawn as an occlusal arch; every tooth is a button. */
export function DentalArch({ jaw, title, getAppearance, onToothClick, className = '' }: DentalArchProps) {
  const enamelId = `${useId()}-enamel`

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="group"
      aria-label={title}
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
        {title}
      </text>

      {archPlacements[jaw].map((tooth) => {
        const { color, muted = false, label } = getAppearance(tooth.number)
        const [rx, ry] = cornerRadius[tooth.kind]
        const fissure = fissurePath(tooth.kind, tooth.width, tooth.depth)
        const marked = Boolean(color) && !muted

        return (
          <g
            key={tooth.number}
            role="button"
            tabIndex={0}
            aria-pressed={Boolean(color)}
            aria-label={label}
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
                fill={muted ? 'transparent' : (color ?? `url(#${enamelId})`)}
                stroke={muted ? 'rgb(255 255 255 / 0.35)' : marked ? '#FFFFFF' : 'rgb(255 255 255 / 0.35)'}
                strokeWidth={marked ? 1.5 : 1}
                strokeDasharray={muted ? '3 3' : undefined}
                style={marked ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
                className="transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:stroke-accent group-focus-visible:[stroke-width:3]"
              />
              {fissure && !muted && (
                <path
                  d={fissure}
                  fill="none"
                  stroke={marked ? 'rgb(11 19 43 / 0.45)' : 'rgb(58 80 107 / 0.55)'}
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
                marked ? 'fill-white' : 'fill-white/40'
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
