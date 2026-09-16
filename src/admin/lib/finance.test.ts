import { describe, expect, test } from 'bun:test'
import type { Payment, Treatment } from '../types'
import { toDateInput } from './dates'
import { presetPeriod, summarizeFinance } from './finance'

const payment = (amount: number, method: Payment['method']): Payment => ({
  id: `${amount}-${method}`,
  patient_id: 'p',
  amount,
  method,
  note: null,
  paid_at: '2026-09-16T10:00:00Z',
  received_by: null,
  created_at: '2026-09-16T10:00:00Z',
})

const treatment = (doctorId: string, total: number): Treatment => ({
  id: `${doctorId}-${total}`,
  patient_id: 'p',
  appointment_id: null,
  doctor_id: doctorId,
  service_id: null,
  title: 'X',
  tooth: null,
  quantity: 1,
  price: total,
  discount: 0,
  total,
  note: null,
  performed_at: '2026-09-16T10:00:00Z',
  created_at: '2026-09-16T10:00:00Z',
})

describe('presetPeriod', () => {
  // 2026-09-16 is a Wednesday.
  const now = new Date(2026, 8, 16, 15, 30)

  test('builds day, week and month ranges with exclusive ends', () => {
    const range = (preset: 'today' | 'week' | 'month') => {
      const { from, to } = presetPeriod(preset, now)
      return [toDateInput(from), toDateInput(to)]
    }
    expect(range('today')).toEqual(['2026-09-16', '2026-09-17'])
    expect(range('week')).toEqual(['2026-09-14', '2026-09-21'])
    expect(range('month')).toEqual(['2026-09-01', '2026-10-01'])
  })
})

describe('summarizeFinance', () => {
  test('splits cash by method and revenue by doctor', () => {
    const summary = summarizeFinance(
      [payment(1500.5, 'cash'), payment(2000, 'card'), payment(499.5, 'cash')],
      [treatment('a', 3000), treatment('b', 6000), treatment('a', 1500)],
    )

    expect(summary.received).toBe(4000)
    expect(summary.byMethod).toEqual({ cash: 2000, card: 2000, transfer: 0 })
    expect(summary.billed).toBe(10500)
    expect(summary.byDoctor).toEqual([
      { doctorId: 'b', total: 6000, count: 1 },
      { doctorId: 'a', total: 4500, count: 2 },
    ])
    expect(summary.averageCheck).toBe(1333)
  })

  test('handles an empty period', () => {
    expect(summarizeFinance([], []).averageCheck).toBe(0)
  })
})
