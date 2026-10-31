import { ChevronRight, MessageCircleQuestion, UserRound, UserRoundCheck } from 'lucide-react'
import { paths, type PathId } from '../../data/questionnaire'
import { useI18n } from '../../i18n/useI18n'

const icons: Record<PathId, typeof UserRound> = {
  first: UserRound,
  returning: UserRoundCheck,
  question: MessageCircleQuestion,
}

interface PathChoiceProps {
  value: PathId | null
  onChange: (path: PathId) => void
}

/** Step 1: the greeting and the three ways into the form. */
export function PathChoice({ value, onChange }: PathChoiceProps) {
  const { t } = useI18n()

  return (
    <div>
      <p className="text-sm text-pretty text-white/70 sm:text-base">{t.booking.greeting}</p>
      <p className="mt-5 mb-3 text-sm font-semibold text-white/70">{t.booking.pathTitle}</p>

      <div className="grid gap-2">
        {paths.map((path) => {
          const Icon = icons[path]
          const active = value === path
          return (
            <button
              key={path}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(path)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] ${
                active ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-full ${
                  active ? 'bg-accent text-ink-900' : 'bg-accent/10 text-accent'
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block font-semibold ${active ? 'text-accent' : ''}`}>{t.booking.paths[path].label}</span>
                <span className="block text-xs text-white/50">{t.booking.paths[path].hint}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-white/30" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
