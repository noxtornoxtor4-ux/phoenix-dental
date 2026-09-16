import { useState } from 'react'
import { presetPeriod, type Period, type PeriodPreset } from '../../lib/finance'

export function usePeriod(initial: Exclude<PeriodPreset, 'custom'> = 'month') {
  const [preset, setPreset] = useState<PeriodPreset>(initial)
  const [custom, setCustom] = useState<Period>(() => presetPeriod(initial))
  const period = preset === 'custom' ? custom : presetPeriod(preset)
  return { preset, setPreset, period, custom, setCustom }
}

export type PeriodState = ReturnType<typeof usePeriod>
