import type { ReactNode } from 'react'

export interface BarListItem {
  key: string
  label: ReactNode
  value: number
  /** Secondary text under the value, e.g. a count. */
  hint?: string
  /** Mark color; defaults to the accent. Text always stays in text colors. */
  color?: string
  /** Small identity dot before the label. */
  dotColor?: string
}

interface BarListProps {
  items: BarListItem[]
  formatValue: (value: number) => string
  empty?: string
}

/** Horizontal bars for comparing magnitudes across named categories; every value is labeled. */
export function BarList({ items, formatValue, empty = 'Нет данных' }: BarListProps) {
  if (items.length === 0) return <p className="text-sm text-white/45">{empty}</p>

  const max = Math.max(...items.map((item) => item.value), 0)

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-white/75">
              {item.dotColor && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.dotColor }} />}
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="font-semibold tabular-nums">{formatValue(item.value)}</span>
              {item.hint && <span className="ml-1.5 text-xs text-white/40">{item.hint}</span>}
            </span>
          </div>
          <div className="h-2.5">
            {item.value > 0 && (
              <div
                className="h-full min-w-1 rounded-r-[4px]"
                style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%`, backgroundColor: item.color ?? 'var(--color-accent)' }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
