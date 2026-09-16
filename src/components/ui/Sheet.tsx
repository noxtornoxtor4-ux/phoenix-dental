import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  closeLabel: string
  size?: 'md' | 'lg'
  children: ReactNode
}

const widths = { md: 'sm:max-w-md', lg: 'sm:max-w-2xl' }

/** Bottom sheet on phones, centered dialog on larger screens. */
export function Sheet({ open, onClose, title, closeLabel, size = 'md', children }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`mx-0 mt-auto mb-0 max-h-[90dvh] w-full max-w-none bg-transparent p-0 text-white backdrop:bg-navy-950/70 backdrop:backdrop-blur-sm open:animate-rise sm:m-auto ${widths[size]}`}
    >
      <div className="glass max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-navy-800/90 px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl sm:pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="-m-2 grid size-10 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
