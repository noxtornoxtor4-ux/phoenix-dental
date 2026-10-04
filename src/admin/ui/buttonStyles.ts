export const variants = {
  primary: 'bg-accent font-bold text-ink-900 shadow-glow hover:bg-accent-300 disabled:shadow-none',
  secondary: 'border border-white/10 bg-white/5 font-semibold text-white hover:bg-white/10',
  ghost: 'font-semibold text-white/70 hover:bg-white/10 hover:text-white',
  danger: 'bg-sos/15 font-semibold text-sos hover:bg-sos/25',
}

export const sizes = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-sm',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  icon: 'size-10 rounded-xl',
}

const base =
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40'

/** Button look for links (`<a>`, `<Link>`) that must not contain a nested <button>. */
export function buttonClass(variant: keyof typeof variants = 'secondary', size: keyof typeof sizes = 'md') {
  return `${base} ${variants[variant]} ${sizes[size]}`
}
