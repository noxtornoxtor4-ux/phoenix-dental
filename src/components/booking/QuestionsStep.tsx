import { Check } from 'lucide-react'
import {
  extraQuestionPaths,
  questionOptions,
  questionsFor,
  textQuestion,
  type ChoiceQuestionId,
  type RequestForm,
} from '../../data/questionnaire'
import { useI18n } from '../../i18n/useI18n'
import type { RequestErrors } from '../../lib/request'

interface QuestionsStepProps {
  value: RequestForm
  errors: RequestErrors
  onChange: (value: RequestForm) => void
}

const textareaClass =
  'w-full rounded-2xl border bg-field p-4 text-base outline-none transition placeholder:text-muted focus:border-accent focus:bg-card'

/** Step 2: the questions of the chosen branch, numbered the way the clinic reads them. */
export function QuestionsStep({ value, errors, onChange }: QuestionsStepProps) {
  const { t } = useI18n()
  if (!value.path) return null

  const freeText = textQuestion[value.path]
  const questions = questionsFor(value.path)
  const withExtraQuestion = extraQuestionPaths.includes(value.path)
  // A branch of a single question reads better without a number in front of it.
  const numbered = (freeText ? 1 : 0) + questions.length > 1
  let number = 0

  return (
    <div className="space-y-5">
      {freeText && (
        <label className="block">
          <span className="mb-2 flex gap-2 text-sm font-semibold">
            {numbered && <QuestionNumber value={++number} />}
            {t.booking.textLabels[freeText]}
          </span>
          <textarea
            value={value.text}
            onChange={(event) => onChange({ ...value, text: event.target.value })}
            placeholder={t.booking.textPlaceholders[freeText]}
            rows={3}
            maxLength={1000}
            aria-invalid={Boolean(errors.text)}
            className={`${textareaClass} ${errors.text ? 'border-sos' : 'border-line'}`}
          />
          {errors.text && <span className="mt-1 block text-xs text-sos">{t.booking.requiredText}</span>}
        </label>
      )}

      {questions.map((question) => (
        <ChoiceQuestion
          key={question}
          question={question}
          number={numbered ? ++number : undefined}
          value={value.choices[question]}
          invalid={Boolean(errors[question])}
          onPick={(option) => onChange({ ...value, choices: { ...value.choices, [question]: option } })}
        />
      ))}

      {withExtraQuestion && (
        <label className="block border-t border-line pt-5">
          <span className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {t.booking.textLabels.question}
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              {t.booking.optionalHint}
            </span>
          </span>
          <textarea
            value={value.extraQuestion}
            onChange={(event) => onChange({ ...value, extraQuestion: event.target.value })}
            placeholder={t.booking.textPlaceholders.question}
            rows={3}
            maxLength={1000}
            className={`${textareaClass} border-line`}
          />
        </label>
      )}
    </div>
  )
}

function QuestionNumber({ value }: { value: number }) {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
      {value}
    </span>
  )
}

interface ChoiceQuestionProps {
  question: ChoiceQuestionId
  /** Left out when the branch asks a single question. */
  number: number | undefined
  value: string | undefined
  invalid: boolean
  onPick: (option: string) => void
}

function ChoiceQuestion({ question, number, value, invalid, onPick }: ChoiceQuestionProps) {
  const { t } = useI18n()
  const { label, options } = t.booking.questions[question]

  return (
    <fieldset>
      <legend className="mb-2 flex gap-2 text-sm font-semibold">
        {number !== undefined && <QuestionNumber value={number} />}
        {label}
      </legend>
      <div className="grid gap-2">
        {questionOptions[question].map((option) => {
          const active = value === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(option)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition active:scale-[0.99] ${
                active
                  ? 'border-accent bg-accent/10 font-semibold'
                  : `bg-field hover:border-accent/40 hover:bg-card ${invalid ? 'border-sos/50' : 'border-line'}`
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                  active ? 'border-accent bg-accent text-white' : 'border-line'
                }`}
              >
                {active && <Check className="size-3.5" />}
              </span>
              {options[option]}
            </button>
          )
        })}
      </div>
      {invalid && <p className="mt-1 text-xs text-sos">{t.booking.requiredChoice}</p>}
    </fieldset>
  )
}
