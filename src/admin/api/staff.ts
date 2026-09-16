import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSignupClient, supabase, unwrap } from '../lib/supabase'
import type { Staff } from '../types'

export type StaffInput = Pick<Staff, 'full_name' | 'role' | 'specialty' | 'phone' | 'color' | 'active'>

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

export function useSaveStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<StaffInput> }) => {
      unwrap(await supabase.from('staff').update(input).eq('id', id))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export class StaffAccountExistsError extends Error {
  constructor() {
    super('Пользователь с таким email уже существует')
  }
}

/**
 * Registers a staff account with a separate client (the admin stays signed in),
 * then fills the profile the database trigger created and activates it.
 */
export function useCreateStaffAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, password, input }: { email: string; password: string; input: StaffInput }) => {
      const { data, error } = await createSignupClient().auth.signUp({
        email,
        password,
        options: { data: { full_name: input.full_name }, emailRedirectTo: `${location.origin}/admin` },
      })
      if (error) throw error
      // Supabase hides existing accounts behind a user without identities.
      if (!data.user || data.user.identities?.length === 0) throw new StaffAccountExistsError()

      unwrap(await supabase.from('staff').update(input).eq('id', data.user.id))
      return { needsConfirmation: !data.session }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}
