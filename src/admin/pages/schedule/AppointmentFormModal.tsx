import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useChairs, useSaveAppointment, type AppointmentWithPatient } from '../../api/appointments'
import { useStaff } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { fromDateTimeInputs, toDateInput, toTimeInput } from '../../lib/dates'
import { appointmentStatuses } from '../../labels'
import type { AppointmentStatus, Patient } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Input, Select, Textarea } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { useToast } from '../../ui/toastContext'
import { PatientFormModal } from '../patients/PatientFormModal'
import { PatientPicker } from './PatientPicker'

const durations = [15, 30, 45, 60, 90, 120, 180]
const MINUTE = 60_000

export interface AppointmentDraft {
  start: Date
  doctorId?: string
  patient?: Pick<Patient, 'id' | 'full_name' | 'phone'>
  leadId?: string
  note?: string
}

interface AppointmentFormModalProps {
  open: boolean
  appointment?: AppointmentWithPatient
  draft?: AppointmentDraft
  onClose: () => void
  onSaved?: () => void
}

export function AppointmentFormModal(props: AppointmentFormModalProps) {
  return props.open ? <AppointmentForm {...props} /> : null
}

function AppointmentForm({ appointment, draft, onClose, onSaved }: AppointmentFormModalProps) {
  const { staff: me, isAdmin } = useAuth()
  const { data: staff = [] } = useStaff()
  const { data: chairs = [] } = useChairs()
  const save = useSaveAppointment()
  const toast = useToast()

  const initialStart = appointment ? new Date(appointment.starts_at) : (draft?.start ?? new Date())
  const initialDuration = appointment
    ? Math.round((new Date(appointment.ends_at).getTime() - initialStart.getTime()) / MINUTE)
    : 30

  const [patient, setPatient] = useState<Pick<Patient, 'id' | 'full_name' | 'phone'> | null>(
    appointment?.patient ?? draft?.patient ?? null,
  )
  const [doctorId, setDoctorId] = useState(appointment?.doctor_id ?? draft?.doctorId ?? (isAdmin ? '' : (me?.id ?? '')))
  const [chairId, setChairId] = useState(appointment?.chair_id ?? '')
  const [date, setDate] = useState(toDateInput(initialStart))
  const [time, setTime] = useState(toTimeInput(initialStart))
  const [duration, setDuration] = useState(String(initialDuration))
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status ?? 'scheduled')
  const [note, setNote] = useState(appointment?.note ?? draft?.note ?? '')
  const [showErrors, setShowErrors] = useState(false)
  const [creatingPatient, setCreatingPatient] = useState<string | null>(null)

  const start = fromDateTimeInputs(date, time)
  const minutes = Number(duration)
  const errors = {
    patient: patient ? null : 'Выберите пациента',
    doctor: doctorId ? null : 'Выберите врача',
    start: start ? null : 'Укажите дату и время',
    duration: minutes >= 5 && minutes <= 600 ? null : 'От 5 минут до 10 часов',
  }
  const durationOptions = durations.includes(minutes) || !minutes ? durations : [...durations, minutes].sort((a, b) => a - b)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(errors).some(Boolean) || !start || !patient) {
      setShowErrors(true)
      return
    }
    try {
      await save.mutateAsync({
        id: appointment?.id,
        input: {
          patient_id: patient.id,
          doctor_id: doctorId,
          chair_id: chairId || null,
          starts_at: start.toISOString(),
          ends_at: new Date(start.getTime() + minutes * MINUTE).toISOString(),
          status,
          note: note.trim() || null,
          lead_id: appointment?.lead_id ?? draft?.leadId ?? null,
        },
      })
      toast.success(appointment ? 'Запись обновлена' : 'Пациент записан')
      onClose()
      onSaved?.()
    } catch (error) {
      toast.error(error)
    }
  }

  const error = (key: keyof typeof errors) => (showErrors ? errors[key] : null)
  const doctors = staff.filter((member) => member.active)

  return (
    <>
      <Modal open={creatingPatient === null} onClose={onClose} title={appointment ? 'Изменить запись' : 'Новая запись'} size="lg">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Пациент *" error={error('patient')} className="sm:col-span-2">
            <PatientPicker
              value={patient}
              onChange={setPatient}
              onCreate={(prefill) => setCreatingPatient(prefill)}
              invalid={Boolean(error('patient'))}
            />
          </Field>
          {isAdmin && (
            <Field label="Врач *" error={error('doctor')}>
              <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Выберите врача</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name || 'Без имени'}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Кресло">
            <Select value={chairId} onChange={(e) => setChairId(e.target.value)}>
              <option value="">Не выбрано</option>
              {chairs
                .filter((chair) => chair.active || chair.id === chairId)
                .map((chair) => (
                  <option key={chair.id} value={chair.id}>
                    {chair.name}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Дата *" error={error('start')}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Время *">
            <Input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Длительность" error={error('duration')}>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              {durationOptions.map((value) => (
                <option key={value} value={value}>
                  {value < 60 ? `${value} мин` : `${Math.floor(value / 60)} ч${value % 60 ? ` ${value % 60} мин` : ''}`}
                </option>
              ))}
            </Select>
          </Field>
          {appointment && (
            <Field label="Статус">
              <Select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
                {Object.entries(appointmentStatuses).map(([value, tone]) => (
                  <option key={value} value={value}>
                    {tone.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Комментарий" className="sm:col-span-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              className="min-h-16"
              placeholder="Жалобы, план приёма"
            />
          </Field>
          <div className="sm:col-span-2">
            <ModalActions>
              <Button onClick={onClose}>Отмена</Button>
              <Button type="submit" variant="primary" icon={Save} loading={save.isPending}>
                {appointment ? 'Сохранить' : 'Записать'}
              </Button>
            </ModalActions>
          </div>
        </form>
      </Modal>

      <PatientFormModal
        open={creatingPatient !== null}
        onClose={() => setCreatingPatient(null)}
        onSaved={(created) => setPatient(created)}
      />
    </>
  )
}
