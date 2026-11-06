/** Which branch of the form a visitor takes after the greeting. */
export type PathId = 'booking' | 'ask' | 'returning'

export const paths: PathId[] = ['booking', 'ask', 'returning']

/** A first-time visitor picks one of these two; a returning patient takes the third. */
export const firstVisitPaths: PathId[] = ['booking', 'ask']

/** Single-choice questions, asked in this order inside their branch. */
export const choiceQuestions = {
  booking: ['treatedBefore', 'anesthesia', 'swelling', 'biting', 'painType'],
  ask: [],
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

/** The free-text field of each branch; a returning patient only picks an option. */
export const textQuestion: Record<PathId, 'complaint' | 'question' | null> = {
  booking: 'complaint',
  ask: 'question',
  returning: null,
}

/** Anything else the patient wants to ask, asked at the end of a booking. */
export const extraQuestionPaths: PathId[] = ['booking']

/**
 * Only a first visit needs the patient card. A returning patient is already in the
 * clinic's records and a question is answered in the chat the request opens.
 */
export const contactPaths: PathId[] = ['booking']

export function needsContacts(path: PathId | null): boolean {
  return path !== null && contactPaths.includes(path)
}

export interface RequestForm {
  path: PathId | null
  /** The complaint on a first visit, or the question itself. */
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
