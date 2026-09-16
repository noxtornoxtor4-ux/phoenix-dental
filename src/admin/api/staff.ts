import { useQuery } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { Staff } from '../types'

export function useStaff() {
  return useQuery({
    queryKey: ['staff', 'list'],
    queryFn: async () => unwrap(await supabase.from('staff').select('*').order('full_name')) as Staff[],
  })
}

/** Staff indexed by id, for rendering names in lists. */
export function useStaffById() {
  const { data } = useStaff()
  return new Map((data ?? []).map((member) => [member.id, member]))
}
