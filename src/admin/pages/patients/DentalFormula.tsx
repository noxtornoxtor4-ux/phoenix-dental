import { Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { DentalArch } from '../../../components/dental/DentalArch'
import { getToothKind, type Jaw, type ToothKind } from '../../../data/teeth'
import { useSaveToothRecord, useToothRecords } from '../../api/medical'
import { formatDate, formatSom } from '../../lib/dates'
import { toothConditions } from '../../labels'
import type { ToothCondition, ToothRecord, Treatment } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Textarea } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { cardClass, ErrorState, LoadingBlock } from '../../ui/primitives'
import { useToast } from '../../ui/toastContext'

const kindLabels: Record<ToothKind, string> = {
  incisor: 'резец',
  canine: 'клык',
  premolar: 'премоляр',
  molar: 'моляр',
}

const jaws: { jaw: Jaw; title: string }[] = [
  { jaw: 'upper', title: 'Верхняя челюсть' },
  { jaw: 'lower', title: 'Нижняя челюсть' },
]

interface DentalFormulaProps {
  patientId: string
  treatments: Treatment[]
  onAddTreatment: (tooth: number) => void
}

export function DentalFormula({ patientId, treatments, onAddTreatment }: DentalFormulaProps) {
  const records = useToothRecords(patientId)
  const [activeTooth, setActiveTooth] = useState<number | null>(null)

  if (records.isPending) return <LoadingBlock />
  if (records.isError) return <ErrorState error={records.error} onRetry={() => records.refetch()} />

  const byTooth = new Map(records.data.map((record) => [record.tooth, record]))
  const counts = new Map<ToothCondition, number>()
  for (const record of records.data) counts.set(record.condition, (counts.get(record.condition) ?? 0) + 1)

  return (
    <div className="space-y-4">
      <div className={`${cardClass} grid gap-2 px-2 py-4 sm:px-4 lg:grid-cols-2`}>
        {jaws.map(({ jaw, title }) => (
          <DentalArch
            key={jaw}
            jaw={jaw}
            title={title}
            onToothClick={setActiveTooth}
            getAppearance={(tooth) => {
              const record = byTooth.get(tooth)
              const condition = record?.condition
              const marked = condition && condition !== 'healthy'
              return {
                color: marked ? toothConditions[condition].color : undefined,
                muted: condition === 'missing',
                label: `Зуб №${tooth}${marked ? ` — ${toothConditions[condition].label}` : ''}`,
              }
            }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-2">
        {(Object.keys(toothConditions) as ToothCondition[])
          .filter((condition) => condition !== 'healthy')
          .map((condition) => (
            <li
              key={condition}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: toothConditions[condition].color }}
              />
              {toothConditions[condition].label}
              {counts.get(condition) ? <b className="tabular-nums">{counts.get(condition)}</b> : null}
            </li>
          ))}
      </ul>

      {activeTooth !== null && (
        <ToothModal
          key={activeTooth}
          patientId={patientId}
          tooth={activeTooth}
          record={byTooth.get(activeTooth)}
          treatments={treatments.filter((treatment) => treatment.tooth === activeTooth)}
          onClose={() => setActiveTooth(null)}
          onAddTreatment={() => {
            setActiveTooth(null)
            onAddTreatment(activeTooth)
          }}
        />
      )}
    </div>
  )
}

interface ToothModalProps {
  patientId: string
  tooth: number
  record: ToothRecord | undefined
  treatments: Treatment[]
  onClose: () => void
  onAddTreatment: () => void
}

function ToothModal({ patientId, tooth, record, treatments, onClose, onAddTreatment }: ToothModalProps) {
  const save = useSaveToothRecord(patientId)
  const toast = useToast()
  const [condition, setCondition] = useState<ToothCondition>(record?.condition ?? 'healthy')
  const [note, setNote] = useState(record?.note ?? '')

  const submit = async () => {
    try {
      await save.mutateAsync({ tooth, condition, note: note.trim() })
      toast.success(`Зуб №${tooth} обновлён`)
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={
        <>
          Зуб №{tooth} <span className="font-sans text-sm font-medium text-white/50">· {kindLabels[getToothKind(tooth)]}</span>
        </>
      }
    >
      <p className="mb-2 text-xs font-semibold text-white/60">Состояние</p>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(toothConditions) as ToothCondition[]).map((value) => {
          const tone = toothConditions[value]
          const active = condition === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setCondition(value)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                active ? 'border-accent bg-accent/10 font-semibold' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: tone.color }} />
              {tone.label}
            </button>
          )
        })}
      </div>

      <Field label="Заметка по зубу" className="mt-4">
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="min-h-16" />
      </Field>
      {record && (
        <p className="mt-2 text-xs text-white/40">Обновлено {formatDate(record.updated_at)}</p>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-white/60">История лечения зуба</p>
          <Button size="sm" variant="ghost" icon={Plus} onClick={onAddTreatment}>
            Лечение
          </Button>
        </div>
        {treatments.length === 0 ? (
          <p className="text-sm text-white/40">Записей нет</p>
        ) : (
          <ul className="space-y-2">
            {treatments.map((treatment) => (
              <li key={treatment.id} className="flex justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{treatment.title}</span>
                  <span className="block text-xs text-white/45">{formatDate(treatment.performed_at)}</span>
                </span>
                <span className="whitespace-nowrap tabular-nums">{formatSom(treatment.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ModalActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="primary" icon={Save} loading={save.isPending} onClick={submit}>
          Сохранить
        </Button>
      </ModalActions>
    </Modal>
  )
}
