import { CalendarDays } from 'lucide-react'
import type { AppointmentWithPatient } from '../../api/appointments'
import { addDays, formatWeekday } from '../../lib/dates'
import { isSameDay } from '../../../lib/format'
import type { Staff } from '../../types'
import { cardClass, EmptyState } from '../../ui/primitives'
import { AppointmentCard } from './AppointmentCard'

interface AgendaListProps {
  from: Date
  days: number
  staffById: Map<string, Staff>
  appointments: AppointmentWithPatient[]
  onAppointmentClick: (appointment: AppointmentWithPatient) => void
  onDayClick: (day: Date) => void
}

export function AgendaList({ from, days, staffById, appointments, onAppointmentClick, onDayClick }: AgendaListProps) {
  const dayList = Array.from({ length: days }, (_, index) => addDays(from, index))
  const today = new Date()

  if (appointments.length === 0) {
    return <EmptyState icon={CalendarDays} title="Записей нет" text="Нажмите «Записать», чтобы добавить приём." />
  }

  return (
    <div className="space-y-3">
      {dayList.map((day) => {
        const own = appointments.filter((appointment) => isSameDay(new Date(appointment.starts_at), day))
        if (own.length === 0 && days > 1) return null
        return (
          <section key={day.toISOString()} className={`${cardClass} p-3`}>
            <button
              type="button"
              onClick={() => onDayClick(day)}
              className={`mb-2 px-1 text-sm font-semibold capitalize hover:text-accent ${
                isSameDay(day, today) ? 'text-accent' : 'text-white/70'
              }`}
            >
              {formatWeekday(day)}
              <span className="ml-2 font-normal text-white/40">{own.length} зап.</span>
            </button>
            <ul className="space-y-2">
              {own.map((appointment) => {
                const doctor = staffById.get(appointment.doctor_id)
                return (
                  <li key={appointment.id} className="min-h-16">
                    <AppointmentCard
                      appointment={appointment}
                      doctorColor={doctor?.color ?? '#00E5FF'}
                      onClick={() => onAppointmentClick(appointment)}
                    />
                    {doctor && <p className="mt-1 px-1 text-[11px] text-white/40">{doctor.full_name}</p>}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
