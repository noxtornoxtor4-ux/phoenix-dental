import { getToothKind, type Jaw, type ToothKind } from '../data/teeth'

export interface ArchGeometry {
  cx: number
  cy: number
  rx: number
  ry: number
  gap: number
  labelOffset: number
}

export interface ToothPlacement {
  number: number
  kind: ToothKind
  x: number
  y: number
  /** Rotation in degrees so that the tooth follows the arch. */
  angle: number
  width: number
  depth: number
  labelX: number
  labelY: number
}

// Relative occlusal sizes: width along the arch, depth across it.
const baseSize: Record<ToothKind, { width: number; depth: number }> = {
  incisor: { width: 26, depth: 22 },
  canine: { width: 27, depth: 26 },
  premolar: { width: 28, depth: 30 },
  molar: { width: 36, depth: 36 },
}

const SAMPLES = 480

/**
 * Places teeth along a half-ellipse. The upper arch opens downwards (incisors on top),
 * the lower arch opens upwards (incisors at the bottom).
 */
export function layoutArch(numbers: number[], jaw: Jaw, geometry: ArchGeometry): ToothPlacement[] {
  const { cx, cy, rx, ry, gap, labelOffset } = geometry
  const direction = jaw === 'upper' ? -1 : 1

  const points = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const theta = Math.PI - (Math.PI * i) / SAMPLES
    return { x: cx + rx * Math.cos(theta), y: cy + direction * ry * Math.sin(theta) }
  })

  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  }
  const arcLength = lengths[lengths.length - 1]

  const sizes = numbers.map((n) => baseSize[getToothKind(n)])
  const required = sizes.reduce((sum, size) => sum + size.width, 0) + gap * (numbers.length - 1)
  const scale = arcLength / required

  let cursor = 0
  return numbers.map((number, index) => {
    const width = sizes[index].width * scale
    const depth = sizes[index].depth * scale
    const target = cursor + width / 2
    cursor += width + gap * scale

    let i = 1
    while (i < lengths.length - 1 && lengths[i] < target) i++
    const t = (target - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1)
    const x = points[i - 1].x + (points[i].x - points[i - 1].x) * t
    const y = points[i - 1].y + (points[i].y - points[i - 1].y) * t
    const angle = (Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x) * 180) / Math.PI

    // Outward normal of the ellipse at (x, y).
    const nx = (x - cx) / (rx * rx)
    const ny = (y - cy) / (ry * ry)
    const norm = Math.hypot(nx, ny) || 1
    const offset = depth / 2 + labelOffset

    return {
      number,
      kind: getToothKind(number),
      x,
      y,
      angle,
      width,
      depth,
      labelX: x + (nx / norm) * offset,
      labelY: y + (ny / norm) * offset,
    }
  })
}
