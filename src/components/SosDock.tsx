import { CalendarDays, Siren } from 'lucide-react'
import { clinic } from '../config/clinic'
import { useI18n } from '../i18n/useI18n'
import { submitLead } from '../lib/publicApi'
import { buildSosMessage, createWhatsappUrl } from '../lib/whatsapp'

function SosLink({ className }: { className: string }) {
  const { t, lang } = useI18n()
  const href = createWhatsappUrl(clinic.sosWhatsapp, buildSosMessage({ title: t.sos.title, body: t.sos.body }))

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.sos.aria}
      onClick={() => submitLead({ kind: 'sos', lang })}
      className={`flex animate-sos-pulse items-center justify-center gap-2 rounded-full bg-sos font-bold text-white shadow-sos transition active:scale-95 ${className}`}
    >
      <Siren className="size-5" />
      <span>{t.sos.button}</span>
    </a>
  )
}

/** Fixed SOS action: a bottom dock on phones, a floating button on larger screens. */
export function SosDock() {
  const { t } = useI18n()

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="glass mx-auto flex max-w-md items-center gap-2 rounded-full bg-ink-900/80 p-1.5 shadow-2xl shadow-black/50">
          <SosLink className="flex-1 px-4 py-3.5 text-sm" />
          <a
            href="#booking"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3.5 text-sm font-bold text-ink-900 transition active:scale-95"
          >
            <CalendarDays className="size-5" />
            {t.dock.book}
          </a>
        </div>
      </div>

      <div className="fixed right-6 bottom-6 z-40 hidden md:block">
        <SosLink className="px-6 py-4" />
      </div>
    </>
  )
}
