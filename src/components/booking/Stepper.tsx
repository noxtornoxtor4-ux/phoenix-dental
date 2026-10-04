import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`flex min-w-0 items-center gap-2 ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                done
                  ? 'bg-accent text-ink-900'
                  : active
                    ? 'bg-white text-ink-900 shadow-glow'
                    : 'bg-white/10 text-white/50'
              }`}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span
              className={`truncate text-xs font-semibold ${active ? 'text-white' : 'hidden text-white/45 sm:inline'}`}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className={`h-px min-w-4 flex-1 transition ${done ? 'bg-accent' : 'bg-white/10'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
