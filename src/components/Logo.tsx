interface LogoProps {
  subtitle?: string
}

/** The brand lockup: the phoenix mark, the wordmark and either the address or the descriptor. */
export function Logo({ subtitle }: LogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <img src="/logo-mark.svg" alt="" width={38} height={38} className="size-9 shrink-0" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-lg leading-none font-bold tracking-tight text-cream">Phoenix</span>
        {subtitle ? (
          <span className="mt-1 truncate text-[11px] text-muted">{subtitle}</span>
        ) : (
          <span className="mt-1 text-[10px] font-semibold tracking-[0.28em] text-muted uppercase">Dental Studio</span>
        )}
      </span>
    </span>
  )
}
