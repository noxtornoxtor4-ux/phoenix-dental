import { Banknote, CreditCard, HandCoins, Plus, ReceiptText, Smartphone, Trash, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { formatPhone } from '../../../lib/phone'
import { useDebtors, useDeletePayment, usePaymentsInPeriod, useTreatmentsInPeriod, type PaymentWithPatient } from '../../api/finance'
import { useStaffById } from '../../api/staff'
import { formatDateTime, formatSom } from '../../lib/dates'
import { summarizeFinance } from '../../lib/finance'
import { paymentMethods } from '../../labels'
import type { Patient, PaymentMethod } from '../../types'
import { Button } from '../../ui/Button'
import { BarList } from '../../ui/charts/BarList'
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
              <BarList
                items={(Object.keys(paymentMethods) as PaymentMethod[]).map((method) => ({
                  key: method,
                  label: paymentMethods[method],
                  value: summary.byMethod[method],
                }))}
                formatValue={formatSom}
              />
            </section>

            <section className={`${cardClass} p-5`}>
              <h2 className="mb-4 font-semibold">Выручка по врачам</h2>
              <BarList
                items={summary.byDoctor.map((row) => ({
                  key: row.doctorId,
                  label: staffById.get(row.doctorId)?.full_name || 'Врач',
                  dotColor: staffById.get(row.doctorId)?.color,
                  value: row.total,
                  hint: `${row.count} проц.`,
                }))}
                formatValue={formatSom}
                empty="За период процедур нет"
              />
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
