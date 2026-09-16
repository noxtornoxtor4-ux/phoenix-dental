import { createContext, use } from 'react'

export interface ToastApi {
  success: (message: string) => void
  error: (error: unknown) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast() {
  const value = use(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
