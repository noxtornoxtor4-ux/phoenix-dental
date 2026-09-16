import { isSupabaseConfigured, supabaseConfig } from '../config/supabase'

export interface LeadRequest {
  kind: 'booking' | 'sos'
  name?: string
  phone?: string
  summary?: string
  estimate?: number
  preferredAt?: string
  lang: 'ru' | 'ky' | 'en'
}

type Fetch = (input: string, init: RequestInit) => Promise<unknown>

/**
 * Sends a site request to the CRM through the Supabase REST API. The site stays
 * without the supabase-js bundle; WhatsApp remains the primary channel, so failures
 * are ignored. `keepalive` lets the request finish while the browser opens WhatsApp.
 */
export function submitLead(lead: LeadRequest, config = supabaseConfig, fetchImpl: Fetch = fetch): void {
  if (!config.url || !config.anonKey || (config === supabaseConfig && !isSupabaseConfigured)) return

  const body = {
    kind: lead.kind,
    name: lead.name?.slice(0, 120) ?? null,
    phone: lead.phone?.slice(0, 32) ?? null,
    summary: lead.summary?.slice(0, 1000) ?? null,
    estimate: lead.estimate ?? null,
    preferred_at: lead.preferredAt ?? null,
    lang: lead.lang,
  }

  fetchImpl(`${config.url}/rest/v1/leads`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  }).catch(() => undefined)
}
