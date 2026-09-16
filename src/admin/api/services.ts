import { useQuery } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Service } from '../types'

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () =>
      unwrap(await supabase.from('services').select('*').order('sort').order('name')) as Service[],
  })
}
