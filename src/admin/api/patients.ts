import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Patient } from '../types'
import { buildPatientSearchFilter } from './patientSearch'

const PAGE_SIZE = 30

export type PatientInput = Pick<
  Patient,
  'full_name' | 'phone' | 'birth_date' | 'gender' | 'source' | 'allergies' | 'notes' | 'doctor_id'
>

export function usePatients(search: string) {
  return useInfiniteQuery({
    queryKey: ['patients', 'list', search],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      const filter = buildPatientSearchFilter(search)
      if (filter) query = query.or(filter)

      const { data, error, count } = await query
      if (error) throw error
      return { rows: data as Patient[], count: count ?? 0, from: pageParam }
    },
    getNextPageParam: (last) =>
      last.from + PAGE_SIZE < last.count ? last.from + PAGE_SIZE : undefined,
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patients', 'one', id],
    enabled: Boolean(id),
    queryFn: async () => unwrap(await supabase.from('patients').select('*').eq('id', id!).single()) as Patient,
  })
}

/** Quick lookup for pickers (schedule, payments). */
export function usePatientLookup(search: string) {
  return useQuery({
    queryKey: ['patients', 'lookup', search],
    enabled: search.trim().length >= 2,
    queryFn: async () => {
      const filter = buildPatientSearchFilter(search)
      if (!filter) return []
      return unwrap(
        await supabase.from('patients').select('*').or(filter).order('full_name').limit(8),
      ) as Patient[]
    },
  })
}

export async function findPatientsByPhone(phone: string): Promise<Patient[]> {
  return unwrap(await supabase.from('patients').select('*').eq('phone', phone).limit(3)) as Patient[]
}

export function useSavePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: PatientInput }) => {
      const request = id
        ? supabase.from('patients').update(input).eq('id', id)
        : supabase.from('patients').insert(input)
      return unwrap(await request.select().single()) as Patient
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.setQueryData(['patients', 'one', patient.id], patient)
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('patients').delete().eq('id', id))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })
}
