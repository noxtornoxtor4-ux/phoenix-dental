interface LogoProps {
  subtitle?: string
}

export function Logo({ subtitle }: LogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <img src="/favicon.svg" alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-lg font-bold tracking-[0.12em] text-accent">PHOENIX</span>
        {subtitle && <span className="truncate text-[11px] text-muted">{subtitle}</span>}
      </span>
    </span>
  )
}
