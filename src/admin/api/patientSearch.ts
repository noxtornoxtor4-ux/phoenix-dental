/**
 * PostgREST `or` filter for the patient search box: by name, and by phone when
 * the query contains digits. Returns null for an empty query.
 */
export function buildPatientSearchFilter(search: string): string | null {
  const text = search.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return null

  const filters = [`full_name.ilike."*${text}*"`]
  let digits = search.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length >= 3) filters.push(`phone.ilike."*${digits}*"`)
  return filters.join(',')
}
