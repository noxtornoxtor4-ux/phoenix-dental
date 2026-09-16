interface ErrorLike {
  code?: string
  message?: string
}

const byCode: Record<string, string> = {
  '42501': 'Недостаточно прав для этого действия',
  '23514': 'Проверьте правильность заполнения полей',
  '23503': 'Запись связана с другими данными и не может быть удалена',
  '23505': 'Такая запись уже существует',
  PGRST116: 'Запись не найдена или недоступна',
}

/** Turns Supabase / Postgres / network errors into a message for clinic staff. */
export function describeError(error: unknown): string {
  const { code, message = '' } = (error ?? {}) as ErrorLike

  if (code === '23P01') {
    return message.includes('chair') ? 'Кресло уже занято в это время' : 'У врача уже есть запись на это время'
  }
  if (message.includes('active administrator')) return 'Должен остаться хотя бы один активный администратор'
  if (message.includes('inventory_items_quantity_check')) return 'Недостаточно остатка на складе'
  if (message.includes('treatments_discount_limit')) return 'Скидка не может быть больше суммы'
  if (code && byCode[code]) return byCode[code]

  if (message.includes('Invalid login credentials')) return 'Неверный email или пароль'
  if (message.includes('Email not confirmed')) return 'Email не подтверждён — откройте письмо от Supabase'
  if (message.includes('User already registered')) return 'Пользователь с таким email уже существует'
  if (/password.*(at least|characters)/i.test(message)) return 'Пароль слишком короткий — минимум 6 символов'
  if (message.includes('rate limit')) return 'Слишком много попыток, попробуйте чуть позже'
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) return 'Нет соединения с сервером'

  return message || 'Что-то пошло не так'
}
