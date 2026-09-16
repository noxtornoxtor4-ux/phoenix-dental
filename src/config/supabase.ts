/** Public Supabase credentials. The anon key is designed to be shipped to browsers; access is enforced by RLS. */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
}

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey)
