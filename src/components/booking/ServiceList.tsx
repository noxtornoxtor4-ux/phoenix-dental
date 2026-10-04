import { Check } from 'lucide-react'
import { listServices, type ServiceId } from '../../data/services'
import { useI18n } from '../../i18n/useI18n'
import { formatNumber } from '../../lib/format'
import { useServiceCatalog } from '../../pricing/ServiceCatalogContext'
import { serviceIcons } from './serviceIcons'

interface ServiceListProps {
  selected: ServiceId[]
  onToggle: (id: ServiceId) => void
}

export function ServiceList({ selected, onToggle }: ServiceListProps) {
  const { t } = useI18n()
  const services = useServiceCatalog()

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {listServices.map((id) => {
        const service = services[id]
        const Icon = serviceIcons[id]
        const active = selected.includes(id)
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(id)}
            className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition active:scale-[0.99] ${
              active ? 'border-accent/60 bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: `${service.color}26`, color: service.color }}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{t.services[id].name}</span>
              <span className="block text-xs text-white/55">{t.services[id].description}</span>
              <span className="mt-1 block text-xs font-semibold text-accent">
                {t.booking.priceFrom(formatNumber(service.priceFrom))} ·{' '}
                {service.scope === 'tooth' ? t.booking.perTooth : t.booking.perVisit}
              </span>
            </span>
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full border transition ${
                active ? 'border-accent bg-accent text-ink-900' : 'border-white/25'
              }`}
            >
              {active && <Check className="size-4" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
