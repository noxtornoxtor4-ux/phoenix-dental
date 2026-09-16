import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Chair } from '../types'

export function useChairs() {
  return useQuery({
    queryKey: ['chairs'],
    queryFn: async () => unwrap(await supabase.from('chairs').select('*').order('sort').order('name')) as Chair[],
  })
}

export function useSaveChair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: Pick<Chair, 'name' | 'sort' | 'active'> }) => {
      unwrap(id ? await supabase.from('chairs').update(input).eq('id', id) : await supabase.from('chairs').insert(input))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chairs'] }),
  })
}
