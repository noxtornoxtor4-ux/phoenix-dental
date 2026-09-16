import { CalendarPlus, Check, Clock, Inbox, MessageCircle, Phone, Siren, Undo2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatPhone } from '../../../lib/phone'
import { createWhatsappUrl } from '../../../lib/whatsapp'
import { ensurePatientForLead, leadStatusOrder, useLeadCounts, useLeads, useUpdateLead } from '../../api/leads'
import { useAuth } from '../../auth/useAuth'
import { formatDateTime, formatSom } from '../../lib/dates'
import { useNow } from '../../lib/useNow'
import { leadKinds, leadStatuses } from '../../labels'
import type { Lead, LeadStatus } from '../../types'
import { Button } from '../../ui/Button'
import { buttonClass } from '../../ui/buttonStyles'
import { Badge, cardClass, EmptyState, ErrorState, LoadingBlock, PageHeader } from '../../ui/primitives'
import { useToast } from '../../ui/toastContext'
import { AppointmentFormModal, type AppointmentDraft } from '../schedule/AppointmentFormModal'

type Filter = LeadStatus | 'all'

function timeAgo(value: string, now: Date) {
  const minutes = Math.round((now.getTime() - new Date(value).getTime()) / 60_000)
  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  return formatDateTime(value)
}

function replyText(lead: Lead) {
  const firstName = lead.name?.split(/\s+/)[0]
  return `Здравствуйте${firstName ? `, ${firstName}` : ''}! Это стоматология PHOENIX. Получили вашу заявку с сайта.`
}

export function LeadsPage() {
  const [filter, setFilter] = useState<Filter>('new')
  const leads = useLeads(filter)
  const counts = useLeadCounts()

  const [booking, setBooking] = useState<{ lead: Lead; draft: AppointmentDraft } | null>(null)

  const filters: { id: Filter; label: string; count?: number }[] = [
    ...leadStatusOrder.map((status) => ({ id: status, label: leadStatuses[status].label, count: counts.data?.[status] })),
    { id: 'all', label: 'Все' },
  ]

  return (
    <>
      <PageHeader title="Заявки" subtitle="Запись и SOS с сайта — новые появляются автоматически" />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl bg-white/5 p-1 [scrollbar-width:none]">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
              filter === item.id ? 'bg-accent text-navy-900' : 'text-white/60 hover:text-white'
            }`}
          >
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${filter === item.id ? 'bg-navy-900/20' : 'bg-white/10'}`}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {leads.isPending ? (
        <LoadingBlock />
      ) : leads.isError ? (
        <ErrorState error={leads.error} onRetry={() => leads.refetch()} />
      ) : leads.data.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === 'new' ? 'Новых заявок нет' : 'Заявок нет'}
          text="Заявки появляются здесь, когда пациенты записываются или нажимают SOS на сайте."
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {leads.data.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onBook={(draft) => setBooking({ lead, draft })} />
          ))}
        </ul>
      )}

      <BookingFlow booking={booking} onClose={() => setBooking(null)} />
    </>
  )
}

function LeadCard({ lead, onBook }: { lead: Lead; onBook: (draft: AppointmentDraft) => void }) {
  const { staff } = useAuth()
  const update = useUpdateLead()
  const toast = useToast()
  const [preparing, setPreparing] = useState(false)
  const now = useNow()
  const kind = leadKinds[lead.kind]
  const status = leadStatuses[lead.status]
  const isSos = lead.kind === 'sos'

  const setStatus = async (next: LeadStatus) => {
    try {
      await update.mutateAsync({ id: lead.id, patch: { status: next, handled_by: staff?.id ?? null } })
    } catch (error) {
      toast.error(error)
    }
  }

  const book = async () => {
    setPreparing(true)
    try {
      const patient = await ensurePatientForLead(lead)
      if (patient && patient.id !== lead.patient_id) {
        await update.mutateAsync({ id: lead.id, patch: { patient_id: patient.id } })
      }
      const preferred = lead.preferred_at ? new Date(lead.preferred_at) : null
      onBook({
        start: preferred && preferred.getTime() > Date.now() ? preferred : new Date(),
        patient: patient ?? undefined,
        leadId: lead.id,
        note: lead.summary ?? undefined,
      })
    } catch (error) {
      toast.error(error)
    } finally {
      setPreparing(false)
    }
  }

  return (
    <li className={`${cardClass} flex flex-col p-4 ${isSos && lead.status === 'new' ? 'border-sos/50 bg-sos/[0.06]' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={kind.color}>
          {isSos && <Siren className="size-3" />}
          {kind.label}
        </Badge>
        <Badge color={status.color}>{status.label}</Badge>
        <span className="ml-auto flex items-center gap-1 text-xs text-white/45">
          <Clock className="size-3.5" />
          {timeAgo(lead.created_at, now)}
        </span>
      </div>

      <div className="mt-3 flex-1">
        <p className="font-semibold">
          {lead.patient_id ? (
            <Link to={`/patients/${lead.patient_id}`} className="hover:text-accent">
              {lead.name ?? 'Пациент'}
            </Link>
          ) : (
            (lead.name ?? (isSos ? 'Посетитель сайта нажал SOS' : 'Без имени'))
          )}
        </p>
        {lead.phone && <p className="text-sm text-white/60 tabular-nums">{formatPhone(lead.phone)}</p>}
        {lead.summary && <p className="mt-2 text-sm text-white/80">{lead.summary}</p>}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
          {lead.preferred_at && <span>Желаемое время: {formatDateTime(lead.preferred_at)}</span>}
          {lead.estimate !== null && lead.estimate > 0 && <span>Смета: от {formatSom(lead.estimate)}</span>}
          {lead.lang && lead.lang !== 'ru' && <span>Язык: {lead.lang === 'ky' ? 'кыргызский' : 'английский'}</span>}
        </div>
        {isSos && !lead.phone && (
          <p className="mt-2 text-xs text-white/45">
            У посетителя открылся WhatsApp с сообщением дежурному врачу — проверьте чат.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
        {lead.phone && (
          <>
            <a href={`tel:${lead.phone}`} className={buttonClass('secondary', 'sm')} aria-label="Позвонить">
              <Phone className="size-4" />
            </a>
            <a
              href={createWhatsappUrl(lead.phone, replyText(lead))}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('secondary', 'sm')}
            >
              <MessageCircle className="size-4 text-[#25D366]" />
              Написать
            </a>
          </>
        )}
        {lead.status === 'new' && (
          <Button size="sm" icon={Check} onClick={() => setStatus('contacted')} disabled={update.isPending}>
            Связались
          </Button>
        )}
        {lead.status !== 'booked' && lead.status !== 'rejected' && (
          <Button size="sm" variant="primary" icon={CalendarPlus} loading={preparing} onClick={book}>
            Записать
          </Button>
        )}
        {lead.status !== 'rejected' && lead.status !== 'booked' && (
          <Button size="sm" variant="ghost" icon={X} onClick={() => setStatus('rejected')} disabled={update.isPending}>
            Отказ
          </Button>
        )}
        {(lead.status === 'rejected' || lead.status === 'booked') && (
          <Button size="sm" variant="ghost" icon={Undo2} onClick={() => setStatus('new')} disabled={update.isPending}>
            Вернуть в новые
          </Button>
        )}
      </div>
    </li>
  )
}

function BookingFlow({
  booking,
  onClose,
}: {
  booking: { lead: Lead; draft: AppointmentDraft } | null
  onClose: () => void
}) {
  const { staff } = useAuth()
  const update = useUpdateLead()

  return (
    <AppointmentFormModal
      open={booking !== null}
      draft={booking?.draft}
      onClose={onClose}
      onSaved={() => {
        if (booking) {
          update.mutate({ id: booking.lead.id, patch: { status: 'booked', handled_by: staff?.id ?? null } })
        }
      }}
    />
  )
}
