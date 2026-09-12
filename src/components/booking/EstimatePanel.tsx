import { Clock, Info, Wallet } from 'lucide-react'
import { clinic } from '../../config/clinic'
import { services } from '../../data/services'
import { useI18n } from '../../i18n/useI18n'
import type { Estimate } from '../../lib/booking'
import { formatDuration, formatNumber } from '../../lib/format'

interface EstimatePanelProps {
  estimate: Estimate
  className?: string
}

export function EstimatePanel({ estimate, className = '' }: EstimatePanelProps) {
  const { t } = useI18n()

  return (
    <aside className={`glass rounded-[2rem] p-5 ${className}`} aria-live="polite">
      <p className="flex items-center gap-2 text-sm font-semibold text-white/70">
        <Wallet className="size-4 text-accent" />
        {t.booking.estimate}
      </p>

      {estimate.lines.length === 0 ? (
        <p className="mt-4 text-sm text-white/45">{t.booking.empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {estimate.lines.map((line) => (
            <li key={line.serviceId} className="flex animate-rise items-start justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-start gap-2">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: services[line.serviceId].color }}
                />
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {line.teeth.length > 0 ? t.problems[line.serviceId] : t.services[line.serviceId].name}
                  </span>
                  {line.teeth.length > 0 && (
                    <span className="block text-xs text-white/50">
                      {line.teeth.map((tooth) => t.toothLabel(tooth)).join(', ')}
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{formatNumber(line.price)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/60">{t.booking.duration}</span>
          <span className="flex items-center gap-1.5 font-semibold">
            <Clock className="size-4 text-accent" />
            {formatDuration(estimate.durationMinutes, t.units)}
          </span>
        </div>
        <div className="pt-1">
          <span className="block text-white/60">{t.message.price}</span>
          <span className="mt-1 block font-display text-2xl font-bold whitespace-nowrap text-accent tabular-nums">
            {t.booking.priceFrom(formatNumber(estimate.priceFrom))}
          </span>
        </div>
      </div>

      {estimate.durationMinutes > clinic.booking.maxVisitMinutes && (
        <p className="mt-3 flex gap-2 text-xs text-amber-300">
          <Info className="size-4 shrink-0" />
          {t.booking.visitsNote}
        </p>
      )}
      <p className="mt-3 text-[11px] leading-relaxed text-white/40">{t.booking.disclaimer}</p>
    </aside>
  )
}
