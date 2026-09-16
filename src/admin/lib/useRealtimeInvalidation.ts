import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from './supabase'

/** Refetches queries under `queryKey` whenever rows of `table` change (RLS still applies). */
export function useRealtimeInvalidation(table: string, queryKey: readonly unknown[]) {
  const queryClient = useQueryClient()
  const key = JSON.stringify(queryKey)

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        queryClient.invalidateQueries({ queryKey: JSON.parse(key) })
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, key, queryClient])
}
