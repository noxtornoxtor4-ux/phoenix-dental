import { Banknote, CreditCard, HandCoins, Plus, ReceiptText, Smartphone, Trash, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatPhone } from '../../../lib/phone'
import { useDebtors, useDeletePayment, usePaymentsInPeriod, useTreatmentsInPeriod, type PaymentWithPatient } from '../../api/finance'
import { useStaffById } from '../../api/staff'
import { formatDateTime, formatSom } from '../../lib/dates'
import { summarizeFinance } from '../../lib/finance'
import { paymentMethods } from '../../labels'
import type { Patient } from '../../types'
import { Button } from '../../ui/Button'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { cardClass, ErrorState, LoadingBlock, PageHeader, StatCard } from '../../ui/primitives'
import { PaymentFormModal } from './PaymentFormModal'
import { PeriodPicker } from './PeriodPicker'
import { usePeriod } from './usePeriod'

const methodIcons = { cash: Banknote, card: CreditCard, transfer: Smartphone }

export function FinancePage() {
  const periodState = usePeriod('month')
  const { period } = periodState
  const payments = usePaymentsInPeriod(period)
  const treatments = useTreatmentsInPeriod(period)
  const debtors = useDebtors()
  const staffById = useStaffById()
  const removePayment = useDeletePayment()
  const [paying, setPaying] = useState<{ patient?: Pick<Patient, 'id' | 'full_name' | 'phone'> } | null>(null)
  const [deleting, setDeleting] = useState<PaymentWithPatient | null>(null)

  const loading = payments.isPending || treatments.isPending
  const error = payments.error ?? treatments.error
  const summary = summarizeFinance(payments.data ?? [], treatments.data ?? [])

  return (
    <>
      <PageHeader
        title="Финансы"
        subtitle="Касса, оплаты, долги и выручка врачей"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setPaying({})}>
            Принять оплату
          </Button>
        }
      />

      <div className="mb-5">
        <PeriodPicker state={periodState} />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorState
          error={error}
          onRetry={() => {
            payments.refetch()
            treatments.refetch()
          }}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={Wallet} label="Поступило" value={formatSom(summary.received)} hint={`${summary.paymentsCount} оплат`} color="#34D399" />
            <StatCard icon={ReceiptText} label="Оказано услуг" value={formatSom(summary.billed)} hint={`${treatments.data?.length ?? 0} процедур`} />
            <StatCard icon={TrendingUp} label="Средний чек" value={formatSom(summary.averageCheck)} color="#A78BFA" />
            <StatCard
              icon={HandCoins}
              label="Долги пациентов"
              value={debtors.isSuccess ? formatSom(debtors.data.total) : '…'}
              hint="на сегодня, всего"
              color="#FBBF24"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold">Касса по способам оплаты</h2>
              <ul className="space-y-3">
                {(Object.keys(paymentMethods) as (keyof typeof paymentMethods)[]).map((method) => {
                  const Icon = methodIcons[method]
                  const share = summary.received > 0 ? (summary.byMethod[method] / summary.received) * 100 : 0
                  return (
                    <li key={method}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-white/70">
                          <Icon className="size-4" />
                          {paymentMethods[method]}
                        </span>
                        <span className="font-semibold tabular-nums">{formatSom(summary.byMethod[method])}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold">Выручка по врачам</h2>
              {summary.byDoctor.length === 0 ? (
                <p className="text-sm text-white/45">За период процедур нет</p>
              ) : (
                <ul className="space-y-3">
                  {summary.byDoctor.map((row) => {
                    const doctor = staffById.get(row.doctorId)
                    const share = summary.billed > 0 ? (row.total / summary.billed) * 100 : 0
                    return (
                      <li key={row.doctorId}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: doctor?.color ?? '#94A3B8' }} />
                            <span className="truncate">{doctor?.full_name || 'Врач'}</span>
                            <span className="text-xs text-white/40">{row.count} проц.</span>
                          </span>
                          <span className="font-semibold tabular-nums">{formatSom(row.total)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: doctor?.color ?? '#94A3B8' }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section className={`${cardClass} overflow-hidden`}>
              <h2 className="border-b border-white/5 px-5 py-4 font-semibold">Оплаты за период</h2>
              {payments.data?.length === 0 ? (
                <p className="px-5 py-6 text-sm text-white/45">Оплат нет</p>
              ) : (
                <ul className="max-h-[32rem] divide-y divide-white/5 overflow-y-auto">
                  {payments.data?.map((payment) => {
                    const Icon = methodIcons[payment.method]
                    return (
                      <li key={payment.id} className="flex items-center gap-3 px-5 py-3">
                        <Icon className="size-4 shrink-0 text-white/40" aria-label={paymentMethods[payment.method]} />
                        <div className="min-w-0 flex-1">
                          {payment.patient ? (
                            <Link to={`/patients/${payment.patient.id}?tab=payments`} className="block truncate text-sm font-semibold hover:text-accent">
                              {payment.patient.full_name}
                            </Link>
                          ) : (
                            <span className="text-sm">Пациент удалён</span>
                          )}
                          <span className="block text-xs text-white/45">
                            {formatDateTime(payment.paid_at)}
                            {payment.note && ` · ${payment.note}`}
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-400 tabular-nums">+{formatSom(payment.amount)}</span>
                        <Button size="icon" variant="ghost" aria-label="Удалить оплату" onClick={() => setDeleting(payment)}>
                          <Trash className="size-4" />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className={`${cardClass} overflow-hidden`}>
              <h2 className="border-b border-white/5 px-5 py-4 font-semibold">Должники</h2>
              {debtors.isPending ? (
                <LoadingBlock />
              ) : debtors.isError ? (
                <div className="p-4">
                  <ErrorState error={debtors.error} onRetry={() => debtors.refetch()} />
                </div>
              ) : debtors.data.rows.length === 0 ? (
                <p className="px-5 py-6 text-sm text-white/45">Долгов нет</p>
              ) : (
                <ul className="max-h-[32rem] divide-y divide-white/5 overflow-y-auto">
                  {debtors.data.rows.map((row) => (
                    <li key={row.patient_id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <Link to={`/patients/${row.patient_id}?tab=payments`} className="block truncate text-sm font-semibold hover:text-accent">
                          {row.patient?.full_name ?? 'Пациент'}
                        </Link>
                        <span className="block text-xs text-white/45 tabular-nums">{formatPhone(row.patient?.phone)}</span>
                      </div>
                      <span className="font-semibold text-amber-300 tabular-nums">{formatSom(row.balance)}</span>
                      {row.patient && (
                        <Button size="sm" onClick={() => setPaying({ patient: row.patient })}>
                          Оплата
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      <PaymentFormModal open={paying !== null} patient={paying?.patient} onClose={() => setPaying(null)} />
      <ConfirmDialog
        open={deleting !== null}
        title="Удалить оплату?"
        confirmLabel="Удалить"
        onClose={() => setDeleting(null)}
        onConfirm={() => removePayment.mutateAsync(deleting!.id)}
      >
        {deleting && `${formatSom(deleting.amount)} от ${deleting.patient?.full_name ?? 'пациента'}. Долг пациента увеличится на эту сумму.`}
      </ConfirmDialog>
    </>
  )
}
