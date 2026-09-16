import { ArrowRight, CalendarCheck, CalendarDays, Inbox, Package, Siren, TriangleAlert, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatPhone } from '../../lib/phone'
import { useAppointments, type AppointmentWithPatient } from '../api/appointments'
import { usePaymentsInPeriod } from '../api/finance'
import { useInventoryItems } from '../api/inventory'
import { useLeadCounts, useLeads } from '../api/leads'
import { useStaff } from '../api/staff'
import { useAuth } from '../auth/useAuth'
import { addDays, formatClock, formatDate, formatSom, startOfDay } from '../lib/dates'
import { formatQuantity, isLowStock } from '../lib/inventory'
import { useRealtimeInvalidation } from '../lib/useRealtimeInvalidation'
import { leadKinds, roleLabels } from '../labels'
import { cardClass, ErrorState, LoadingBlock, PageHeader, StatCard } from '../ui/primitives'
import { AgendaList } from './schedule/AgendaList'
import { AppointmentDetailsModal } from './schedule/AppointmentDetailsModal'
import { AppointmentFormModal } from './schedule/AppointmentFormModal'

function greeting(hour: number) {
  if (hour < 5) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

function SectionTitle({ title, to }: { title: string; to?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {to && (
        <Link to={to} className="flex items-center gap-1 text-sm text-accent hover:underline">
          Все <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { staff: me, isAdmin } = useAuth()
  const [today] = useState(() => startOfDay(new Date()))
  const tomorrow = addDays(today, 1)
  const appointments = useAppointments(today, tomorrow)
  const payments = usePaymentsInPeriod({ from: today, to: tomorrow })
  const leadCounts = useLeadCounts(isAdmin)
  const newLeads = useLeads('new', isAdmin)
  const inventory = useInventoryItems()
  const { data: staff = [] } = useStaff()
  useRealtimeInvalidation('appointments', ['appointments'])

  const [selected, setSelected] = useState<AppointmentWithPatient | null>(null)
  const [editing, setEditing] = useState<AppointmentWithPatient | null>(null)

  const todays = appointments.data ?? []
  const active = todays.filter((item) => item.status !== 'cancelled' && item.status !== 'no_show')
  const done = todays.filter((item) => item.status === 'completed').length
  const upcoming = active.filter((item) => item.status !== 'completed' && new Date(item.ends_at) > new Date())
  const next = upcoming[0]
  const lowStock = (inventory.data ?? []).filter((item) => item.active && isLowStock(item))
  const revenue = (payments.data ?? []).reduce((sum, payment) => sum + payment.amount, 0)
  const firstName = me?.full_name.split(/\s+/)[0]

  return (
    <>
      <PageHeader
        title={`${greeting(new Date().getHours())}${firstName ? `, ${firstName}` : ''}`}
        subtitle={`${formatDate(today)} · ${me ? roleLabels[me.role] : ''}`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Записей сегодня" value={active.length} hint={next ? `следующая в ${formatClock(next.starts_at)}` : 'на сегодня всё'} />
        <StatCard icon={CalendarCheck} label="Завершено" value={done} color="#34D399" />
        {isAdmin ? (
          <>
            <StatCard icon={Wallet} label="Поступило сегодня" value={formatSom(revenue)} color="#A78BFA" />
            <StatCard icon={Inbox} label="Новые заявки" value={leadCounts.data?.new ?? '…'} color={leadCounts.data?.new ? '#FF3B5C' : '#FBBF24'} />
          </>
        ) : (
          <StatCard icon={Package} label="Заканчивается на складе" value={lowStock.length} color={lowStock.length ? '#FF3B5C' : '#34D399'} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <SectionTitle title="Расписание на сегодня" to="/schedule" />
          {appointments.isPending ? (
            <LoadingBlock />
          ) : appointments.isError ? (
            <ErrorState error={appointments.error} onRetry={() => appointments.refetch()} />
          ) : (
            <AgendaList
              from={today}
              days={1}
              staffById={new Map(staff.map((member) => [member.id, member]))}
              appointments={todays}
              onAppointmentClick={setSelected}
              onDayClick={() => undefined}
            />
          )}
        </section>

        <div className="space-y-6">
          {isAdmin && (
            <section>
              <SectionTitle title="Новые заявки" to="/leads" />
              <div className={`${cardClass} overflow-hidden`}>
                {newLeads.isPending ? (
                  <LoadingBlock />
                ) : (newLeads.data ?? []).length === 0 ? (
                  <p className="px-4 py-5 text-sm text-white/45">Новых заявок нет</p>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {(newLeads.data ?? []).slice(0, 5).map((lead) => (
                      <li key={lead.id}>
                        <Link to="/leads" className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5">
                          {lead.kind === 'sos' ? (
                            <Siren className="size-4 shrink-0 text-sos" aria-label={leadKinds.sos.label} />
                          ) : (
                            <Inbox className="size-4 shrink-0 text-white/40" aria-label={leadKinds.booking.label} />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {lead.name ?? (lead.kind === 'sos' ? 'SOS: острая боль' : 'Заявка')}
                            </span>
                            <span className="block truncate text-xs text-white/45">
                              {[formatPhone(lead.phone), lead.summary].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          <section>
            <SectionTitle title="Заканчивается на складе" to="/inventory" />
            <div className={`${cardClass} overflow-hidden`}>
              {inventory.isPending ? (
                <LoadingBlock />
              ) : lowStock.length === 0 ? (
                <p className="px-4 py-5 text-sm text-white/45">Все материалы в достатке</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {lowStock.slice(0, 6).map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <TriangleAlert className="size-4 shrink-0 text-sos" />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="font-semibold tabular-nums">
                        {formatQuantity(item.quantity)} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <AppointmentDetailsModal
        appointment={selected}
        onClose={() => setSelected(null)}
        onEdit={(appointment) => {
          setSelected(null)
          setEditing(appointment)
        }}
      />
      <AppointmentFormModal open={editing !== null} appointment={editing ?? undefined} onClose={() => setEditing(null)} />
    </>
  )
}
