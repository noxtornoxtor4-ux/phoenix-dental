import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { clinic } from '../../config/clinic'
import { emptyRequestForm, questionsFor, textQuestion, type RequestForm } from '../../data/questionnaire'
import { dictionaries, type Dictionary } from '../../i18n/translations'
import { useI18n } from '../../i18n/useI18n'
import { formatBirthDate } from '../../lib/patient'
import { toE164, toInternational } from '../../lib/phone'
import { submitLead } from '../../lib/publicApi'
import {
  buildRequestMessage,
  hasErrors,
  needsParent,
  validateAnswers,
  validateContacts,
  type RequestErrors,
  type RequestLabels,
} from '../../lib/request'
import { createWhatsappUrl } from '../../lib/whatsapp'
import { SectionHeading } from '../ui/SectionHeading'
import { ContactsStep } from './ContactsStep'
import { PathChoice } from './PathChoice'
import { QuestionsStep } from './QuestionsStep'
import { Stepper } from './Stepper'

const LAST_STEP = 2

/** Message labels for a given language; the clinic always reads Russian. */
function requestLabels(dictionary: Dictionary): RequestLabels {
  const { booking, message } = dictionary
  return {
    title: message.title,
    patientType: message.patientType,
    pathNames: {
      first: booking.paths.first.label,
      returning: booking.paths.returning.label,
      question: booking.paths.question.label,
    },
    fullName: message.fullName,
    birth: message.birth,
    phone: message.phone,
    answers: message.answers,
    parent: booking.parentTitle,
    questionNames: booking.messageNames,
    optionNames: {
      treatedBefore: booking.questions.treatedBefore.options,
      anesthesia: booking.questions.anesthesia.options,
      swelling: booking.questions.swelling.options,
      biting: booking.questions.biting.options,
      painType: booking.questions.painType.options,
      problem: booking.questions.problem.options,
    },
  }
}

export function BookingSection() {
  const { t, lang } = useI18n()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<RequestForm>(emptyRequestForm)
  const [errors, setErrors] = useState<RequestErrors>({})

  const canContinue = step === 0 ? form.path !== null : true

  const goTo = (next: number) => {
    if (next > step && step === 1) {
      const found = validateAnswers(form)
      if (hasErrors(found)) {
        setErrors(found)
        return
      }
    }
    setErrors({})
    setStep(next)
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const update = (next: RequestForm) => {
    setForm(next)
    setErrors({})
  }

  /** What the visitor sees in the summary card on the last step. */
  const summaryLines = () => {
    if (!form.path) return []
    const lines = [t.booking.paths[form.path].label]
    const freeText = textQuestion[form.path]
    if (freeText && form.text.trim()) lines.push(`${t.booking.textLabels[freeText]}: ${form.text.trim()}`)
    for (const question of questionsFor(form.path)) {
      const option = form.choices[question]
      if (option) lines.push(`${t.booking.questions[question].label} ${t.booking.questions[question].options[option]}`)
    }
    return lines
  }

  const submit = () => {
    const found = validateContacts(form, new Date())
    if (hasErrors(found) || !form.path) {
      setErrors(found)
      return
    }

    const parent = needsParent(form, new Date())
      ? `${form.parentName.trim()}, ${toInternational(form.parentPhoneDigits)}`
      : ''
    const values = {
      fullName: form.fullName.trim(),
      birthDate: formatBirthDate(form.birthDate),
      phone: toInternational(form.phoneDigits),
      parent,
    }

    submitLead({
      kind: 'booking',
      name: values.fullName,
      phone: toE164(form.phoneDigits),
      // Staff read requests in Russian regardless of the visitor's language.
      summary: buildRequestMessage(form, requestLabels(dictionaries.ru), values),
      lang,
    })
    window.open(
      createWhatsappUrl(clinic.whatsapp, buildRequestMessage(form, requestLabels(t), values)),
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <section id="booking" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14 md:py-20">
      <SectionHeading eyebrow={t.booking.eyebrow} title={t.booking.title} />

      <div className="glass mt-8 rounded-[2rem] p-4 sm:p-6">
        <Stepper steps={t.booking.steps} current={step} />

        <div key={step} className="mt-6 animate-rise">
          {step === 0 && (
            <PathChoice
              value={form.path}
              onChange={(path) => {
                update({ ...emptyRequestForm, ...form, path, text: '', choices: {} })
                setStep(1)
              }}
            />
          )}
          {step === 1 && <QuestionsStep value={form} errors={errors} onChange={update} />}
          {step === 2 && <ContactsStep value={form} errors={errors} onChange={update} summary={summaryLines()} />}
        </div>

        <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-10 mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-2.5 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="flex h-12 shrink-0 items-center gap-1 rounded-full border border-white/10 px-4 transition hover:bg-white/5"
            >
              <ChevronLeft className="size-5" />
              <span className="hidden text-sm font-semibold sm:inline">{t.booking.back}</span>
            </button>
          )}

          {step < LAST_STEP ? (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              disabled={!canContinue}
              className="ml-auto flex h-12 shrink-0 items-center gap-1 rounded-full bg-accent pr-3 pl-5 font-bold text-ink-900 shadow-glow transition hover:bg-accent-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
            >
              {t.booking.next}
              <ChevronRight className="size-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-3 text-sm font-bold whitespace-nowrap text-ink-950 shadow-[0_10px_30px_-8px_rgb(37_211_102/0.7)] transition active:scale-[0.98] sm:px-5 sm:text-base md:ml-auto md:flex-none"
            >
              <MessageCircle className="size-5" />
              {t.booking.submit}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
