import { describe, expect, test } from 'bun:test'
import { emptyRequestForm, type RequestForm } from '../data/questionnaire'
import {
  buildRequestMessage,
  hasErrors,
  validateAnswers,
  validateContacts,
  type RequestLabels,
} from './request'

const today = new Date(2026, 9, 31)
const form = (patch: Partial<RequestForm>): RequestForm => ({ ...emptyRequestForm, ...patch })

const labels: RequestLabels = {
  title: 'Новая заявка с сайта!',
  patientType: 'Тип пациента',
  pathNames: { booking: 'Первичный, запись', ask: 'Первичный, вопрос', returning: 'Повторный' },
  fullName: 'ФИО',
  birth: 'Дата рождения',
  phone: 'Телефон',
  answers: 'Ответы на вопросы:',
  parent: 'Родитель',
  questionNames: {
    complaint: 'Жалоба',
    question: 'Вопрос',
    treatedBefore: 'Лечили ранее',
    anesthesia: 'Анестезия',
    swelling: 'Отёк',
    biting: 'Боль при накусывании',
    painType: 'Характер боли',
    problem: 'Проблема',
  },
  optionNames: {
    treatedBefore: { treated: 'Да, уже леченый', untreated: 'Нет', unknown: 'Не знаю' },
    anesthesia: { fine: 'Да, аллергии нет', reaction: 'Были реакции', never: 'Не делали' },
    swelling: { yes: 'Да, есть отёк', no: 'Нет, как обычно' },
    biting: { yes: 'Да, больно нажимать', no: 'Нет, не болит' },
    painType: { night: 'Болит ночами', sharp: 'Резкие боли', cosmetic: 'Не болит' },
    problem: { newTooth: 'Новый зуб', sameTooth: 'Тот же зуб', planned: 'Плановый осмотр' },
  },
}

describe('validateAnswers', () => {
  test('a first visit needs the complaint and every choice', () => {
    expect(validateAnswers(form({ path: 'booking' }))).toEqual({
      text: true,
      treatedBefore: true,
      anesthesia: true,
      swelling: true,
      biting: true,
      painType: true,
    })

    const filled = form({
      path: 'booking',
      text: 'Болит нижний зуб',
      choices: { treatedBefore: 'treated', anesthesia: 'fine', swelling: 'no', biting: 'yes', painType: 'sharp' },
    })
    expect(hasErrors(validateAnswers(filled))).toBe(false)
  })

  test('a returning patient answers one question', () => {
    expect(validateAnswers(form({ path: 'returning' }))).toEqual({ problem: true })
    expect(validateAnswers(form({ path: 'returning', choices: { problem: 'newTooth' } }))).toEqual({})
  })

  test('a plain question needs the question itself and nothing else', () => {
    expect(validateAnswers(form({ path: 'ask' }))).toEqual({ text: true })
    expect(validateAnswers(form({ path: 'ask', text: 'Сколько стоит чистка?' }))).toEqual({})
  })

  test('the extra question is optional', () => {
    const filled = form({
      path: 'booking',
      text: 'Болит нижний зуб',
      choices: { treatedBefore: 'treated', anesthesia: 'fine', swelling: 'no', biting: 'yes', painType: 'sharp' },
    })
    expect(hasErrors(validateAnswers(filled))).toBe(false)
    expect(hasErrors(validateAnswers({ ...filled, extraQuestion: 'Работаете в воскресенье?' }))).toBe(false)
  })
})

describe('validateContacts', () => {
  test('asks for a full name, a real date of birth and a phone', () => {
    expect(validateContacts(form({}), today)).toEqual({ fullName: true, birthDate: true, phone: true })
    expect(
      validateContacts(form({ fullName: 'Иванова Мария', birthDate: '15.05.1993', phoneDigits: '504314134' }), today),
    ).toEqual({})
    expect(
      validateContacts(form({ fullName: 'A', birthDate: '1993-05-15', phoneDigits: '504314134' }), today).birthDate,
    ).toBe(true)
    expect(validateContacts(form({ fullName: 'A', birthDate: '15.05', phoneDigits: '504314134' }), today).birthDate).toBe(
      true,
    )
  })
})

describe('buildRequestMessage', () => {
  test('numbers the answers the way the clinic reads them', () => {
    const message = buildRequestMessage(
      form({
        path: 'booking',
        text: 'Скололась пломба',
        choices: { treatedBefore: 'treated', anesthesia: 'fine', swelling: 'no', biting: 'yes', painType: 'sharp' },
      }),
      labels,
          { fullName: 'Иванова Мария Петровна', birthDate: '15.05.1993', phone: '+996 504 314 134', parent: '' },
    )

    expect(message).toBe(
      [
        'Новая заявка с сайта!',
        'Тип пациента: Первичный, запись',
        'ФИО: Иванова Мария Петровна',
        'Дата рождения: 15.05.1993',
        'Телефон: +996 504 314 134',
        '',
        'Ответы на вопросы:',
        '1. Жалоба: Скололась пломба',
        '2. Лечили ранее: Да, уже леченый',
        '3. Анестезия: Да, аллергии нет',
        '4. Отёк: Нет, как обычно',
        '5. Боль при накусывании: Да, больно нажимать',
        '6. Характер боли: Резкие боли',
      ].join('\n'),
    )
  })

  test('an optional question becomes the last answer', () => {
    const message = buildRequestMessage(
      form({
        path: 'booking',
        text: 'Скололась пломба',
        extraQuestion: 'Работаете в воскресенье?',
        choices: { treatedBefore: 'treated', anesthesia: 'fine', swelling: 'no', biting: 'yes', painType: 'sharp' },
      }),
      labels,
      { fullName: 'Пётр', birthDate: '01.01.1990', phone: '+996 504 314 134', parent: '' },
    )
    expect(message.trim().endsWith('7. Вопрос: Работаете в воскресенье?')).toBe(true)
  })
})

describe('a request without a patient card', () => {
  test('a returning patient sends the chosen problem only', () => {
    const message = buildRequestMessage(form({ path: 'returning', choices: { problem: 'planned' } }), labels, {
      fullName: '',
      birthDate: '',
      phone: '',
      parent: '',
    })

    expect(message).toBe(
      [
        'Новая заявка с сайта!',
        'Тип пациента: Повторный',
        '',
        'Ответы на вопросы:',
        '1. Проблема: Плановый осмотр',
      ].join('\n'),
    )
  })

  test('a question carries no contact lines either', () => {
    const message = buildRequestMessage(form({ path: 'ask', text: 'Работаете в воскресенье?' }), labels, {
      fullName: 'Иванова Мария',
      birthDate: '15.05.1993',
      phone: '+996 504 314 134',
      parent: '',
    })

    expect(message).toBe(
      [
        'Новая заявка с сайта!',
        'Тип пациента: Первичный, вопрос',
        '',
        'Ответы на вопросы:',
        '1. Вопрос: Работаете в воскресенье?',
      ].join('\n'),
    )
  })
})
