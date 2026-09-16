import { CalendarDays, Clock, MessageCircle, Pencil, Trash, TriangleAlert, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatPhone } from '../../../lib/phone'
import { createWhatsappUrl } from '../../../lib/whatsapp'
import { useDeleteAppointment, useSetAppointmentStatus, type AppointmentWithPatient } from '../../api/appointments'
import { useChairs } from '../../api/chairs'
import { useStaffById } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { formatClock, formatDate } from '../../lib/dates'
import { buildReminderMessage } from '../../lib/reminders'
import { appointmentStatuses } from '../../labels'
import type { AppointmentStatus } from '../../types'
import { Button } from '../../ui/Button'
import { buttonClass } from '../../ui/buttonStyles'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { Modal } from '../../ui/Modal'
import { Badge } from '../../ui/primitives'
import { useToast } from '../../ui/toastContext'

// The next logical steps offered as one-tap actions.
const nextStatuses: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'arrived', 'no_show', 'cancelled'],
  confirmed: ['arrived', 'no_show', 'cancelled'],
  arrived: ['completed', 'cancelled'],
  completed: [],
  no_show: ['scheduled'],
  cancelled: ['scheduled'],
}

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithPatient | null
  onClose: () => void
  onEdit: (appointment: AppointmentWithPatient) => void
}

export function AppointmentDetailsModal({ appointment, onClose, onEdit }: AppointmentDetailsModalProps) {
  const { isAdmin } = useAuth()
  const staffById = useStaffById()
  const { data: chairs = [] } = useChairs()
  const setStatus = useSetAppointmentStatus()
  const remove = useDeleteAppointment()
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)

  if (!appointment) return null

  const doctor = staffById.get(appointment.doctor_id)
  const chair = chairs.find((item) => item.id === appointment.chair_id)
  const status = appointmentStatuses[appointment.status]
  const patient = appointment.patient

  const changeStatus = async (next: AppointmentStatus) => {
    try {
      await setStatus.mutateAsync({ id: appointment.id, status: next })
      toast.success(`Статус: ${appointmentStatuses[next].label}`)
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <>
      <Modal open={!deleting} onClose={onClose} title="Запись на приём">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {patient ? (
                <Link
                  to={`/patients/${patient.id}`}
                  onClick={onClose}
                  className="block truncate font-display text-lg font-semibold hover:text-accent"
                >
                  {patient.full_name}
                </Link>
              ) : (
                <p className="font-display text-lg font-semibold">Пациент</p>
              )}
              {patient?.phone && <p className="text-sm text-white/55 tabular-nums">{formatPhone(patient.phone)}</p>}
            </div>
            <Badge color={status.color}>{status.label}</Badge>
          </div>

          {patient?.allergies && (
            <p className="flex gap-2 rounded-xl border border-sos/30 bg-sos/10 px-3 py-2 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-sos" />
              {patient.allergies}
            </p>
          )}

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <CalendarDays className="size-4 text-white/40" />
              {formatDate(appointment.starts_at)}
            </li>
            <li className="flex items-center gap-3">
              <Clock className="size-4 text-white/40" />
              {formatClock(appointment.starts_at)}–{formatClock(appointment.ends_at)}
              {chair && <span className="text-white/50">· {chair.name}</span>}
            </li>
            <li className="flex items-center gap-3">
              <UserRound className="size-4 text-white/40" />
              {doctor?.full_name || 'Врач'}
            </li>
          </ul>
          {appointment.note && <p className="rounded-xl bg-white/5 px-3 py-2 text-sm whitespace-pre-line">{appointment.note}</p>}

          {nextStatuses[appointment.status].length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-white/50">Отметить</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses[appointment.status].map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    onClick={() => changeStatus(next)}
                    disabled={setStatus.isPending}
                    style={{ color: appointmentStatuses[next].color }}
                  >
                    {appointmentStatuses[next].label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {patient?.phone && (
              <a
                href={createWhatsappUrl(patient.phone, buildReminderMessage(patient.full_name, appointment.starts_at))}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass('secondary', 'sm')}
              >
                <MessageCircle className="size-4 text-[#25D366]" />
                Напомнить
              </a>
            )}
            <Button size="sm" icon={Pencil} onClick={() => onEdit(appointment)}>
              Изменить
            </Button>
            {isAdmin && (
              <Button size="sm" variant="danger" icon={Trash} onClick={() => setDeleting(true)} className="ml-auto">
                Удалить
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting}
        title="Удалить запись?"
        confirmLabel="Удалить"
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await remove.mutateAsync(appointment.id)
          onClose()
        }}
      >
        Чтобы сохранить историю визитов, обычно лучше отметить запись как «Отменён».
      </ConfirmDialog>
    </>
  )
}
