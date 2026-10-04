import { Check, Download, EllipsisVertical, Share, SquarePlus } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'
import { usePwaInstall } from '../pwa/usePwaInstall'
import { Sheet } from './ui/Sheet'

const iosIcons = [Share, SquarePlus, Check]
const browserIcons = [EllipsisVertical, Download, Check]

export function InstallGuide() {
  const { t } = useI18n()
  const { guideOpen, isIos, closeInstallGuide } = usePwaInstall()
  const steps = isIos ? t.install.iosSteps : t.install.otherSteps
  const icons = isIos ? iosIcons : browserIcons

  return (
    <Sheet open={guideOpen} onClose={closeInstallGuide} title={t.install.guideTitle} closeLabel={t.install.dismiss}>
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <img src="/favicon.svg" alt="" className="size-12 rounded-2xl shadow-glow" />
        <div className="min-w-0">
          <p className="font-display font-bold tracking-[0.18em]">PHOENIX</p>
          <p className="text-xs text-white/60">{t.install.banner}</p>
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const Icon = icons[index]
          return (
            <li key={step} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <Icon className="size-5" />
              </span>
              <span className="text-sm text-white/85">
                <b className="mr-1 text-accent">{index + 1}.</b>
                {step}
              </span>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        onClick={closeInstallGuide}
        className="mt-6 w-full rounded-full bg-accent py-3.5 font-bold text-ink-900 transition active:scale-[0.98]"
      >
        {t.install.gotIt}
      </button>
    </Sheet>
  )
}
