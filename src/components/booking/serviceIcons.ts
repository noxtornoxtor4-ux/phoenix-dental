import { Layers, ScanLine, ShieldCheck, Sparkles, Stethoscope, Zap, type LucideIcon } from 'lucide-react'
import type { ServiceId } from '../../data/services'

export const serviceIcons: Record<ServiceId, LucideIcon> = {
  therapy: Stethoscope,
  pain: Zap,
  hygiene: Sparkles,
  prosthetics: Layers,
  implant: ShieldCheck,
  xray: ScanLine,
}
