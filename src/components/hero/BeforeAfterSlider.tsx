import { MoveHorizontal } from 'lucide-react'
import { useState, type PointerEvent } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { SmileIllustration, type CompareMode } from './SmileIllustration'

const modes: CompareMode[] = ['cleaning', 'whitening']

export function BeforeAfterSlider() {
  const { t } = useI18n()
  const [mode, setMode] = useState<CompareMode>('cleaning')
  const [position, setPosition] = useState(50)

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition(Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <div className="glass rounded-[2rem] p-3 shadow-2xl shadow-black/40 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <span className="font-display text-sm font-semibold">{t.compare.title}</span>
        <div className="flex rounded-full bg-white/5 p-0.5">
          {modes.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => setMode(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                mode === item ? 'bg-white text-ink-900' : 'text-white/60 hover:text-white'
              }`}
            >
              {t.compare[item]}
            </button>
          ))}
        </div>
      </div>

      <div
        className="group relative aspect-[400/260] cursor-ew-resize touch-pan-y overflow-hidden rounded-3xl select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          moveTo(event)
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event)
        }}
      >
        <SmileIllustration variant="after" mode={mode} className="absolute inset-0 size-full" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <SmileIllustration variant="before" mode={mode} className="size-full" />
        </div>

        <span className="absolute top-3 left-3 rounded-full bg-ink-950/60 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur">
          {t.compare.before}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-accent/90 px-2.5 py-1 text-[11px] font-bold tracking-wider text-ink-900 uppercase">
          {t.compare.after}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(position)}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={t.compare.sliderLabel}
          className="peer sr-only"
        />
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_16px_rgb(220_164_87/0.9)]"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 grid size-11 -translate-1/2 place-items-center rounded-full bg-white text-ink-900 shadow-glow transition group-active:scale-110 peer-focus-visible:ring-2">
            <MoveHorizontal className="size-5" />
          </span>
        </div>
      </div>

      <p className="mt-3 flex justify-between px-1 text-xs text-white/45">
        <span>{t.compare.caption}</span>
        <span>{t.compare.hint}</span>
      </p>
    </div>
  )
}
