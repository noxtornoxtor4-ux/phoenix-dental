import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Period } from '../lib/finance'
import { supabase, unwrap } from '../lib/supabase'
import type { Lead, Patient } from '../types'

const range = (period: Period) => [period.from.toISOString(), period.to.toISOString()] as const

export function useNewPatientsInPeriod(period: Period) {
  return useQuery({
    queryKey: ['analytics', 'patients', ...range(period)],
    placeholderData: keepPreviousData,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('patients')
          .select('id, source, created_at')
          .gte('created_at', period.from.toISOString())
          .lt('created_at', period.to.toISOString()),
      ) as Pick<Patient, 'id' | 'source' | 'created_at'>[],
  })
}

export function useLeadsInPeriod(period: Period) {
  return useQuery({
    queryKey: ['analytics', 'leads', ...range(period)],
    placeholderData: keepPreviousData,
    queryFn: async () =>
      unwrap(
        await supabase
          .from('leads')
          .select('id, kind, status, created_at')
          .gte('created_at', period.from.toISOString())
          .lt('created_at', period.to.toISOString()),
      ) as Pick<Lead, 'id' | 'kind' | 'status' | 'created_at'>[],
  })
}
