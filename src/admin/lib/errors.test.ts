import { describe, expect, test } from 'bun:test'
import { describeError } from './errors'

describe('describeError', () => {
  test('explains booking conflicts', () => {
    expect(describeError({ code: '23P01', message: 'violates exclusion constraint "appointments_doctor_overlap"' })).toBe(
      'У врача уже есть запись на это время',
    )
    expect(describeError({ code: '23P01', message: 'violates exclusion constraint "appointments_chair_overlap"' })).toBe(
      'Кресло уже занято в это время',
    )
  })

  test('maps database and auth errors', () => {
    expect(describeError({ code: '42501', message: 'new row violates row-level security policy' })).toBe(
      'Недостаточно прав для этого действия',
    )
    expect(describeError({ code: '23514', message: 'violates check constraint "inventory_items_quantity_check"' })).toBe(
      'Недостаточно остатка на складе',
    )
    expect(describeError({ message: 'Invalid login credentials' })).toBe('Неверный email или пароль')
    expect(describeError(new TypeError('Failed to fetch'))).toBe('Нет соединения с сервером')
  })

  test('falls back to the original message', () => {
    expect(describeError({ message: 'Custom' })).toBe('Custom')
    expect(describeError(null)).toBe('Что-то пошло не так')
  })
})
