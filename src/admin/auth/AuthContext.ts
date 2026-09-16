import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'
import type { Staff } from '../types'

export interface AuthValue {
  /** Initial session check finished. */
  ready: boolean
  session: Session | null
  staff: Staff | null
  staffLoading: boolean
  staffError: unknown
  isAdmin: boolean
  /** The user opened a password reset link. */
  recovery: boolean
  finishRecovery: () => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)
