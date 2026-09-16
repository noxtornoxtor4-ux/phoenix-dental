import { ClipboardList, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { useDeleteTreatment } from '../../api/medical'
import { useStaffById } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { formatDate, formatSom } from '../../lib/dates'
import type { Treatment } from '../../types'
import { Button } from '../../ui/Button'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { cardClass, EmptyState } from '../../ui/primitives'

interface TreatmentsTabProps {
  treatments: Treatment[]
  onAdd: () => void
}

function groupByDay(treatments: Treatment[]) {
  const groups = new Map<string, Treatment[]>()
  for (const treatment of treatments) {
    const key = formatDate(treatment.performed_at)
    groups.set(key, [...(groups.get(key) ?? []), treatment])
  }
  return [...groups.entries()]
}

export function TreatmentsTab({ treatments, onAdd }: TreatmentsTabProps) {
  const { isAdmin } = useAuth()
  const staffById = useStaffById()
  const remove = useDeleteTreatment()
  const [deleting, setDeleting] = useState<Treatment | null>(null)

  if (treatments.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Лечения пока не было"
        text="Добавляйте процедуры после приёма — они попадут в историю и в расчёт оплаты."
        action={
          <Button variant="primary" icon={Plus} onClick={onAdd}>
            Добавить лечение
          </Button>
        }
      />
    )
  }

  const billed = treatments.reduce((sum, treatment) => sum + treatment.total, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          Всего на сумму <span className="font-semibold text-white">{formatSom(billed)}</span>
        </p>
        <Button variant="primary" icon={Plus} onClick={onAdd}>
          Добавить лечение
        </Button>
      </div>

      {groupByDay(treatments).map(([day, items]) => (
        <section key={day} className={`${cardClass} overflow-hidden`}>
          <h3 className="border-b border-white/5 px-4 py-2.5 text-xs font-semibold text-white/50">{day}</h3>
          <ul className="divide-y divide-white/5">
            {items.map((treatment) => (
              <li key={treatment.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {treatment.tooth && (
                      <span className="mr-2 rounded-md bg-white/10 px-1.5 py-0.5 text-xs tabular-nums">
                        №{treatment.tooth}
                      </span>
                    )}
                    {treatment.title}
                  </p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {staffById.get(treatment.doctor_id)?.full_name ?? 'Врач'}
                    {treatment.quantity > 1 && ` · ${treatment.quantity} × ${formatSom(treatment.price)}`}
                    {treatment.discount > 0 && ` · скидка ${formatSom(treatment.discount)}`}
                  </p>
                  {treatment.note && <p className="mt-1 text-sm text-white/65">{treatment.note}</p>}
                </div>
                <span className="font-semibold whitespace-nowrap tabular-nums">{formatSom(treatment.total)}</span>
                {isAdmin && (
                  <Button size="icon" variant="ghost" aria-label="Удалить" onClick={() => setDeleting(treatment)}>
                    <Trash className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <ConfirmDialog
        open={deleting !== null}
        title="Удалить запись о лечении?"
        confirmLabel="Удалить"
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutateAsync(deleting!.id)}
      >
        «{deleting?.title}» на {deleting && formatSom(deleting.total)}. Сумма долга пациента пересчитается.
      </ConfirmDialog>
    </div>
  )
}
