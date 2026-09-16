import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase, unwrap } from '../lib/supabase'
import type { Staff } from '../types'
import { AuthContext, type AuthValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    // Supabase warns against awaiting its own calls inside this callback.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') queryClient.clear()
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const userId = session?.user.id
  const staffQuery = useQuery({
    queryKey: ['staff', 'me', userId],
    enabled: Boolean(userId),
    queryFn: async () =>
      unwrap(await supabase.from('staff').select('*').eq('id', userId!).maybeSingle()) as Staff | null,
  })

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const finishRecovery = useCallback(() => setRecovery(false), [])

  const staff = staffQuery.data ?? null
  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      staff,
      staffLoading: staffQuery.isPending && Boolean(userId),
      staffError: staffQuery.error,
      isAdmin: Boolean(staff?.active && staff.role === 'admin'),
      recovery,
      finishRecovery,
      signOut,
    }),
    [ready, session, staff, staffQuery.isPending, staffQuery.error, userId, recovery, finishRecovery, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
