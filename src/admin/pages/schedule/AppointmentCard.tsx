import type { AppointmentWithPatient } from '../../api/appointments'
import { formatClock } from '../../lib/dates'
import { appointmentStatuses } from '../../labels'

interface AppointmentCardProps {
  appointment: AppointmentWithPatient
  doctorColor: string
  compact?: boolean
  onClick: () => void
}

const inactive = new Set(['cancelled', 'no_show'])

/** Colored block used in the day grid and the agenda list. */
export function AppointmentCard({ appointment, doctorColor, compact = false, onClick }: AppointmentCardProps) {
  const status = appointmentStatuses[appointment.status]
  const faded = inactive.has(appointment.status)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={`group flex size-full min-h-0 flex-col overflow-hidden rounded-xl border-l-4 bg-navy-700/90 px-2.5 py-1.5 text-left text-xs shadow-lg shadow-black/20 transition hover:brightness-125 ${
        faded ? 'opacity-45' : ''
      }`}
      style={{ borderLeftColor: doctorColor, backgroundImage: `linear-gradient(90deg, ${doctorColor}26, transparent)` }}
    >
      <span className="flex items-center gap-1.5 font-semibold tabular-nums">
        <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: status.color }} title={status.label} />
        {formatClock(appointment.starts_at)}–{formatClock(appointment.ends_at)}
      </span>
      <span className={`truncate font-semibold text-white ${faded ? 'line-through' : ''}`}>
        {appointment.patient?.full_name ?? 'Пациент'}
      </span>
      {!compact && appointment.note && <span className="truncate text-white/50">{appointment.note}</span>}
    </button>
  )
}
