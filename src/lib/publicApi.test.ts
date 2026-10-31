import { describe, expect, test } from 'bun:test'
import { submitLead } from './publicApi'

const config = { url: 'https://demo.supabase.co', anonKey: 'anon-key' }

describe('submitLead', () => {
  test('posts a lead to the REST endpoint without asking for the row back', async () => {
    const calls: [string, RequestInit][] = []
    submitLead(
      {
        kind: 'booking',
        name: 'Айгерим',
        phone: '+996700123456',
        summary: '№36 — Кариес',
        estimate: 1500,
        preferredAt: '2026-09-21T08:00:00.000Z',
        lang: 'ru',
      },
      config,
      async (url, init) => {
        calls.push([url, init])
      },
    )

    expect(calls).toHaveLength(1)
    const [url, init] = calls[0]
    expect(url).toBe('https://demo.supabase.co/rest/v1/leads')
    expect(init.keepalive).toBe(true)
    expect(init.headers).toMatchObject({ apikey: 'anon-key', Prefer: 'return=minimal' })
    expect(JSON.parse(String(init.body))).toEqual({
      kind: 'booking',
      name: 'Айгерим',
      phone: '+996700123456',
      summary: '№36 — Кариес',
      estimate: 1500,
      preferred_at: '2026-09-21T08:00:00.000Z',
      lang: 'ru',
    })
  })

  test('does nothing without credentials and swallows network errors', async () => {
    let called = false
    submitLead({ kind: 'sos', lang: 'ky' }, { url: '', anonKey: '' }, async () => {
      called = true
    })
    expect(called).toBe(false)

    expect(() =>
      submitLead({ kind: 'sos', lang: 'ky' }, config, () => Promise.reject(new Error('offline'))),
    ).not.toThrow()
  })
})
