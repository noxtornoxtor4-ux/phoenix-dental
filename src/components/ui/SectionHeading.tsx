interface SectionHeadingProps {
  /** The small line above the title; left out where the title speaks for itself. */
  eyebrow?: string
  title: string
  subtitle?: string
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>}
      <h2 className={`font-display text-2xl leading-tight font-bold text-balance sm:text-4xl ${eyebrow ? 'mt-3' : ''}`}>
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-sm text-pretty text-muted sm:text-base">{subtitle}</p>}
    </div>
  )
}
