import { toothProblems, type ServiceId } from '../../data/services'
import { getToothKind } from '../../data/teeth'
import { useI18n } from '../../i18n/useI18n'
import { formatNumber } from '../../lib/format'
import { useServiceCatalog } from '../../pricing/ServiceCatalogContext'
import { Sheet } from '../ui/Sheet'
import { serviceIcons } from './serviceIcons'

interface ToothProblemSheetProps {
  tooth: number | null
  current: ServiceId | undefined
  onSelect: (problem: ServiceId | null) => void
  onClose: () => void
}

export function ToothProblemSheet({ tooth, current, onSelect, onClose }: ToothProblemSheetProps) {
  const { t } = useI18n()
  const services = useServiceCatalog()

  return (
    <Sheet
      open={tooth !== null}
      onClose={onClose}
      closeLabel={t.install.dismiss}
      title={
        tooth !== null && (
          <>
            {t.booking.toothTitle(tooth)}{' '}
            <span className="font-sans text-sm font-medium text-white/50">
              · {t.booking.toothKinds[getToothKind(tooth)]}
            </span>
          </>
        )
      }
    >
      <p className="mb-3 text-sm text-white/60">{t.booking.problemQuestion}</p>

      <div className="grid grid-cols-2 gap-2">
        {toothProblems.map((id) => {
          const service = services[id]
          const Icon = serviceIcons[id]
          const active = current === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(id)}
              style={active ? { boxShadow: `0 0 0 2px ${service.color}, 0 8px 24px -8px ${service.color}` } : undefined}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition last:odd:col-span-2 active:scale-[0.98] ${
                active ? 'border-transparent bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span
                className="grid size-9 place-items-center rounded-xl"
                style={{ backgroundColor: `${service.color}26`, color: service.color }}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-semibold">{t.problems[id]}</span>
              <span className="text-xs text-white/50">
                {t.booking.priceFrom(formatNumber(service.priceFrom))} ·{' '}
                {service.scope === 'tooth' ? t.booking.perTooth : t.booking.perVisit}
              </span>
            </button>
          )
        })}
      </div>

      {current && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-3 w-full rounded-2xl border border-white/10 py-3 text-sm text-white/70 transition hover:bg-white/5"
        >
          {t.booking.removeTooth}
        </button>
      )}
    </Sheet>
  )
}
