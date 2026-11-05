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
  'w-full rounded-2xl border bg-white/5 p-4 text-base outline-none transition placeholder:text-white/30 focus:border-accent focus:bg-white/10'

/** Step 2: the questions of the chosen branch, numbered the way the clinic reads them. */
export function QuestionsStep({ value, errors, onChange }: QuestionsStepProps) {
  const { t } = useI18n()
  if (!value.path) return null

  const complaint = textQuestion[value.path]
  const questions = questionsFor(value.path)
  const withExtraQuestion = extraQuestionPaths.includes(value.path)
  let number = 0

  return (
    <div className="space-y-5">
      {complaint && (
        <label className="block">
          <span className="mb-2 flex gap-2 text-sm font-semibold">
            <QuestionNumber value={++number} />
            {t.booking.textLabels.complaint}
          </span>
          <textarea
            value={value.text}
            onChange={(event) => onChange({ ...value, text: event.target.value })}
            placeholder={t.booking.textPlaceholders.complaint}
            rows={3}
            maxLength={1000}
            aria-invalid={Boolean(errors.text)}
            className={`${textareaClass} ${errors.text ? 'border-sos' : 'border-white/10'}`}
          />
          {errors.text && <span className="mt-1 block text-xs text-sos">{t.booking.requiredText}</span>}
        </label>
      )}

      {questions.map((question) => (
        <ChoiceQuestion
          key={question}
          question={question}
          number={++number}
          value={value.choices[question]}
          invalid={Boolean(errors[question])}
          onPick={(option) => onChange({ ...value, choices: { ...value.choices, [question]: option } })}
        />
      ))}

      {withExtraQuestion && (
        <label className="block border-t border-white/10 pt-5">
          <span className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
            {t.booking.textLabels.question}
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/50">
              {t.booking.optionalHint}
            </span>
          </span>
          <textarea
            value={value.extraQuestion}
            onChange={(event) => onChange({ ...value, extraQuestion: event.target.value })}
            placeholder={t.booking.textPlaceholders.question}
            rows={3}
            maxLength={1000}
            className={`${textareaClass} border-white/10`}
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
  number: number
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
        <QuestionNumber value={number} />
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
                  : `bg-white/5 hover:bg-white/10 ${invalid ? 'border-sos/50' : 'border-white/10'}`
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                  active ? 'border-accent bg-accent text-ink-900' : 'border-white/25'
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
