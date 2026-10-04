/** Warm glow and a thin mountain line — the Karakol ridge behind the content. */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-900">
      <div className="absolute -top-56 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-accent/12 blur-[130px]" />
      <div className="absolute top-1/2 -right-40 size-[26rem] animate-drift rounded-full bg-accent-600/10 blur-[120px]" />

      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 top-0 h-[42vh] w-full opacity-[0.22]"
      >
        <path
          d="M-40 380 L170 212 L250 268 L395 120 L470 190 L560 118 L690 252 L775 196 L900 300 L1010 214 L1120 288 L1230 176 L1330 252 L1480 150"
          fill="none"
          stroke="#DCA457"
          strokeWidth="1.4"
        />
        <path
          d="M-40 404 L120 300 L235 352 L360 246 L480 330 L600 262 L700 330 L840 258 L960 344 L1080 282 L1200 350 L1320 290 L1480 356"
          fill="none"
          stroke="#DCA457"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(rgb(220_164_87/0.07)_1px,transparent_1px)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,black,transparent_65%)]" />
    </div>
  )
}
