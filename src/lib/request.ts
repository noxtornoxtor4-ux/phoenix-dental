import {
  extraQuestionPaths,
  needsContacts,
  questionsFor,
  textQuestion,
  type ChoiceQuestionId,
  type PathId,
  type RequestForm,
} from '../data/questionnaire'
import { ADULT_AGE, ageOn, isValidBirthDate } from './patient'
import { isValidLocalDigits } from './phone'

export type RequestField =
  | 'text'
  | ChoiceQuestionId
  | 'fullName'
  | 'birthDate'
  | 'phone'
  | 'parentName'
  | 'parentPhone'
export type RequestErrors = Partial<Record<RequestField, true>>

/** Unanswered questions of the current branch; an empty object means the step is complete. */
export function validateAnswers(form: RequestForm): RequestErrors {
  const errors: RequestErrors = {}
  if (!form.path) return errors

  if (textQuestion[form.path] && form.text.trim() === '') errors.text = true
  for (const question of questionsFor(form.path)) {
    if (!form.choices[question]) errors[question] = true
  }
  return errors
}

export function validateContacts(form: RequestForm, today: Date): RequestErrors {
  const errors: RequestErrors = {}
  if (form.fullName.trim() === '') errors.fullName = true
  if (!isValidBirthDate(form.birthDate, today)) errors.birthDate = true
  if (!isValidLocalDigits(form.phoneDigits)) errors.phone = true

  if (needsParent(form, today)) {
    if (form.parentName.trim() === '') errors.parentName = true
    if (!isValidLocalDigits(form.parentPhoneDigits)) errors.parentPhone = true
  }
  return errors
}

/** A patient under 18 is seen with a parent or guardian, so the clinic needs their contact. */
export function needsParent(form: RequestForm, today: Date): boolean {
  const age = ageOn(form.birthDate, today)
  return age !== null && age < ADULT_AGE
}

export function hasErrors(errors: RequestErrors): boolean {
  return Object.keys(errors).length > 0
}

export interface RequestLabels {
  title: string
  patientType: string
  pathNames: Record<PathId, string>
  fullName: string
  birth: string
  phone: string
  answers: string
  parent: string
  /** Short question names used as list items in the message. */
  questionNames: Record<ChoiceQuestionId | 'complaint' | 'question', string>
  optionNames: Record<ChoiceQuestionId, Record<string, string>>
}

export interface RequestValues {
  fullName: string
  birthDate: string
  phone: string
  /** Parent name and phone in one line; empty for adults. */
  parent: string
}

/** The message the clinic receives in WhatsApp. */
export function buildRequestMessage(form: RequestForm, labels: RequestLabels, values: RequestValues): string {
  if (!form.path) return ''

  const answers: string[] = []
  const freeText = textQuestion[form.path]
  if (freeText) answers.push(`${labels.questionNames[freeText]}: ${form.text.trim()}`)
  for (const question of questionsFor(form.path)) {
    const option = form.choices[question]
    if (option) answers.push(`${labels.questionNames[question]}: ${labels.optionNames[question][option]}`)
  }
  if (extraQuestionPaths.includes(form.path) && form.extraQuestion.trim()) {
    answers.push(`${labels.questionNames.question}: ${form.extraQuestion.trim()}`)
  }

  // A returning patient and a plain question carry no patient card.
  const contacts = needsContacts(form.path)
    ? [
        `${labels.fullName}: ${values.fullName}`,
        `${labels.birth}: ${values.birthDate}`,
        `${labels.phone}: ${values.phone}`,
        ...(values.parent ? [`${labels.parent}: ${values.parent}`] : []),
      ]
    : []

  return [
    labels.title,
    `${labels.patientType}: ${labels.pathNames[form.path]}`,
    ...contacts,
    '',
    labels.answers,
    ...answers.map((answer, index) => `${index + 1}. ${answer}`),
  ].join('\n')
}
