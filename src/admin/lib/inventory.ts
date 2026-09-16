import type { InventoryItem, InventoryReason } from '../types'

const round = (value: number) => Math.round(value * 100) / 100

/**
 * Stock change for a movement form. `amount` is a positive quantity, except for
 * a correction where it is the counted stock that replaces the current quantity.
 */
export function movementDelta(reason: InventoryReason, amount: number, currentQuantity: number): number {
  switch (reason) {
    case 'purchase':
      return round(amount)
    case 'usage':
    case 'writeoff':
      return round(-amount)
    case 'correction':
      return round(amount - currentQuantity)
  }
}

export function isLowStock(item: Pick<InventoryItem, 'quantity' | 'min_quantity'>): boolean {
  return item.quantity <= item.min_quantity
}

export function formatQuantity(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '').replace('.', ',')
}
