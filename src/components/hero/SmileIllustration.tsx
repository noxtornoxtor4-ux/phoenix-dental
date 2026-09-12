import { useId } from 'react'

export type CompareMode = 'cleaning' | 'whitening'

interface SmileIllustrationProps {
  variant: 'before' | 'after'
  mode: CompareMode
  className?: string
}

const MOUTH = 'M40 120 Q200 20 360 120 Q200 250 40 120 Z'

/** y of the upper and lower lip line for a given x (quadratic curves of MOUTH). */
const upperLipY = (x: number) => {
  const t = (x - 40) / 320
  return 120 - 200 * t * (1 - t)
}
const lowerLipY = (x: number) => {
  const t = (x - 40) / 320
  return 120 + 260 * t * (1 - t)
}

// Half of the smile, mirrored: [distance of center from midline, width, height].
const upperTeeth = [
  [29, 56, 76],
  [83, 48, 68],
  [131, 42, 60],
  [172, 36, 48],
] as const
const lowerTeeth = [
  [18, 34],
  [54, 34],
  [90, 34],
  [126, 34],
  [162, 34],
] as const

const mirrored = <T extends readonly number[]>(teeth: readonly T[]) =>
  teeth.flatMap((tooth) => [
    { x: 200 - tooth[0], tooth },
    { x: 200 + tooth[0], tooth },
  ])

export function SmileIllustration({ variant, mode, className }: SmileIllustrationProps) {
  const id = useId()
  const clean = variant === 'after'
  const stained = !clean && mode === 'cleaning'
  const toothTop = clean ? '#FFFFFF' : mode === 'whitening' ? '#F1DFA8' : '#EAD9A6'
  const toothBottom = clean ? '#DDEFF6' : mode === 'whitening' ? '#CFAE62' : '#C9A866'

  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor={clean ? '#123B5A' : '#1C2541'} />
          <stop offset="1" stopColor="#0B132B" />
        </radialGradient>
        <linearGradient id={`${id}-tooth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={toothTop} />
          <stop offset="1" stopColor={toothBottom} />
        </linearGradient>
        <linearGradient id={`${id}-lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9737F" />
          <stop offset="1" stopColor="#A9485A" />
        </linearGradient>
        <clipPath id={`${id}-mouth`}>
          <path d={MOUTH} />
        </clipPath>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <rect width="400" height="260" fill={`url(#${id}-bg)`} />

      <g clipPath={`url(#${id}-mouth)`}>
        <rect width="400" height="260" fill="#2A0F1D" />

        {/* Lower gum and teeth sit behind the upper row. */}
        <path d="M40 120 Q200 250 360 120 L360 260 L40 260 Z" fill="#C85D74" transform="translate(0 -14)" />
        {mirrored(lowerTeeth).map(({ x, tooth: [, width] }) => {
          const top = upperLipY(x) + 64
          return (
            <g key={`l${x}`}>
              {/* Fixed height: the mouth clip path trims whatever falls outside the lips. */}
              <rect x={x - width / 2} y={top} width={width - 3} height={72} rx={10} fill={`url(#${id}-tooth)`} />
              {stained && (
                <rect
                  x={x - width / 2}
                  y={lowerLipY(x) - 30}
                  width={width - 3}
                  height={14}
                  fill="#7A5A24"
                  opacity={0.55}
                  filter={`url(#${id}-soft)`}
                />
              )}
            </g>
          )
        })}

        <path d="M40 120 Q200 20 360 120 L360 0 L40 0 Z" fill="#D46A80" transform="translate(0 14)" />
        {mirrored(upperTeeth).map(({ x, tooth: [, width, height] }) => {
          const top = upperLipY(x) + 12
          return (
            <g key={`u${x}`}>
              <rect
                x={x - width / 2 + 1.5}
                y={top}
                width={width - 3}
                height={height}
                rx={14}
                fill={`url(#${id}-tooth)`}
              />
              {stained && (
                <>
                  <rect
                    x={x - width / 2 + 1.5}
                    y={top}
                    width={width - 3}
                    height={16}
                    fill="#86652B"
                    opacity={0.6}
                    filter={`url(#${id}-soft)`}
                  />
                  <circle cx={x + width / 5} cy={top + height * 0.62} r={3.5} fill="#8E6D33" opacity={0.45} />
                </>
              )}
              {clean && (
                <rect x={x - width / 4} y={top + 10} width={5} height={height * 0.45} rx={2.5} fill="#FFFFFF" opacity={0.8} />
              )}
            </g>
          )
        })}
      </g>

      <path d={MOUTH} fill="none" stroke={`url(#${id}-lip)`} strokeWidth={16} strokeLinejoin="round" />

      {clean &&
        [
          [118, 58, 9],
          [300, 70, 7],
          [214, 102, 6],
        ].map(([cx, cy, r]) => (
          <path
            key={`${cx}`}
            d={`M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`}
            fill="#8DF6FF"
          />
        ))}
    </svg>
  )
}
