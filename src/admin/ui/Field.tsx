import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const controlClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition [color-scheme:dark] placeholder:text-white/30 focus:border-accent focus:bg-white/10 disabled:opacity-50'

interface FieldProps {
  label: string
  hint?: string
  error?: string | null
  className?: string
  children: ReactNode
}

export function Field({ label, hint, error, className = '', children }: FieldProps) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-white/60">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-sos">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-white/40">{hint}</span>
      )}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-11 ${controlClass} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`h-11 ${controlClass} [&>option]:bg-navy-800 ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`min-h-24 py-2.5 ${controlClass} ${className}`} {...props} />
}
