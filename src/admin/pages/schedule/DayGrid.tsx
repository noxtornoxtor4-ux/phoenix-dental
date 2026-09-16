import { useEffect, useState, type MouseEvent } from 'react'
import { clinic } from '../../../config/clinic'
import type { AppointmentWithPatient } from '../../api/appointments'
import { isSameDay } from '../../../lib/format'
import { assignLanes, gridBounds, minutesSinceMidnight, parseClock, snapMinutes } from '../../lib/scheduleLayout'
import type { Staff } from '../../types'
import { cardClass } from '../../ui/primitives'
import { AppointmentCard } from './AppointmentCard'

const PX_PER_MINUTE = 1.3
const MIN_BLOCK_PX = 34

interface DayGridProps {
  day: Date
  doctors: Staff[]
  appointments: AppointmentWithPatient[]
  onSlotClick: (start: Date, doctorId: string) => void
  onAppointmentClick: (appointment: AppointmentWithPatient) => void
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export function DayGrid({ day, doctors, appointments, onSlotClick, onAppointmentClick }: DayGridProps) {
  const now = useNow()
  const items = appointments.map((appointment) => ({
    appointment,
    start: minutesSinceMidnight(new Date(appointment.starts_at)),
    // Visits past midnight are clipped to the end of the day.
    end: isSameDay(new Date(appointment.ends_at), day) ? minutesSinceMidnight(new Date(appointment.ends_at)) : 24 * 60,
  }))
  const bounds = gridBounds(
    parseClock(clinic.hours.open),
    parseClock(clinic.hours.close),
    items.map(({ appointment, start, end }) => ({ id: appointment.id, start, end })),
  )
  const hours = Array.from({ length: (bounds.end - bounds.start) / 60 }, (_, index) => bounds.start + index * 60)
  const height = (bounds.end - bounds.start) * PX_PER_MINUTE
  const nowOffset = isSameDay(now, day) ? (minutesSinceMidnight(now) - bounds.start) * PX_PER_MINUTE : null

  const handleColumnClick = (event: MouseEvent<HTMLDivElement>, doctorId: string) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const minute = bounds.start + snapMinutes((event.clientY - rect.top) / PX_PER_MINUTE)
    onSlotClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minute), doctorId)
  }

  return (
    <div className={`${cardClass} overflow-x-auto`}>
      <div className="min-w-fit">
        <div className="sticky top-0 z-10 flex border-b border-white/10 bg-navy-900/95 backdrop-blur">
          <div className="w-14 shrink-0" />
          {doctors.map((doctor) => (
            <div key={doctor.id} className="flex min-w-48 flex-1 items-center gap-2 px-3 py-3 text-sm font-semibold">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: doctor.color }} />
              <span className="truncate">{doctor.full_name || 'Без имени'}</span>
            </div>
          ))}
        </div>

        <div className="relative flex" style={{ height }}>
          <div className="relative w-14 shrink-0">
            {hours.map((minute) => (
              <span
                key={minute}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-white/35 tabular-nums first:translate-y-0"
                style={{ top: (minute - bounds.start) * PX_PER_MINUTE }}
              >
                {String(minute / 60).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {doctors.map((doctor) => {
            const own = items.filter(({ appointment }) => appointment.doctor_id === doctor.id)
            const lanes = assignLanes(own.map(({ appointment, start, end }) => ({ id: appointment.id, start, end })))
            return (
              <div
                key={doctor.id}
                role="presentation"
                onClick={(event) => handleColumnClick(event, doctor.id)}
                className="relative min-w-48 flex-1 cursor-copy border-l border-white/5"
                style={{
                  backgroundImage: `repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.06) 0 1px, transparent 1px ${30 * PX_PER_MINUTE}px)`,
                }}
              >
                {own.map(({ appointment, start, end }) => {
                  const lane = lanes.get(appointment.id) ?? { lane: 0, lanes: 1 }
                  const blockHeight = Math.max((end - start) * PX_PER_MINUTE - 2, MIN_BLOCK_PX)
                  return (
                    <div
                      key={appointment.id}
                      className="absolute p-0.5"
                      style={{
                        top: (start - bounds.start) * PX_PER_MINUTE,
                        height: blockHeight,
                        left: `${(lane.lane / lane.lanes) * 100}%`,
                        width: `${100 / lane.lanes}%`,
                      }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        doctorColor={doctor.color}
                        compact={blockHeight < 60}
                        onClick={() => onAppointmentClick(appointment)}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}

          {nowOffset !== null && nowOffset >= 0 && nowOffset <= height && (
            <div className="pointer-events-none absolute right-0 left-14 z-[5] h-0.5 bg-sos" style={{ top: nowOffset }}>
              <span className="absolute -top-1 -left-1 size-2.5 rounded-full bg-sos" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
