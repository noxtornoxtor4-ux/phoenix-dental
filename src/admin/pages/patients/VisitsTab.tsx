import { CalendarDays, CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { usePatientAppointments, type AppointmentWithPatient } from '../../api/appointments'
import { useStaffById } from '../../api/staff'
import { formatClock, formatDate } from '../../lib/dates'
import { appointmentStatuses } from '../../labels'
import type { Patient } from '../../types'
import { Button } from '../../ui/Button'
import { Badge, cardClass, EmptyState, ErrorState, LoadingBlock } from '../../ui/primitives'
import { AppointmentDetailsModal } from '../schedule/AppointmentDetailsModal'
import { AppointmentFormModal } from '../schedule/AppointmentFormModal'

export function VisitsTab({ patient }: { patient: Patient }) {
  const appointments = usePatientAppointments(patient.id)
  const staffById = useStaffById()
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<AppointmentWithPatient | null>(null)
  const [editing, setEditing] = useState<AppointmentWithPatient | null>(null)
  const [now] = useState(() => Date.now())

  if (appointments.isPending) return <LoadingBlock />
  if (appointments.isError) return <ErrorState error={appointments.error} onRetry={() => appointments.refetch()} />

  const upcoming = appointments.data.filter((item) => new Date(item.starts_at).getTime() >= now).reverse()
  const past = appointments.data.filter((item) => new Date(item.starts_at).getTime() < now)

  const renderList = (title: string, items: AppointmentWithPatient[]) =>
    items.length > 0 && (
      <section className={`${cardClass} overflow-hidden`}>
        <h3 className="border-b border-white/5 px-4 py-2.5 text-xs font-semibold text-white/50">{title}</h3>
        <ul className="divide-y divide-white/5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition hover:bg-white/5"
              >
                <span className="min-w-40 font-semibold">
                  {formatDate(item.starts_at)}, {formatClock(item.starts_at)}
                </span>
                <span className="flex-1 text-sm text-white/55">{staffById.get(item.doctor_id)?.full_name}</span>
                <Badge color={appointmentStatuses[item.status].color}>{appointmentStatuses[item.status].label}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </section>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" icon={CalendarPlus} onClick={() => setCreating(true)}>
          Записать на приём
        </Button>
      </div>

      {appointments.data.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Визитов пока нет" />
      ) : (
        <>
          {renderList('Предстоящие', upcoming)}
          {renderList('Прошедшие', past)}
        </>
      )}

      <AppointmentDetailsModal
        appointment={selected}
        onClose={() => setSelected(null)}
        onEdit={(item) => {
          setSelected(null)
          setEditing(item)
        }}
      />
      <AppointmentFormModal
        open={creating || editing !== null}
        appointment={editing ?? undefined}
        draft={creating ? { start: defaultStart(), doctorId: patient.doctor_id ?? undefined, patient } : undefined}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
      />
    </div>
  )
}

function defaultStart() {
  const tomorrow = new Date()
  return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1, 10, 0)
}
