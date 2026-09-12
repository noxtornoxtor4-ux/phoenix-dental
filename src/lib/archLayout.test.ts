import { describe, expect, test } from 'bun:test'
import { getToothKind, teethByJaw } from '../data/teeth'
import { layoutArch } from './archLayout'

const geometry = { cx: 170, cy: 230, rx: 128, ry: 190, gap: 3, labelOffset: 12 }

describe('teeth', () => {
  test('uses FDI numbering in viewer order', () => {
    expect(teethByJaw.upper).toEqual([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28])
    expect(teethByJaw.lower).toEqual([48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38])
    expect(getToothKind(13)).toBe('canine')
    expect(getToothKind(36)).toBe('molar')
  })
})

describe('layoutArch', () => {
  test('places the upper arch with incisors on top and mirrored halves', () => {
    const placements = layoutArch(teethByJaw.upper, 'upper', geometry)
    const byNumber = new Map(placements.map((p) => [p.number, p]))

    expect(placements).toHaveLength(16)
    expect(byNumber.get(11)!.y).toBeLessThan(byNumber.get(18)!.y)
    expect(byNumber.get(11)!.x + byNumber.get(21)!.x).toBeCloseTo(2 * geometry.cx, 0)
    expect(byNumber.get(16)!.width).toBeGreaterThan(byNumber.get(11)!.width)
  })

  test('places the lower arch with incisors at the bottom', () => {
    const placements = layoutArch(teethByJaw.lower, 'lower', { ...geometry, cy: 40 })
    const byNumber = new Map(placements.map((p) => [p.number, p]))

    expect(byNumber.get(41)!.y).toBeGreaterThan(byNumber.get(48)!.y)
    expect(byNumber.get(41)!.labelY).toBeGreaterThan(byNumber.get(41)!.y)
  })
})
