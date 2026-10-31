/** Which branch of the form a visitor takes after the greeting. */
export type PathId = 'first' | 'returning' | 'question'

export const paths: PathId[] = ['first', 'returning', 'question']

/** Single-choice questions, asked in this order inside their branch. */
export const choiceQuestions = {
  first: ['treatedBefore', 'anesthesia', 'swelling', 'biting', 'painType'],
  returning: ['problem'],
  question: [],
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

export type OptionId<Q extends ChoiceQuestionId> = (typeof questionOptions)[Q][number]

/** A free-text answer is required on the first-visit and question branches. */
export const textQuestion: Record<PathId, 'complaint' | 'question' | null> = {
  first: 'complaint',
  returning: null,
  question: 'question',
}

export interface RequestForm {
  path: PathId | null
  /** Complaint (first visit) or a free question. */
  text: string
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
