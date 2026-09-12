export type Jaw = 'upper' | 'lower'
export type ToothKind = 'incisor' | 'canine' | 'premolar' | 'molar'

// FDI position inside a quadrant (1 — central incisor … 8 — wisdom tooth).
const kindByPosition: ToothKind[] = [
  'incisor',
  'incisor',
  'canine',
  'premolar',
  'premolar',
  'molar',
  'molar',
  'molar',
]

export function getToothKind(toothNumber: number): ToothKind {
  return kindByPosition[(toothNumber % 10) - 1]
}

const quadrant = (q: number) => [1, 2, 3, 4, 5, 6, 7, 8].map((position) => q * 10 + position)

// Viewer-facing order, left to right: the patient's right side is on the viewer's left.
export const teethByJaw: Record<Jaw, number[]> = {
  upper: [...quadrant(1).reverse(), ...quadrant(2)],
  lower: [...quadrant(4).reverse(), ...quadrant(3)],
}
