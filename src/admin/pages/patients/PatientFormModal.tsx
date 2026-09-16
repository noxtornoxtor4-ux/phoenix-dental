import { Save, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { formatPhone, isValidLocalDigits, toE164, toLocalDigits } from '../../../lib/phone'
import { findPatientsByPhone, useSavePatient, type PatientInput } from '../../api/patients'
import { useStaff } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { patientSources } from '../../labels'
import type { Patient, PatientSource } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Input, Select, Textarea } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { PhoneInput } from '../../ui/PhoneInput'
import { useToast } from '../../ui/toastContext'

interface PatientFormModalProps {
  open: boolean
  patient?: Patient
  onClose: () => void
  onSaved?: (patient: Patient) => void
}

export function PatientFormModal(props: PatientFormModalProps) {
  // Remount on open so the form always starts from the current patient data.
  return props.open ? <PatientForm {...props} /> : null
}

function PatientForm({ patient, onClose, onSaved }: PatientFormModalProps) {
  const { staff: me, isAdmin } = useAuth()
  const { data: staff = [] } = useStaff()
  const save = useSavePatient()
  const toast = useToast()

  const [fullName, setFullName] = useState(patient?.full_name ?? '')
  const [phoneDigits, setPhoneDigits] = useState(toLocalDigits(patient?.phone ?? ''))
  const [birthDate, setBirthDate] = useState(patient?.birth_date ?? '')
  const [gender, setGender] = useState(patient?.gender ?? '')
  const [source, setSource] = useState<PatientSource>(patient?.source ?? 'walk_in')
  const [doctorId, setDoctorId] = useState(patient?.doctor_id ?? (isAdmin ? '' : (me?.id ?? '')))
  const [allergies, setAllergies] = useState(patient?.allergies ?? '')
  const [notes, setNotes] = useState(patient?.notes ?? '')
  const [showErrors, setShowErrors] = useState(false)
  const [duplicates, setDuplicates] = useState<Patient[]>([])

  const phoneInvalid = phoneDigits !== '' && !isValidLocalDigits(phoneDigits)
  const nameInvalid = fullName.trim() === ''
  const doctors = staff.filter((member) => member.active)

  const submit = async (event: FormEvent, skipDuplicateCheck = false) => {
    event.preventDefault()
    if (nameInvalid || phoneInvalid) {
      setShowErrors(true)
      return
    }

    const phone = phoneDigits ? toE164(phoneDigits) : null
    try {
      if (phone && !skipDuplicateCheck && phone !== patient?.phone) {
        const found = (await findPatientsByPhone(phone)).filter((item) => item.id !== patient?.id)
        if (found.length > 0) {
          setDuplicates(found)
          return
        }
      }

      const input: PatientInput = {
        full_name: fullName.trim(),
        phone,
        birth_date: birthDate || null,
        gender: gender === 'male' || gender === 'female' ? gender : null,
        source,
        doctor_id: isAdmin ? doctorId || null : (me?.id ?? null),
        allergies: allergies.trim() || null,
        notes: notes.trim() || null,
      }
      const saved = await save.mutateAsync({ id: patient?.id, input })
      toast.success(patient ? 'Данные пациента сохранены' : 'Пациент добавлен')
      onClose()
      onSaved?.(saved)
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <Modal open onClose={onClose} title={patient ? 'Редактировать пациента' : 'Новый пациент'} size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="ФИО *" error={showErrors && nameInvalid ? 'Укажите имя пациента' : null} className="sm:col-span-2">
          <Input autoFocus value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Телефон" error={showErrors && phoneInvalid ? 'Введите 9 цифр номера' : null}>
          <PhoneInput digits={phoneDigits} onChange={setPhoneDigits} invalid={showErrors && phoneInvalid} />
        </Field>
        <Field label="Дата рождения">
          <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </Field>
        <Field label="Пол">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Не указан</option>
            <option value="female">Женский</option>
            <option value="male">Мужской</option>
          </Select>
        </Field>
        <Field label="Откуда узнал о клинике">
          <Select value={source} onChange={(e) => setSource(e.target.value as PatientSource)}>
            {Object.entries(patientSources).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        {isAdmin && (
          <Field label="Лечащий врач" className="sm:col-span-2">
            <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Не назначен</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name || 'Без имени'}
                  {doctor.specialty ? ` — ${doctor.specialty}` : ''}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Аллергии и противопоказания" className="sm:col-span-2">
          <Textarea
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            maxLength={1000}
            className="min-h-16"
            placeholder="Например: лидокаин, пенициллин"
          />
        </Field>
        <Field label="Заметки" className="sm:col-span-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} />
        </Field>

        {duplicates.length > 0 && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm sm:col-span-2">
            <p className="flex items-center gap-2 font-semibold text-amber-300">
              <TriangleAlert className="size-4" />
              Пациент с таким номером уже есть
            </p>
            <ul className="mt-2 space-y-1">
              {duplicates.map((item) => (
                <li key={item.id}>
                  <Link to={`/patients/${item.id}`} onClick={onClose} className="text-accent hover:underline">
                    {item.full_name}
                  </Link>{' '}
                  <span className="text-white/50">{formatPhone(item.phone)}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" className="mt-3" onClick={(event) => submit(event, true)} loading={save.isPending}>
              Всё равно сохранить
            </Button>
          </div>
        )}

        <div className="sm:col-span-2">
          <ModalActions>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" icon={Save} loading={save.isPending}>
              Сохранить
            </Button>
          </ModalActions>
        </div>
      </form>
    </Modal>
  )
}
