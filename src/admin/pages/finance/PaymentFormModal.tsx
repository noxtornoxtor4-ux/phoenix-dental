import { Banknote, CreditCard, Save, Smartphone } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreatePayment, usePatientBalance } from '../../api/finance'
import { formatSom, toDateInput } from '../../lib/dates'
import { paymentMethods } from '../../labels'
import type { Patient, PaymentMethod } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Input, Textarea } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { useToast } from '../../ui/toastContext'
import { PatientFormModal } from '../patients/PatientFormModal'
import { PatientPicker } from '../schedule/PatientPicker'

const methodIcons = { cash: Banknote, card: CreditCard, transfer: Smartphone }

type PatientRef = Pick<Patient, 'id' | 'full_name' | 'phone'>

interface PaymentFormModalProps {
  open: boolean
  patient?: PatientRef
  onClose: () => void
}

export function PaymentFormModal(props: PaymentFormModalProps) {
  return props.open ? <PaymentForm {...props} /> : null
}

function PaymentForm({ patient: fixedPatient, onClose }: PaymentFormModalProps) {
  const create = useCreatePayment()
  const toast = useToast()
  const [patient, setPatient] = useState<PatientRef | null>(fixedPatient ?? null)
  const [creatingPatient, setCreatingPatient] = useState(false)
  const balance = usePatientBalance(patient?.id ?? '', Boolean(patient))
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [date, setDate] = useState(toDateInput(new Date()))
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const value = Number(amount)
  const errors = {
    patient: patient ? null : 'Выберите пациента',
    amount: value > 0 ? null : 'Укажите сумму',
  }
  const debt = balance.data?.balance ?? 0

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!patient || errors.amount) {
      setShowErrors(true)
      return
    }
    const today = toDateInput(new Date())
    const [year, month, day] = date.split('-').map(Number)
    try {
      await create.mutateAsync({
        patient_id: patient.id,
        amount: value,
        method,
        note: note.trim() || null,
        paid_at: date === today ? new Date().toISOString() : new Date(year, month - 1, day, 12).toISOString(),
      })
      toast.success(`Оплата ${formatSom(value)} принята`)
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <>
      <Modal open={!creatingPatient} onClose={onClose} title="Принять оплату">
        <form onSubmit={submit} className="space-y-4">
          {fixedPatient ? (
            <p className="font-semibold">{fixedPatient.full_name}</p>
          ) : (
            <Field label="Пациент *" error={showErrors ? errors.patient : null}>
              <PatientPicker
                value={patient}
                onChange={setPatient}
                onCreate={() => setCreatingPatient(true)}
                invalid={showErrors && Boolean(errors.patient)}
              />
            </Field>
          )}

          {patient && balance.isSuccess && (
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
              <span className="text-white/60">{debt > 0 ? 'Долг пациента' : debt < 0 ? 'Аванс пациента' : 'Задолженности нет'}</span>
              {debt !== 0 && (
                <button
                  type="button"
                  onClick={() => debt > 0 && setAmount(String(debt))}
                  className={`font-semibold tabular-nums ${debt > 0 ? 'text-amber-300 hover:underline' : 'text-emerald-400'}`}
                >
                  {formatSom(Math.abs(debt))}
                </button>
              )}
            </div>
          )}

          <Field label="Сумма, сом *" error={showErrors ? errors.amount : null}>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
            />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-white/60">Способ оплаты</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(paymentMethods) as PaymentMethod[]).map((item) => {
                const Icon = methodIcons[item]
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={method === item}
                    onClick={() => setMethod(item)}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition ${
                      method === item ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-white/5 text-white/70'
                    }`}
                  >
                    <Icon className="size-5" />
                    {paymentMethods[item]}
                  </button>
                )
              })}
            </div>
          </div>

          <Field label="Дата">
            <Input type="date" value={date} max={toDateInput(new Date())} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Комментарий">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="min-h-16" />
          </Field>

          <ModalActions>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" icon={Save} loading={create.isPending}>
              Принять
            </Button>
          </ModalActions>
        </form>
      </Modal>
      <PatientFormModal open={creatingPatient} onClose={() => setCreatingPatient(false)} onSaved={setPatient} />
    </>
  )
}
