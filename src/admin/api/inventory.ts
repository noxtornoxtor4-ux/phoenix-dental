import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, unwrap } from '../lib/supabase'
import type { InventoryItem, InventoryMovement } from '../types'

export type InventoryItemInput = Pick<InventoryItem, 'name' | 'category' | 'unit' | 'min_quantity' | 'cost' | 'active'>
export type MovementInput = Pick<InventoryMovement, 'item_id' | 'delta' | 'reason' | 'note' | 'created_by'>

export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory', 'items'],
    queryFn: async () =>
      unwrap(await supabase.from('inventory_items').select('*').order('name')) as InventoryItem[],
  })
}

export function useItemMovements(itemId: string | null) {
  return useQuery({
    queryKey: ['inventory', 'movements', itemId],
    enabled: Boolean(itemId),
    queryFn: async () =>
      unwrap(
        await supabase
          .from('inventory_movements')
          .select('*')
          .eq('item_id', itemId!)
          .order('created_at', { ascending: false })
          .limit(50),
      ) as InventoryMovement[],
  })
}

function useInvalidateInventory() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['inventory'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useSaveInventoryItem() {
  const invalidate = useInvalidateInventory()
  return useMutation({
    mutationFn: async ({ id, input, initialQuantity = 0, staffId }: { id?: string; input: InventoryItemInput; initialQuantity?: number; staffId?: string }) => {
      if (id) {
        unwrap(await supabase.from('inventory_items').update(input).eq('id', id))
        return
      }
      const item = unwrap(await supabase.from('inventory_items').insert(input).select().single()) as InventoryItem
      // Opening stock goes through a movement so it shows up in the history.
      if (initialQuantity > 0 && staffId) {
        unwrap(
          await supabase.from('inventory_movements').insert({
            item_id: item.id,
            delta: initialQuantity,
            reason: 'purchase',
            note: 'Начальный остаток',
            created_by: staffId,
          }),
        )
      }
    },
    onSuccess: invalidate,
  })
}

export function useAddMovement() {
  const invalidate = useInvalidateInventory()
  return useMutation({
    mutationFn: async (input: MovementInput) => {
      unwrap(await supabase.from('inventory_movements').insert(input))
    },
    onSuccess: invalidate,
  })
}
