import { CalendarPlus, ChevronRight, MessageCircleQuestion, UserRound, UserRoundCheck } from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { firstVisitPaths, type PathId } from '../../data/questionnaire'
import { useI18n } from '../../i18n/useI18n'

type IconComponent = ComponentType<{ className?: string }>

const icons: Record<PathId, IconComponent> = {
  booking: CalendarPlus,
  ask: MessageCircleQuestion,
  returning: UserRoundCheck,
}

interface PathChoiceProps {
  value: PathId | null
  onChange: (path: PathId) => void
}

/** Step 1: the greeting, then the way into the form. A first visit unfolds into book or ask. */
export function PathChoice({ value, onChange }: PathChoiceProps) {
  const { t } = useI18n()
  // Coming back from the next step reopens the branch the visitor is already on.
  const [firstVisit, setFirstVisit] = useState(value !== null && value !== 'returning')

  return (
    <div>
      <p className="text-sm text-pretty text-muted sm:text-base">{t.booking.greeting}</p>
      <p className="mt-5 mb-3 text-sm font-semibold text-muted">{t.booking.pathTitle}</p>

      <div className="grid gap-2">
        <PathCard
          icon={UserRound}
          label={t.booking.firstVisit.label}
          hint={t.booking.firstVisit.hint}
          active={firstVisit}
          onClick={() => setFirstVisit(true)}
        />
        <PathCard
          icon={icons.returning}
          label={t.booking.paths.returning.label}
          hint={t.booking.paths.returning.hint}
          active={value === 'returning'}
          onClick={() => {
            setFirstVisit(false)
            onChange('returning')
          }}
        />
      </div>

      {firstVisit && (
        <div className="mt-6 animate-rise">
          <p className="mb-3 text-sm font-semibold text-muted">{t.booking.intentTitle}</p>
          <div className="grid gap-2">
            {firstVisitPaths.map((path) => (
              <PathCard
                key={path}
                icon={icons[path]}
                label={t.booking.paths[path].label}
                hint={t.booking.paths[path].hint}
                active={value === path}
                onClick={() => onChange(path)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface PathCardProps {
  icon: IconComponent
  label: string
  hint: string
  active: boolean
  onClick: () => void
}

function PathCard({ icon: Icon, label, hint, active, onClick }: PathCardProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] ${
        active ? 'border-accent bg-accent/10' : 'border-line bg-field hover:border-accent/40 hover:bg-card'
      }`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-full ${
          active ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
        }`}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-semibold ${active ? 'text-accent' : ''}`}>{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted/60" />
    </button>
  )
}
