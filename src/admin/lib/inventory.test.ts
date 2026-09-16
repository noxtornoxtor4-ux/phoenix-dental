import { describe, expect, test } from 'bun:test'
import { formatQuantity, isLowStock, movementDelta } from './inventory'

describe('inventory', () => {
  test('turns form values into stock changes', () => {
    expect(movementDelta('purchase', 10, 3)).toBe(10)
    expect(movementDelta('usage', 1.5, 3)).toBe(-1.5)
    expect(movementDelta('writeoff', 2, 3)).toBe(-2)
    expect(movementDelta('correction', 7, 3)).toBe(4)
    expect(movementDelta('correction', 0.1, 0.3)).toBe(-0.2)
  })

  test('flags low stock at or below the minimum', () => {
    expect(isLowStock({ quantity: 2, min_quantity: 2 })).toBe(true)
    expect(isLowStock({ quantity: 3, min_quantity: 2 })).toBe(false)
  })

  test('formats quantities', () => {
    expect(formatQuantity(5)).toBe('5')
    expect(formatQuantity(2.5)).toBe('2,5')
    expect(formatQuantity(0.25)).toBe('0,25')
  })
})
