import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { describeError } from '../lib/errors'
import { ToastContext, type ToastApi } from './toastContext'

interface Toast {
  id: number
  tone: 'success' | 'error'
  message: string
}

const LIFETIME_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { id, tone, message }])
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), LIFETIME_MS)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (error) => push('error', describeError(error)),
    }),
    [push],
  )

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className="glass flex w-full max-w-sm animate-rise items-center gap-3 rounded-2xl bg-navy-800/95 px-4 py-3 text-sm shadow-2xl shadow-black/50"
          >
            {toast.tone === 'success' ? (
              <CircleCheck className="size-5 shrink-0 text-emerald-400" />
            ) : (
              <TriangleAlert className="size-5 shrink-0 text-sos" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
