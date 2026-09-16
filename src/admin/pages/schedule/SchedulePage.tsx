import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAppointments, type AppointmentWithPatient } from '../../api/appointments'
import { useStaff } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { addDays, formatDate, formatShortDate, startOfDay, startOfWeek, toDateInput } from '../../lib/dates'
import { useRealtimeInvalidation } from '../../lib/useRealtimeInvalidation'
import { appointmentStatuses } from '../../labels'
import { Button } from '../../ui/Button'
import { Input, Select } from '../../ui/Field'
import { ErrorState, LoadingBlock, PageHeader } from '../../ui/primitives'
import { AgendaList } from './AgendaList'
import { AppointmentDetailsModal } from './AppointmentDetailsModal'
import { AppointmentFormModal, type AppointmentDraft } from './AppointmentFormModal'
import { DayGrid } from './DayGrid'

type View = 'day' | 'week'

export function SchedulePage() {
  const { staff: me, isAdmin } = useAuth()
  const { data: staff = [] } = useStaff()
  const [view, setView] = useState<View>('day')
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()))
  const [doctorFilter, setDoctorFilter] = useState('')
  const [draft, setDraft] = useState<AppointmentDraft | null>(null)
  const [editing, setEditing] = useState<AppointmentWithPatient | null>(null)
  const [selected, setSelected] = useState<AppointmentWithPatient | null>(null)

  const from = view === 'day' ? anchor : startOfWeek(anchor)
  const days = view === 'day' ? 1 : 7
  const to = addDays(from, days)
  const appointments = useAppointments(from, to)
  useRealtimeInvalidation('appointments', ['appointments'])

  const visible = (appointments.data ?? []).filter((item) => !doctorFilter || item.doctor_id === doctorFilter)
  const staffById = new Map(staff.map((member) => [member.id, member]))
  const busyDoctorIds = new Set(visible.map((item) => item.doctor_id))
  const columns = isAdmin
    ? staff.filter(
        (member) =>
          (doctorFilter ? member.id === doctorFilter : member.active && member.role === 'doctor') ||
          busyDoctorIds.has(member.id),
      )
    : me
      ? [me]
      : []
  const active = visible.filter((item) => item.status !== 'cancelled' && item.status !== 'no_show')

  const shift = (direction: number) => setAnchor((current) => addDays(current, direction * days))
  const title =
    view === 'day' ? formatDate(anchor) : `${formatShortDate(from)} — ${formatShortDate(addDays(to, -1))}`

  return (
    <>
      <PageHeader
        title="Расписание"
        subtitle={appointments.isSuccess ? `${active.length} активных записей · ${title}` : title}
        actions={
          <Button variant="primary" icon={CalendarPlus} onClick={() => setDraft({ start: nextSlot(anchor) })}>
            Записать
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button size="icon" aria-label="Назад" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" className="h-10" onClick={() => setAnchor(startOfDay(new Date()))}>
            Сегодня
          </Button>
          <Button size="icon" aria-label="Вперёд" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Input
          type="date"
          aria-label="Дата"
          value={toDateInput(anchor)}
          onChange={(event) => event.target.value && setAnchor(startOfDay(new Date(`${event.target.value}T00:00:00`)))}
          className="h-10 w-auto"
        />
        <div className="flex rounded-xl bg-white/5 p-1">
          {(['day', 'week'] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                view === item ? 'bg-accent text-navy-900' : 'text-white/60 hover:text-white'
              }`}
            >
              {item === 'day' ? 'День' : 'Неделя'}
            </button>
          ))}
        </div>
        {isAdmin && (
          <Select
            aria-label="Врач"
            value={doctorFilter}
            onChange={(event) => setDoctorFilter(event.target.value)}
            className="h-10 w-auto min-w-44"
          >
            <option value="">Все врачи</option>
            {staff
              .filter((member) => member.active)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name || 'Без имени'}
                </option>
              ))}
          </Select>
        )}
      </div>

      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
        {Object.entries(appointmentStatuses).map(([key, tone]) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: tone.color }} />
            {tone.label}
          </li>
        ))}
      </ul>

      {appointments.isPending ? (
        <LoadingBlock />
      ) : appointments.isError ? (
        <ErrorState error={appointments.error} onRetry={() => appointments.refetch()} />
      ) : (
        <>
          {view === 'day' && columns.length > 0 && (
            <div className="hidden md:block">
              <DayGrid
                day={anchor}
                doctors={columns}
                appointments={visible}
                onSlotClick={(start, doctorId) => setDraft({ start, doctorId })}
                onAppointmentClick={setSelected}
              />
            </div>
          )}
          <div className={view === 'day' && columns.length > 0 ? 'md:hidden' : ''}>
            <AgendaList
              from={from}
              days={days}
              staffById={staffById}
              appointments={visible}
              onAppointmentClick={setSelected}
              onDayClick={(day) => {
                setAnchor(day)
                setView('day')
              }}
            />
          </div>
        </>
      )}

      <AppointmentDetailsModal
        appointment={selected}
        onClose={() => setSelected(null)}
        onEdit={(appointment) => {
          setSelected(null)
          setEditing(appointment)
        }}
      />
      <AppointmentFormModal
        open={draft !== null || editing !== null}
        draft={draft ?? undefined}
        appointment={editing ?? undefined}
        onClose={() => {
          setDraft(null)
          setEditing(null)
        }}
      />
    </>
  )
}

/** Next quarter hour for today, or 09:00 of another day. */
function nextSlot(day: Date): Date {
  const now = new Date()
  if (day.toDateString() !== now.toDateString()) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0)
  }
  const minutes = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 15) * 15
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes)
}
