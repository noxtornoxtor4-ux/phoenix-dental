import { Banknote, CreditCard, Plus, Smartphone, Wallet } from 'lucide-react'
import { useState } from 'react'
import { usePatientBalance, usePatientPayments } from '../../api/finance'
import { formatDateTime, formatSom } from '../../lib/dates'
import { paymentMethods } from '../../labels'
import type { Patient } from '../../types'
import { Button } from '../../ui/Button'
import { cardClass, EmptyState, ErrorState, LoadingBlock, StatCard } from '../../ui/primitives'
import { PaymentFormModal } from '../finance/PaymentFormModal'

const methodIcons = { cash: Banknote, card: CreditCard, transfer: Smartphone }

export function PaymentsTab({ patient }: { patient: Patient }) {
  const balance = usePatientBalance(patient.id)
  const payments = usePatientPayments(patient.id)
  const [paying, setPaying] = useState(false)

  if (balance.isPending || payments.isPending) return <LoadingBlock />
  if (balance.isError || payments.isError) {
    return (
      <ErrorState
        error={balance.error ?? payments.error}
        onRetry={() => {
          balance.refetch()
          payments.refetch()
        }}
      />
    )
  }

  const debt = balance.data.balance

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Лечение на сумму" value={formatSom(balance.data.billed)} />
        <StatCard icon={Banknote} label="Оплачено" value={formatSom(balance.data.paid)} color="#34D399" />
        <StatCard
          icon={Wallet}
          label={debt < 0 ? 'Аванс' : 'Долг'}
          value={formatSom(Math.abs(debt))}
          color={debt > 0 ? '#FBBF24' : '#34D399'}
        />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" icon={Plus} onClick={() => setPaying(true)}>
          Принять оплату
        </Button>
      </div>

      {payments.data.length === 0 ? (
        <EmptyState icon={Banknote} title="Оплат пока нет" />
      ) : (
        <ul className={`${cardClass} divide-y divide-white/5 overflow-hidden`}>
          {payments.data.map((payment) => {
            const Icon = methodIcons[payment.method]
            return (
              <li key={payment.id} className="flex items-center gap-3 px-4 py-3">
                <Icon className="size-4 text-white/40" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{paymentMethods[payment.method]}</p>
                  <p className="text-xs text-white/45">
                    {formatDateTime(payment.paid_at)}
                    {payment.note && ` · ${payment.note}`}
                  </p>
                </div>
                <span className="font-semibold text-emerald-400 tabular-nums">+{formatSom(payment.amount)}</span>
              </li>
            )
          })}
        </ul>
      )}

      <PaymentFormModal open={paying} patient={patient} onClose={() => setPaying(false)} />
    </div>
  )
}
