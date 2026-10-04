import { LoaderCircle, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { describeError } from '../lib/errors'
import { Button } from './Button'

export const cardClass = 'rounded-3xl border border-white/10 bg-white/[0.04]'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ color, backgroundColor: `${color}1f` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <LoaderCircle className={`size-6 animate-spin text-accent ${className}`} aria-label="Загрузка" />
}

export function LoadingBlock() {
  return (
    <div className="grid min-h-40 place-items-center">
      <Spinner />
    </div>
  )
}

export function FullScreenSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Spinner className="size-8" />
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className={`${cardClass} flex flex-col items-center px-6 py-12 text-center`}>
      <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent">
        <Icon className="size-7" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-white/50">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-sos/30 bg-sos/10 p-4 text-sm">
      <TriangleAlert className="size-5 shrink-0 text-sos" />
      <span className="flex-1">{describeError(error)}</span>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  )
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = '#DCA457',
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  hint?: ReactNode
  color?: string
}) {
  return (
    <div className={`${cardClass} p-4`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-white/55">
        <span className="grid size-8 place-items-center rounded-xl" style={{ color, backgroundColor: `${color}1f` }}>
          <Icon className="size-4" />
        </span>
        {label}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
  )
}
