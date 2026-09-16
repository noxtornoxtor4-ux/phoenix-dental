import type { Payment, PaymentMethod, Treatment } from '../types'
import { addDays, startOfDay, startOfMonth, startOfWeek } from './dates'

export type PeriodPreset = 'today' | 'week' | 'month' | 'custom'

export interface Period {
  from: Date
  /** Exclusive end. */
  to: Date
}

export function presetPeriod(preset: Exclude<PeriodPreset, 'custom'>, now = new Date()): Period {
  const today = startOfDay(now)
  switch (preset) {
    case 'today':
      return { from: today, to: addDays(today, 1) }
    case 'week':
      return { from: startOfWeek(today), to: addDays(startOfWeek(today), 7) }
    case 'month': {
      const from = startOfMonth(today)
      return { from, to: new Date(from.getFullYear(), from.getMonth() + 1, 1) }
    }
  }
}

export interface DoctorRevenue {
  doctorId: string
  total: number
  count: number
}

export interface FinanceSummary {
  received: number
  byMethod: Record<PaymentMethod, number>
  billed: number
  byDoctor: DoctorRevenue[]
  paymentsCount: number
  averageCheck: number
}

const round = (value: number) => Math.round(value * 100) / 100

export function summarizeFinance(payments: Payment[], treatments: Treatment[]): FinanceSummary {
  const byMethod: Record<PaymentMethod, number> = { cash: 0, card: 0, transfer: 0 }
  for (const payment of payments) byMethod[payment.method] = round(byMethod[payment.method] + payment.amount)
  const received = round(payments.reduce((sum, payment) => sum + payment.amount, 0))

  const doctors = new Map<string, DoctorRevenue>()
  for (const treatment of treatments) {
    const entry = doctors.get(treatment.doctor_id) ?? { doctorId: treatment.doctor_id, total: 0, count: 0 }
    entry.total = round(entry.total + treatment.total)
    entry.count += 1
    doctors.set(treatment.doctor_id, entry)
  }

  return {
    received,
    byMethod,
    billed: round(treatments.reduce((sum, treatment) => sum + treatment.total, 0)),
    byDoctor: [...doctors.values()].sort((a, b) => b.total - a.total),
    paymentsCount: payments.length,
    averageCheck: payments.length > 0 ? Math.round(received / payments.length) : 0,
  }
}
