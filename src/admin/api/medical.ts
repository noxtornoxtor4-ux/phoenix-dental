import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { ToothCondition, ToothRecord, Treatment } from '../types'

export function useToothRecords(patientId: string) {
  return useQuery({
    queryKey: ['tooth-records', patientId],
    queryFn: async () =>
      unwrap(await supabase.from('tooth_records').select('*').eq('patient_id', patientId)) as ToothRecord[],
  })
}

export function useSaveToothRecord(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tooth, condition, note }: { tooth: number; condition: ToothCondition; note: string }) => {
      // Healthy teeth without notes are not stored, keeping the chart sparse.
      if (condition === 'healthy' && !note) {
        unwrap(await supabase.from('tooth_records').delete().eq('patient_id', patientId).eq('tooth', tooth))
        return
      }
      unwrap(
        await supabase
          .from('tooth_records')
          .upsert({ patient_id: patientId, tooth, condition, note: note || null }, { onConflict: 'patient_id,tooth' }),
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tooth-records', patientId] }),
  })
}

export type TreatmentInput = Pick<
  Treatment,
  | 'patient_id'
  | 'doctor_id'
  | 'service_id'
  | 'appointment_id'
  | 'title'
  | 'tooth'
  | 'quantity'
  | 'price'
  | 'discount'
  | 'note'
  | 'performed_at'
>

export function useTreatments(patientId: string) {
  return useQuery({
    queryKey: ['treatments', 'patient', patientId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('treatments')
          .select('*')
          .eq('patient_id', patientId)
          .order('performed_at', { ascending: false }),
      ) as Treatment[],
  })
}

function useInvalidateMoney() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['treatments'] })
    queryClient.invalidateQueries({ queryKey: ['balances'] })
    queryClient.invalidateQueries({ queryKey: ['finance'] })
  }
}

export function useCreateTreatment() {
  const invalidate = useInvalidateMoney()
  return useMutation({
    mutationFn: async (input: TreatmentInput) => {
      unwrap(await supabase.from('treatments').insert(input))
    },
    onSuccess: invalidate,
  })
}

export function useDeleteTreatment() {
  const invalidate = useInvalidateMoney()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('treatments').delete().eq('id', id))
    },
    onSuccess: invalidate,
  })
}
