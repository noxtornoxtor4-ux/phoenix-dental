import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Lead, LeadStatus, Patient } from '../types'
import { findPatientsByPhone } from './patients'

export const leadStatusOrder: LeadStatus[] = ['new', 'contacted', 'booked', 'rejected']

export function useLeads(status: LeadStatus | 'all', enabled = true) {
  return useQuery({
    queryKey: ['leads', 'list', status],
    enabled,
    queryFn: async () => {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200)
      if (status !== 'all') query = query.eq('status', status)
      return unwrap(await query) as Lead[]
    },
  })
}

export function useLeadCounts(enabled = true) {
  return useQuery({
    queryKey: ['leads', 'counts'],
    enabled,
    queryFn: async () => {
      const results = await Promise.all(
        leadStatusOrder.map((status) =>
          supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', status),
        ),
      )
      const counts = {} as Record<LeadStatus, number>
      leadStatusOrder.forEach((status, index) => {
        const { count, error } = results[index]
        if (error) throw error
        counts[status] = count ?? 0
      })
      return counts
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<Lead, 'status' | 'note' | 'patient_id' | 'handled_by'>> }) => {
      unwrap(await supabase.from('leads').update(patch).eq('id', id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

/** Finds the patient by the lead phone or creates one from the lead contacts. */
export async function ensurePatientForLead(lead: Lead): Promise<Patient | null> {
  if (!lead.phone || !lead.name) return null
  const [existing] = await findPatientsByPhone(lead.phone)
  if (existing) return existing
  return unwrap(
    await supabase
      .from('patients')
      .insert({ full_name: lead.name, phone: lead.phone, source: 'site' })
      .select()
      .single(),
  ) as Patient
}
