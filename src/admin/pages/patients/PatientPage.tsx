import { ArrowLeft, CalendarDays, ClipboardList, MessageCircle, Pencil, Phone, ScanLine, Trash, TriangleAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { formatPhone } from '../../../lib/phone'
import { createWhatsappUrl } from '../../../lib/whatsapp'
import { useTreatments } from '../../api/medical'
import { useDeletePatient, usePatient } from '../../api/patients'
import { useStaffById } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { ageFrom, formatDate } from '../../lib/dates'
import { patientSources } from '../../labels'
import type { Patient } from '../../types'
import { Button } from '../../ui/Button'
import { buttonClass } from '../../ui/buttonStyles'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { cardClass, ErrorState, LoadingBlock } from '../../ui/primitives'
import { DentalFormula } from './DentalFormula'
import { PatientFormModal } from './PatientFormModal'
import { TreatmentFormModal } from './TreatmentFormModal'
import { TreatmentsTab } from './TreatmentsTab'
import { VisitsTab } from './VisitsTab'

interface PatientTab {
  id: string
  label: string
  icon: typeof ScanLine
}

const tabs: PatientTab[] = [
  { id: 'formula', label: 'Зубная формула', icon: ScanLine },
  { id: 'treatments', label: 'Лечение', icon: ClipboardList },
  { id: 'visits', label: 'Визиты', icon: CalendarDays },
]

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-white/45">{label}</dt>
      <dd className="mt-0.5 truncate text-sm">{children}</dd>
    </div>
  )
}

export function PatientPage() {
  const { id } = useParams()
  const patient = usePatient(id)

  if (patient.isPending) return <LoadingBlock />
  if (patient.isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState error={patient.error} onRetry={() => patient.refetch()} />
      </div>
    )
  }
  return <PatientCard patient={patient.data} />
}

function BackLink() {
  return (
    <Link to="/patients" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
      <ArrowLeft className="size-4" />
      Все пациенты
    </Link>
  )
}

function PatientCard({ patient }: { patient: Patient }) {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const staffById = useStaffById()
  const treatments = useTreatments(patient.id)
  const remove = useDeletePatient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [treatmentTooth, setTreatmentTooth] = useState<number | null | undefined>(undefined)

  const activeTab = tabs.find((tab) => tab.id === searchParams.get('tab'))?.id ?? tabs[0].id
  const doctor = patient.doctor_id ? staffById.get(patient.doctor_id) : undefined

  return (
    <div className="space-y-5">
      <BackLink />

      <section className={`${cardClass} p-5`}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">{patient.full_name}</h1>
            <p className="mt-1 text-sm text-white/55">
              {patient.birth_date ? `${ageFrom(patient.birth_date)} лет` : 'Возраст не указан'}
              {patient.gender && ` · ${patient.gender === 'female' ? 'женщина' : 'мужчина'}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.phone && (
              <>
                <a href={`tel:${patient.phone}`} aria-label="Позвонить" className={buttonClass('secondary', 'icon')}>
                  <Phone className="size-4" />
                </a>
                <a
                  href={createWhatsappUrl(patient.phone, '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Написать в WhatsApp"
                  className={buttonClass('secondary', 'icon')}
                >
                  <MessageCircle className="size-4 text-[#25D366]" />
                </a>
              </>
            )}
            <Button icon={Pencil} onClick={() => setEditing(true)}>
              Изменить
            </Button>
            {isAdmin && (
              <Button size="icon" variant="danger" aria-label="Удалить пациента" onClick={() => setDeleting(true)}>
                <Trash className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {patient.allergies && (
          <p className="mt-4 flex gap-2 rounded-2xl border border-sos/30 bg-sos/10 px-4 py-3 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-sos" />
            <span>
              <b className="text-sos">Аллергии: </b>
              {patient.allergies}
            </span>
          </p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoItem label="Телефон">{formatPhone(patient.phone) || '—'}</InfoItem>
          <InfoItem label="Лечащий врач">{doctor?.full_name || '—'}</InfoItem>
          <InfoItem label="Источник">{patientSources[patient.source]}</InfoItem>
          <InfoItem label="В базе с">{formatDate(patient.created_at)}</InfoItem>
        </dl>
        {patient.notes && <p className="mt-4 text-sm whitespace-pre-line text-white/70">{patient.notes}</p>}
      </section>

      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-2xl bg-white/5 p-1 [scrollbar-width:none]">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setSearchParams({ tab: id }, { replace: true })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
              activeTab === id ? 'bg-accent text-navy-900' : 'text-white/60 hover:text-white'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'visits' ? (
        <VisitsTab patient={patient} />
      ) : treatments.isPending ? (
        <LoadingBlock />
      ) : treatments.isError ? (
        <ErrorState error={treatments.error} onRetry={() => treatments.refetch()} />
      ) : activeTab === 'formula' ? (
        <DentalFormula patientId={patient.id} treatments={treatments.data} onAddTreatment={setTreatmentTooth} />
      ) : (
        <TreatmentsTab treatments={treatments.data} onAdd={() => setTreatmentTooth(null)} />
      )}

      <PatientFormModal open={editing} patient={patient} onClose={() => setEditing(false)} />
      <TreatmentFormModal
        open={treatmentTooth !== undefined}
        patient={patient}
        defaultTooth={treatmentTooth}
        onClose={() => setTreatmentTooth(undefined)}
      />
      <ConfirmDialog
        open={deleting}
        title="Удалить пациента?"
        confirmLabel="Удалить навсегда"
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await remove.mutateAsync(patient.id)
          navigate('/patients', { replace: true })
        }}
      >
        Будут удалены карточка <b className="text-white">{patient.full_name}</b>, зубная формула, история лечения, записи и
        оплаты. Это действие нельзя отменить.
      </ConfirmDialog>
    </div>
  )
}
