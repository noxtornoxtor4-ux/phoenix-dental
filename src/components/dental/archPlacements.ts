import { teethByJaw, type Jaw } from '../../data/teeth'
import { layoutArch, type ArchGeometry, type ToothPlacement } from '../../lib/archLayout'

export const ARCH_VIEW_WIDTH = 340
export const ARCH_VIEW_HEIGHT = 256

const geometry: Record<Jaw, ArchGeometry> = {
  upper: { cx: 170, cy: 236, rx: 132, ry: 196, gap: 3, labelOffset: 11 },
  lower: { cx: 170, cy: 20, rx: 132, ry: 196, gap: 3, labelOffset: 11 },
}

export const archPlacements: Record<Jaw, ToothPlacement[]> = {
  upper: layoutArch(teethByJaw.upper, 'upper', geometry.upper),
  lower: layoutArch(teethByJaw.lower, 'lower', geometry.lower),
}
