import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Appointment, AppointmentStatus, Patient } from '../types'

export type AppointmentWithPatient = Appointment & {
  patient: Pick<Patient, 'id' | 'full_name' | 'phone' | 'allergies'> | null
}

export type AppointmentInput = Pick<
  Appointment,
  'patient_id' | 'doctor_id' | 'chair_id' | 'starts_at' | 'ends_at' | 'status' | 'note' | 'lead_id'
>

const WITH_PATIENT = '*, patient:patients(id, full_name, phone, allergies)'

export function useAppointments(from: Date, to: Date) {
  return useQuery({
    queryKey: ['appointments', 'range', from.toISOString(), to.toISOString()],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('appointments')
          .select(WITH_PATIENT)
          .gte('starts_at', from.toISOString())
          .lt('starts_at', to.toISOString())
          .order('starts_at'),
      ) as AppointmentWithPatient[],
  })
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: async () =>
      unwrap(
        await supabase
          .from('appointments')
          .select(WITH_PATIENT)
          .eq('patient_id', patientId)
          .order('starts_at', { ascending: false }),
      ) as AppointmentWithPatient[],
  })
}

function useInvalidateAppointments() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useSaveAppointment() {
  const invalidate = useInvalidateAppointments()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: AppointmentInput }) => {
      const request = id
        ? supabase.from('appointments').update(input).eq('id', id)
        : supabase.from('appointments').insert(input)
      return unwrap(await request.select().single()) as Appointment
    },
    onSuccess: invalidate,
  })
}

export function useSetAppointmentStatus() {
  const invalidate = useInvalidateAppointments()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      unwrap(await supabase.from('appointments').update({ status }).eq('id', id))
    },
    onSuccess: invalidate,
  })
}

export function useDeleteAppointment() {
  const invalidate = useInvalidateAppointments()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('appointments').delete().eq('id', id))
    },
    onSuccess: invalidate,
  })
}
