import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreateTreatment } from '../../api/medical'
import { useServices } from '../../api/services'
import { useStaff } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { formatSom, toDateInput } from '../../lib/dates'
import { serviceCategories } from '../../labels'
import type { Patient, ServiceCategory } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Input, Select, Textarea } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { useToast } from '../../ui/toastContext'
import { toothOptionGroups } from './toothOptions'

interface TreatmentFormModalProps {
  open: boolean
  patient: Patient
  defaultTooth?: number | null
  appointmentId?: string | null
  onClose: () => void
}

export function TreatmentFormModal(props: TreatmentFormModalProps) {
  return props.open ? <TreatmentForm {...props} /> : null
}

/** Noon keeps the chosen calendar day stable across time zones; today keeps the real time. */
function performedAtFrom(date: string): string {
  const today = toDateInput(new Date())
  if (date === today) return new Date().toISOString()
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 12).toISOString()
}

function TreatmentForm({ patient, defaultTooth = null, appointmentId = null, onClose }: TreatmentFormModalProps) {
  const { staff: me, isAdmin } = useAuth()
  const { data: services = [] } = useServices()
  const { data: staff = [] } = useStaff()
  const create = useCreateTreatment()
  const toast = useToast()

  const [serviceId, setServiceId] = useState('')
  const [title, setTitle] = useState('')
  const [tooth, setTooth] = useState(defaultTooth ? String(defaultTooth) : '')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('0')
  const [date, setDate] = useState(toDateInput(new Date()))
  const [doctorId, setDoctorId] = useState(
    isAdmin ? (patient.doctor_id ?? me?.id ?? '') : (me?.id ?? ''),
  )
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const qty = Math.max(1, Math.floor(Number(quantity) || 0))
  const unitPrice = Number(price) || 0
  const discountValue = Number(discount) || 0
  const subtotal = unitPrice * qty
  const total = subtotal - discountValue
  const activeServices = services.filter((service) => service.active)
  const categories = [...new Set(activeServices.map((service) => service.category))] as ServiceCategory[]

  const errors = {
    title: title.trim() === '' ? 'Укажите процедуру' : null,
    price: price === '' || unitPrice < 0 ? 'Укажите цену' : null,
    discount: discountValue < 0 || discountValue > subtotal ? 'Скидка больше суммы' : null,
    doctor: doctorId === '' ? 'Выберите врача' : null,
  }

  const pickService = (id: string) => {
    setServiceId(id)
    const service = services.find((item) => item.id === id)
    if (!service) return
    setTitle(service.name)
    setPrice(String(service.price))
    if (service.scope === 'visit') setTooth('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true)
      return
    }
    try {
      await create.mutateAsync({
        patient_id: patient.id,
        doctor_id: doctorId,
        service_id: serviceId || null,
        appointment_id: appointmentId,
        title: title.trim(),
        tooth: tooth ? Number(tooth) : null,
        quantity: qty,
        price: unitPrice,
        discount: discountValue,
        note: note.trim() || null,
        performed_at: performedAtFrom(date),
      })
      toast.success('Лечение добавлено')
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  const error = (key: keyof typeof errors) => (showErrors ? errors[key] : null)

  return (
    <Modal open onClose={onClose} title="Добавить лечение" size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Услуга из прайса" className="sm:col-span-2">
          <Select value={serviceId} onChange={(e) => pickService(e.target.value)}>
            <option value="">— Своя процедура —</option>
            {categories.map((category) => (
              <optgroup key={category} label={serviceCategories[category]}>
                {activeServices
                  .filter((service) => service.category === category)
                  .map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {formatSom(service.price)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </Field>
        <Field label="Процедура *" error={error('title')} className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
        </Field>
        <Field label="Зуб">
          <Select value={tooth} onChange={(e) => setTooth(e.target.value)}>
            <option value="">Без привязки к зубу</option>
            {toothOptionGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.teeth.map((number) => (
                  <option key={number} value={number}>
                    №{number}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>
        <Field label="Дата">
          <Input type="date" value={date} max={toDateInput(new Date())} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Цена за единицу, сом *" error={error('price')}>
          <Input type="number" inputMode="decimal" min={0} step="any" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Количество">
          <Input type="number" inputMode="numeric" min={1} step={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </Field>
        <Field label="Скидка, сом" error={error('discount')}>
          <Input type="number" inputMode="decimal" min={0} step="any" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </Field>
        {isAdmin ? (
          <Field label="Врач *" error={error('doctor')}>
            <Select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">Выберите врача</option>
              {staff
                .filter((member) => member.active)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || 'Без имени'}
                  </option>
                ))}
            </Select>
          </Field>
        ) : (
          <div />
        )}
        <Field label="Комментарий" className="sm:col-span-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} className="min-h-16" />
        </Field>

        <div className="flex items-center justify-between rounded-2xl bg-accent/10 px-4 py-3 sm:col-span-2">
          <span className="text-sm text-white/60">Итого к оплате</span>
          <span className="font-display text-xl font-bold text-accent tabular-nums">{formatSom(Math.max(total, 0))}</span>
        </div>

        <div className="sm:col-span-2">
          <ModalActions>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" icon={Save} loading={create.isPending}>
              Сохранить
            </Button>
          </ModalActions>
        </div>
      </form>
    </Modal>
  )
}
