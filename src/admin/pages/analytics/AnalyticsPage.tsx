import { CalendarCheck, Inbox, TrendingUp, UserRoundPlus, UserX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLeadsInPeriod, useNewPatientsInPeriod } from '../../api/analytics'
import { useAppointments } from '../../api/appointments'
import { usePaymentsInPeriod, useTreatmentsInPeriod } from '../../api/finance'
import { useStaffById } from '../../api/staff'
import { bucketSeries, percent, tally } from '../../lib/analytics'
import { formatSom } from '../../lib/dates'
import { appointmentStatuses, leadStatuses, patientSources } from '../../labels'
import type { AppointmentStatus, LeadStatus, PatientSource } from '../../types'
import { BarList } from '../../ui/charts/BarList'
import { ColumnChart } from '../../ui/charts/ColumnChart'
import { cardClass, ErrorState, LoadingBlock, PageHeader, StatCard } from '../../ui/primitives'
import { PeriodPicker } from '../finance/PeriodPicker'
import { usePeriod } from '../finance/usePeriod'

const HOUR = 60 * 60 * 1000
const count = (value: number) => String(value)

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function AnalyticsPage() {
  const periodState = usePeriod('month')
  const { period } = periodState
  const staffById = useStaffById()

  const payments = usePaymentsInPeriod(period)
  const treatments = useTreatmentsInPeriod(period)
  const appointments = useAppointments(period.from, period.to)
  const patients = useNewPatientsInPeriod(period)
  const leads = useLeadsInPeriod(period)

  const queries = [payments, treatments, appointments, patients, leads]
  const failed = queries.find((query) => query.isError)
  const loading = queries.some((query) => query.isPending)
  const stale = queries.some((query) => query.isPlaceholderData || query.isFetching)

  const header = (
    <>
      <PageHeader title="Аналитика" subtitle="Выручка, загрузка врачей, услуги и источники пациентов" />
      <div className="mb-5">
        <PeriodPicker state={periodState} />
      </div>
    </>
  )

  if (loading) {
    return (
      <>
        {header}
        <LoadingBlock />
      </>
    )
  }
  if (failed) {
    return (
      <>
        {header}
        <ErrorState error={failed.error} onRetry={() => queries.forEach((query) => query.refetch())} />
      </>
    )
  }

  const paymentRows = payments.data ?? []
  const treatmentRows = treatments.data ?? []
  const appointmentRows = appointments.data ?? []
  const patientRows = patients.data ?? []
  const leadRows = leads.data ?? []

  const revenue = paymentRows.reduce((sum, payment) => sum + payment.amount, 0)
  const byStatus = tally(appointmentRows, (item) => item.status)
  const statusCount = (status: AppointmentStatus) => byStatus.find((row) => row.key === status)?.value ?? 0
  const completed = statusCount('completed')
  const noShows = statusCount('no_show')
  const booked = leadRows.filter((lead) => lead.status === 'booked').length

  const doctorLoad = tally(
    appointmentRows.filter((item) => item.status !== 'cancelled' && item.status !== 'no_show'),
    (item) => item.doctor_id,
    (item) => (new Date(item.ends_at).getTime() - new Date(item.starts_at).getTime()) / HOUR,
  )
  const doctorVisits = tally(
    appointmentRows.filter((item) => item.status !== 'cancelled' && item.status !== 'no_show'),
    (item) => item.doctor_id,
  )
  const topServices = tally(treatmentRows, (item) => item.title, (item) => item.total).slice(0, 8)
  const serviceCounts = tally(treatmentRows, (item) => item.title)

  return (
    <div className={`transition-opacity ${stale ? 'opacity-80' : ''}`}>
      {header}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={TrendingUp} label="Поступления" value={formatSom(revenue)} color="#34D399" />
        <StatCard icon={CalendarCheck} label="Завершённых визитов" value={completed} hint={`из ${appointmentRows.length} записей`} />
        <StatCard icon={UserRoundPlus} label="Новых пациентов" value={patientRows.length} color="#A78BFA" />
        <StatCard
          icon={UserX}
          label="Неявки"
          value={`${percent(noShows, completed + noShows)}%`}
          hint={`${noShows} из ${completed + noShows} визитов`}
          color="#FB7185"
        />
        <StatCard
          icon={Inbox}
          label="Заявки → запись"
          value={`${percent(booked, leadRows.length)}%`}
          hint={`${booked} из ${leadRows.length} заявок`}
          color="#FBBF24"
        />
      </div>

      <div className="space-y-5">
        <ColumnChart
          title="Поступления"
          subtitle="Оплаты пациентов, сом"
          data={bucketSeries(paymentRows, period, (item) => item.paid_at, (item) => item.amount)}
          formatValue={formatSom}
          stale={stale}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Загрузка врачей, часов приёма">
            <BarList
              items={doctorLoad.map((row) => ({
                key: row.key,
                label: staffById.get(row.key)?.full_name || 'Врач',
                dotColor: staffById.get(row.key)?.color,
                value: Math.round(row.value * 10) / 10,
                hint: `${doctorVisits.find((visit) => visit.key === row.key)?.value ?? 0} зап.`,
              }))}
              formatValue={(value) => `${String(value).replace('.', ',')} ч`}
              empty="Записей за период нет"
            />
          </Panel>

          <Panel title="Популярные услуги, по выручке">
            <BarList
              items={topServices.map((row) => ({
                key: row.key,
                label: row.key,
                value: row.value,
                hint: `×${serviceCounts.find((item) => item.key === row.key)?.value ?? 0}`,
              }))}
              formatValue={formatSom}
              empty="Лечения за период нет"
            />
          </Panel>

          <Panel title="Записи по статусам">
            <BarList
              items={(Object.keys(appointmentStatuses) as AppointmentStatus[])
                .map((status) => ({
                  key: status,
                  label: appointmentStatuses[status].label,
                  value: statusCount(status),
                  dotColor: appointmentStatuses[status].color,
                }))
                .filter((row) => row.value > 0)}
              formatValue={count}
              empty="Записей за период нет"
            />
          </Panel>

          <Panel title="Откуда новые пациенты">
            <BarList
              items={tally(patientRows, (item) => item.source).map((row) => ({
                key: row.key,
                label: patientSources[row.key as PatientSource],
                value: row.value,
              }))}
              formatValue={count}
              empty="Новых пациентов за период нет"
            />
          </Panel>

          <Panel title="Заявки с сайта">
            <BarList
              items={tally(leadRows, (item) => item.status).map((row) => ({
                key: row.key,
                label: leadStatuses[row.key as LeadStatus].label,
                value: row.value,
                dotColor: leadStatuses[row.key as LeadStatus].color,
              }))}
              formatValue={count}
              empty="Заявок за период нет"
            />
            {leadRows.some((lead) => lead.kind === 'sos') && (
              <p className="mt-4 text-xs text-white/45">
                Из них SOS «острая боль»: {leadRows.filter((lead) => lead.kind === 'sos').length}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
