import type { ReactNode } from 'react'

/** Centered card used by the login, password and pending account screens. */
export function AuthScreen({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]" />
      </div>
      <div className="w-full max-w-sm animate-rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/favicon.svg" alt="" className="size-16 rounded-2xl shadow-glow" />
          <p className="mt-4 font-display text-xl font-bold tracking-[0.18em]">PHOENIX</p>
          <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">CRM</p>
        </div>
        <div className="glass rounded-3xl bg-ink-800/60 p-6">
          <h1 className="font-display text-lg font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/55">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
