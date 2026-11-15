import { describe, expect, test } from 'bun:test'
import { openingSchedule } from './schedule'

const labels = {
  weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  dayOff: 'выходной',
}

const line = (days: string, hours: string, closed = false) => ({ days, hours, closed })

describe('openingSchedule', () => {
  test('reads the clinic week the way the address card shows it', () => {
    expect(openingSchedule(labels)).toEqual([
      line('Пн–Пт', '09:00–17:00'),
      line('Сб', '09:00–14:00'),
      line('Вс', 'выходной', true),
    ])
  })

  test('joins every day of a week with the same hours', () => {
    const always = { open: '08:00', close: '20:00' }
    expect(openingSchedule(labels, () => always)).toEqual([line('Пн–Вс', '08:00–20:00')])
  })

  test('breaks the range on a day off in the middle of the week', () => {
    const hours = { open: '09:00', close: '17:00' }
    const closedOnWednesday = (day: number) => (day === 3 || day === 0 ? null : hours)

    expect(openingSchedule(labels, closedOnWednesday)).toEqual([
      line('Пн–Вт', '09:00–17:00'),
      line('Ср', 'выходной', true),
      line('Чт–Сб', '09:00–17:00'),
      line('Вс', 'выходной', true),
    ])
  })
})
