import { teethByJaw } from '../../../data/teeth'

/** FDI teeth grouped for <select>, in the order dentists read the chart. */
export const toothOptionGroups = [
  { label: 'Верхняя челюсть', teeth: teethByJaw.upper },
  { label: 'Нижняя челюсть', teeth: teethByJaw.lower },
]
