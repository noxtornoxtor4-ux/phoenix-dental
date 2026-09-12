interface SectionHeadingProps {
  eyebrow: string
  title: string
  subtitle?: string
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl leading-tight font-bold text-balance sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-pretty text-white/60 sm:text-base">{subtitle}</p>}
    </div>
  )
}
