import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Service } from '../types'

export type ServiceInput = Pick<
  Service,
  'name' | 'category' | 'scope' | 'price' | 'duration_minutes' | 'color' | 'sort' | 'active'
>

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () =>
      unwrap(await supabase.from('services').select('*').order('sort').order('name')) as Service[],
  })
}

export function useSaveService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ServiceInput }) => {
      unwrap(id ? await supabase.from('services').update(input).eq('id', id) : await supabase.from('services').insert(input))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      unwrap(await supabase.from('services').delete().eq('id', id))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })
}
