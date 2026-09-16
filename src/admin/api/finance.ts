import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Period } from '../lib/finance'
import { supabase, unwrap } from '../lib/supabase'
import type { Patient, Payment, PatientBalance, Treatment } from '../types'

export type PaymentWithPatient = Payment & { patient: Pick<Patient, 'id' | 'full_name'> | null }
export type DebtorRow = PatientBalance & { patient: Pick<Patient, 'id' | 'full_name' | 'phone'> | undefined }

const periodKey = (period: Period) => [period.from.toISOString(), period.to.toISOString()]

export function usePaymentsInPeriod(period: Period) {
  return useQuery({
    queryKey: ['finance', 'payments', ...periodKey(period)],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('payments')
          .select('*, patient:patients(id, full_name)')
          .gte('paid_at', period.from.toISOString())
          .lt('paid_at', period.to.toISOString())
          .order('paid_at', { ascending: false }),
      ) as PaymentWithPatient[],
  })
}

export function useTreatmentsInPeriod(period: Period) {
  return useQuery({
    queryKey: ['finance', 'treatments', ...periodKey(period)],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('treatments')
          .select('*')
          .gte('performed_at', period.from.toISOString())
          .lt('performed_at', period.to.toISOString()),
      ) as Treatment[],
  })
}

export function useDebtors(limit = 50) {
  return useQuery({
    queryKey: ['balances', 'debtors', limit],
    queryFn: async () => {
      const balances = unwrap(
        await supabase
          .from('patient_balances')
          .select('*')
          .gt('balance', 0)
          .order('balance', { ascending: false })
          .limit(limit),
      ) as PatientBalance[]
      if (balances.length === 0) return { rows: [] as DebtorRow[], total: 0 }

      const patients = unwrap(
        await supabase
          .from('patients')
          .select('id, full_name, phone')
          .in(
            'id',
            balances.map((row) => row.patient_id),
          ),
      ) as Pick<Patient, 'id' | 'full_name' | 'phone'>[]
      const byId = new Map(patients.map((patient) => [patient.id, patient]))
      return {
        rows: balances.map((row) => ({ ...row, patient: byId.get(row.patient_id) })),
        total: balances.reduce((sum, row) => sum + row.balance, 0),
      }
    },
  })
}

export function usePatientBalance(patientId: string, enabled = true) {
  return useQuery({
    queryKey: ['balances', 'patient', patientId],
    enabled,
    queryFn: async () =>
      (unwrap(
        await supabase.from('patient_balances').select('*').eq('patient_id', patientId).maybeSingle(),
      ) as PatientBalance | null) ?? { patient_id: patientId, billed: 0, paid: 0, balance: 0 },
  })
}

export function usePatientPayments(patientId: string) {
  return useQuery({
    queryKey: ['finance', 'patient-payments', patientId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('payments')
          .select('*')
          .eq('patient_id', patientId)
          .order('paid_at', { ascending: false }),
      ) as Payment[],
  })
}

export type PaymentInput = Pick<Payment, 'patient_id' | 'amount' | 'method' | 'note' | 'paid_at'>

function useInvalidateFinance() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['finance'] })
    queryClient.invalidateQueries({ queryKey: ['balances'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreatePayment() {
  const invalidate = useInvalidateFinance()
  return useMutation({
    mutationFn: async (input: PaymentInput) => {
      unwrap(await supabase.from('payments').insert(input))
    },
    onSuccess: invalidate,
  })
}

export function useDeletePayment() {
  const invalidate = useInvalidateFinance()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('payments').delete().eq('id', id))
    },
    onSuccess: invalidate,
  })
}
