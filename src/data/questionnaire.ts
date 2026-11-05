/** Which branch of the form a visitor takes after the greeting. */
export type PathId = 'first' | 'returning'

export const paths: PathId[] = ['first', 'returning']

/** Single-choice questions, asked in this order inside their branch. */
export const choiceQuestions = {
  first: ['treatedBefore', 'anesthesia', 'swelling', 'biting', 'painType'],
  returning: ['problem'],
} as const

export type ChoiceQuestionId = (typeof choiceQuestions)[keyof typeof choiceQuestions][number]

export const questionOptions = {
  treatedBefore: ['treated', 'untreated', 'unknown'],
  anesthesia: ['fine', 'reaction', 'never'],
  swelling: ['yes', 'no'],
  biting: ['yes', 'no'],
  painType: ['night', 'sharp', 'cosmetic'],
  problem: ['newTooth', 'sameTooth', 'planned'],
} as const satisfies Record<ChoiceQuestionId, readonly string[]>

/** The complaint is required on a first visit; a returning patient goes straight to the choices. */
export const textQuestion: Record<PathId, 'complaint' | null> = {
  first: 'complaint',
  returning: null,
}

/** Anything else the patient wants to ask, asked at the end of a first visit. */
export const extraQuestionPaths: PathId[] = ['first']

export interface RequestForm {
  path: PathId | null
  /** The complaint on a first visit. */
  text: string
  /** Optional free question. */
  extraQuestion: string
  choices: Partial<Record<ChoiceQuestionId, string>>
  fullName: string
  birthDate: string
  phoneDigits: string
  /** Filled in only when the patient is under 18. */
  parentName: string
  parentPhoneDigits: string
}

export const emptyRequestForm: RequestForm = {
  path: null,
  text: '',
  extraQuestion: '',
  choices: {},
  fullName: '',
  birthDate: '',
  phoneDigits: '',
  parentName: '',
  parentPhoneDigits: '',
}

export function questionsFor(path: PathId): readonly ChoiceQuestionId[] {
  return choiceQuestions[path]
}
