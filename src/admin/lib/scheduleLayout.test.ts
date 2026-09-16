import { describe, expect, test } from 'bun:test'
import { assignLanes, gridBounds, snapMinutes } from './scheduleLayout'

const item = (id: string, start: number, end: number) => ({ id, start, end })

describe('assignLanes', () => {
  test('keeps sequential items in one lane', () => {
    const lanes = assignLanes([item('a', 600, 660), item('b', 660, 720)])
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 1 })
    expect(lanes.get('b')).toEqual({ lane: 0, lanes: 1 })
  })

  test('splits overlapping items and reuses freed lanes within a cluster', () => {
    const lanes = assignLanes([
      item('a', 600, 720),
      item('b', 630, 660),
      item('c', 670, 700),
      item('d', 800, 830),
    ])
    expect(lanes.get('a')).toEqual({ lane: 0, lanes: 2 })
    expect(lanes.get('b')).toEqual({ lane: 1, lanes: 2 })
    expect(lanes.get('c')).toEqual({ lane: 1, lanes: 2 })
    expect(lanes.get('d')).toEqual({ lane: 0, lanes: 1 })
  })
})

describe('grid helpers', () => {
  test('covers working hours and out-of-hours items', () => {
    expect(gridBounds(540, 1080, [])).toEqual({ start: 540, end: 1080 })
    expect(gridBounds(540, 1080, [item('late', 1110, 1170), item('early', 500, 530)])).toEqual({ start: 480, end: 1200 })
  })

  test('snaps to a step', () => {
    expect(snapMinutes(607)).toBe(600)
    expect(snapMinutes(608)).toBe(615)
  })
})
