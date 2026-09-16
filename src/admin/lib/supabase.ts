import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabaseConfig } from '../../config/supabase'

// The admin app renders a configuration screen instead of calling this client when credentials are missing.
export const supabase = createClient(
  supabaseConfig.url || 'http://localhost:54321',
  supabaseConfig.anonKey || 'missing-anon-key',
)

export { isSupabaseConfigured }

/**
 * A throwaway client for creating staff accounts: signing up through it does not replace
 * the session of the administrator who is currently logged in.
 */
export function createSignupClient() {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'phoenix-signup' },
  })
}

/** Unwraps a Supabase response, throwing its error so React Query can handle it. */
export function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error
  return data as T
}
