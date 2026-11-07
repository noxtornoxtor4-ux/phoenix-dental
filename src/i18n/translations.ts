import type { ChoiceQuestionId, PathId } from '../data/questionnaire'

export type Lang = 'ru' | 'ky' | 'en'

export const languages: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'ky', label: 'KG' },
  { code: 'en', label: 'EN' },
]

export interface Dictionary {
  header: { address: string; install: string; installShort: string; language: string }
  install: {
    banner: string
    action: string
    dismiss: string
    guideTitle: string
    iosSteps: string[]
    otherSteps: string[]
    gotIt: string
  }
  hero: {
    titleStart: string
    titleAccent: string
    subtitle: string
    book: string
    features: string[]
  }
  booking: {
    eyebrow: string
    title: string
    greeting: string
    steps: string[]
    pathTitle: string
    /** The card a first-time visitor taps before choosing between the branches below. */
    firstVisit: { label: string; hint: string }
    intentTitle: string
    paths: Record<PathId, { label: string; hint: string }>
    /** How the branch is named in the message the clinic receives. */
    messagePathNames: Record<PathId, string>
    textLabels: Record<'complaint' | 'question', string>
    optionalHint: string
    textPlaceholders: Record<'complaint' | 'question', string>
    questions: Record<ChoiceQuestionId, { label: string; options: Record<string, string> }>
    messageNames: Record<ChoiceQuestionId | 'complaint' | 'question', string>
    requiredChoice: string
    requiredText: string
    fullNameLabel: string
    fullNamePlaceholder: string
    fullNameError: string
    birthLabel: string
    birthPlaceholder: string
    birthError: string
    phoneLabel: string
    phoneError: string
    parentTitle: string
    parentNote: string
    parentNameLabel: string
    parentPhoneLabel: string
    parentNameError: string
    parentPhoneError: string
    summary: string
    confirmNote: string
    back: string
    next: string
    submit: string
  }
  units: { hour: string; minute: string }
  months: string[]
  /** Month names for calendar headers. */
  monthsNominative: string[]
  weekdaysShort: string[]
  formatDate: (day: number, month: string) => string
  message: {
    title: string
    patientType: string
    fullName: string
    birth: string
    phone: string
    answers: string
  }
  location: {
    eyebrow: string
    title: string
    address: string
    hoursTitle: string
    dayOff: string
    xray: string
    call: string
  }
  footer: { rights: string; note: string }
}

const ru: Dictionary = {
  header: {
    address: 'г. Каракол, ул. Московская, 125',
    install: 'Скачать приложение',
    installShort: 'Установить',
    language: 'Язык',
  },
  install: {
    banner: 'Установите приложение The Phoenix для быстрой записи и скидки',
    action: 'Установить',
    dismiss: 'Закрыть',
    guideTitle: 'Установка приложения',
    iosSteps: [
      'Нажмите кнопку «Поделиться» в панели Safari',
      'Выберите пункт «На экран „Домой“»',
      'Нажмите «Добавить» — иконка The Phoenix появится на главном экране',
    ],
    otherSteps: [
      'Откройте меню браузера (⋮)',
      'Выберите «Установить приложение» или «Добавить на главный экран»',
      'Подтвердите установку',
    ],
    gotIt: 'Понятно',
  },
  hero: {
    titleStart: 'Забота о вашей улыбке',
    titleAccent: 'в Караколе без боли',
    subtitle:
      'Ответьте на несколько вопросов — подберём врача и удобное время, а заявка уйдёт в WhatsApp готовым сообщением.',
    book: 'Записаться онлайн',
    features: ['Дентальный рентген на месте', 'Ответ в течение дня', 'Запись через WhatsApp'],
  },
  booking: {
    eyebrow: 'Онлайн-запись',
    title: 'Запись на приём',
    greeting:
      'Здравствуйте! Чтобы мы подобрали для вас идеальное время и врача, ответьте, пожалуйста, на несколько вопросов. Это займёт не более 1 минуты.',
    steps: ['Кто вы', 'Вопросы', 'Контакты'],
    pathTitle: 'Выберите, что вам подходит',
    firstVisit: { label: 'Я у вас впервые', hint: 'Первичный пациент' },
    intentTitle: 'Что вы хотите сделать?',
    paths: {
      booking: { label: 'Хочу записаться на приём', hint: 'Подберём врача и удобное время' },
      ask: { label: 'Хочу задать вопрос', hint: 'Ответим в WhatsApp, без записи' },
      returning: { label: 'Я ваш постоянный клиент', hint: 'Повторный пациент' },
    },
    messagePathNames: {
      booking: 'Первичный, запись на приём',
      ask: 'Первичный, вопрос',
      returning: 'Повторный пациент',
    },
    textLabels: {
      complaint: 'Что вас беспокоит?',
      question: 'Напишите ваш вопрос',
    },
    optionalHint: 'необязательно',
    textPlaceholders: {
      complaint: 'Напишите, что у вас болит, или укажите цель визита (например: болит зуб снизу, хочу налёт почистить, скололась пломба)',
      question: 'Задайте любой вопрос по стоимости, услугам или работе клиники. Администратор ответит вам в WhatsApp',
    },
    questions: {
      treatedBefore: {
        label: 'Ранее этот зуб уже лечили?',
        options: { treated: 'Да, он уже леченый / под пломбой / под коронкой', untreated: 'Нет, этот зуб ни разу не лечили', unknown: 'Не знаю / не помню' },
      },
      anesthesia: {
        label: 'Делали ли вам раньше анестезию (заморозку)?',
        options: { fine: 'Да, всё отлично, аллергии нет', reaction: 'Да, но бывали плохие реакции / аллергия', never: 'Никогда не делали / боюсь уколов' },
      },
      swelling: {
        label: 'Есть ли припухлость (отёк) десны или щеки?',
        options: { yes: 'Да, есть заметный отёк', no: 'Нет, внешне всё как обычно' },
      },
      biting: {
        label: 'Болит ли зуб при накусывании или нажатии?',
        options: { yes: 'Да, больно нажимать и жевать', no: 'Нет, при накусывании не болит' },
      },
      painType: {
        label: 'Каков характер боли?',
        options: { night: 'Зуб сильно болит по ночам (сам по себе)', sharp: 'Боли резкие, но быстро проходят (от холодного или сладкого)', cosmetic: 'Зуб не болит, беспокоит эстетика или дискомфорт' },
      },
      problem: {
        label: 'Какая проблема возникла?',
        options: { newTooth: 'Заболел НОВЫЙ зуб, который вы ещё не лечили', sameTooth: 'Беспокоит ТОТ зуб, который вы уже лечили', planned: 'Плановый осмотр, чистка или продолжение лечения' },
      },
    },
    messageNames: {
      complaint: 'Жалоба',
      question: 'Вопрос',
      treatedBefore: 'Лечили ранее',
      anesthesia: 'Анестезия',
      swelling: 'Отёк',
      biting: 'Боль при накусывании',
      painType: 'Характер боли',
      problem: 'Проблема',
    },
    requiredChoice: 'Выберите один из вариантов',
    requiredText: 'Заполните это поле',
    fullNameLabel: 'Фамилия, имя, отчество полностью',
    fullNamePlaceholder: 'Например, Иванова Мария Петровна',
    fullNameError: 'Укажите ФИО',
    birthLabel: 'Дата рождения',
    birthPlaceholder: 'дд.мм.гггг',
    birthError: 'Введите дату в формате дд.мм.гггг',
    phoneLabel: 'Номер телефона',
    phoneError: 'Введите 9 цифр номера',
    parentTitle: 'Родитель или опекун',
    parentNote: 'Пациенту меньше 18 лет — нужны данные взрослого',
    parentNameLabel: 'ФИО родителя',
    parentPhoneLabel: 'Телефон родителя',
    parentNameError: 'Укажите ФИО родителя',
    parentPhoneError: 'Введите 9 цифр номера',
    summary: 'Ваша заявка',
    confirmNote: 'Администратор подтвердит время в WhatsApp',
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить в WhatsApp',
  },
  units: { hour: 'ч', minute: 'мин' },
  months: [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ],
  monthsNominative: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  formatDate: (day, month) => `${day} ${month}`,
  message: {
    title: 'Новая заявка с сайта!',
    patientType: 'Тип пациента',
    fullName: 'ФИО',
    birth: 'Дата рождения',
    phone: 'Телефон',
    answers: 'Ответы на вопросы:',
  },
  location: {
    eyebrow: 'Как нас найти',
    title: 'Адрес и режим работы',
    address: 'г. Каракол, ул. Московская, 125',
    hoursTitle: 'Режим работы',
    dayOff: 'выходной',
    xray: 'Дентальный рентген в клинике',
    call: 'Позвонить',
  },
  footer: {
    rights: 'Все права защищены',
    note: 'Имеются противопоказания. Необходима консультация специалиста.',
  },
}

const ky: Dictionary = {
  header: {
    address: 'Каракол ш., Московская көч., 125',
    install: 'Тиркемени жүктөө',
    installShort: 'Орнотуу',
    language: 'Тил',
  },
  install: {
    banner: 'Тез жазылуу жана арзандатуу үчүн The Phoenix тиркемесин орнотуңуз',
    action: 'Орнотуу',
    dismiss: 'Жабуу',
    guideTitle: 'Тиркемени орнотуу',
    iosSteps: [
      'Safari панелиндеги «Бөлүшүү» баскычын басыңыз',
      '«Башкы экранга» пунктун тандаңыз',
      '«Кошуу» баскычын басыңыз — The Phoenix сүрөтчөсү башкы экранда пайда болот',
    ],
    otherSteps: [
      'Браузердин менюсун ачыңыз (⋮)',
      '«Тиркемени орнотуу» же «Башкы экранга кошуу» тандаңыз',
      'Орнотууну ырастаңыз',
    ],
    gotIt: 'Түшүндүм',
  },
  hero: {
    titleStart: 'Жылмаюуңузга кам көрүү',
    titleAccent: 'Караколдо, оорутпай',
    subtitle:
      'Бир нече суроого жооп бериңиз — дарыгерди жана ыңгайлуу убакытты тандайбыз, өтүнмө WhatsAppка даяр билдирүү болуп жөнөйт.',
    book: 'Онлайн жазылуу',
    features: ['Клиникада дентал рентген', 'Күн ичинде жооп', 'WhatsApp аркылуу жазылуу'],
  },
  booking: {
    eyebrow: 'Онлайн жазылуу',
    title: 'Кабылдамага жазылуу',
    greeting:
      'Саламатсызбы! Сизге ыңгайлуу убакытты жана дарыгерди тандашыбыз үчүн бир нече суроого жооп бериңиз. Бул 1 мүнөттөн ашпайт.',
    steps: ['Сиз кимсиз', 'Суроолор', 'Байланыш'],
    pathTitle: 'Сизге ылайыктуусун тандаңыз',
    firstVisit: { label: 'Биринчи жолу келем', hint: 'Жаңы бейтап' },
    intentTitle: 'Эмне кылгыңыз келет?',
    paths: {
      booking: { label: 'Кабылдамага жазылгым келет', hint: 'Дарыгерди жана ыңгайлуу убакытты тандайбыз' },
      ask: { label: 'Суроо бергим келет', hint: 'WhatsApp аркылуу жооп беребиз' },
      returning: { label: 'Мен туруктуу бейтабыңызмын', hint: 'Кайра келген бейтап' },
    },
    messagePathNames: {
      booking: 'Жаңы бейтап, жазылуу',
      ask: 'Жаңы бейтап, суроо',
      returning: 'Кайра келген бейтап',
    },
    textLabels: {
      complaint: 'Эмне тынчсыздандырат?',
      question: 'Сурооңузду жазыңыз',
    },
    optionalHint: 'милдеттүү эмес',
    textPlaceholders: {
      complaint: 'Эмне ооруганын же келүү максатыңызды жазыңыз (мисалы: астыңкы тиш ооруйт, таш тазалагым келет, пломба сынды)',
      question: 'Баа, кызматтар же клиниканын иши боюнча каалаган сурооңузду бериңиз. Администратор WhatsApp аркылуу жооп берет',
    },
    questions: {
      treatedBefore: {
        label: 'Бул тишти мурда дарылатканбысыз?',
        options: { treated: 'Ооба, дарыланган / пломба же коронка бар', untreated: 'Жок, бул тиш эч качан дарыланган эмес', unknown: 'Билбейм / эстей албайм' },
      },
      anesthesia: {
        label: 'Мурда анестезия (жансыздандыруу) жасалганбы?',
        options: { fine: 'Ооба, баары жакшы, аллергия жок', reaction: 'Ооба, бирок жаман реакция / аллергия болгон', never: 'Эч качан жасалган эмес / ийнеден коркомун' },
      },
      swelling: {
        label: 'Кызыл эт же бет шишип турабы?',
        options: { yes: 'Ооба, шишик байкалат', no: 'Жок, сырттан баары кадимкидей' },
      },
      biting: {
        label: 'Тиш басканда же чайнаганда ооруйбу?',
        options: { yes: 'Ооба, басканда жана чайнаганда ооруйт', no: 'Жок, басканда оорубайт' },
      },
      painType: {
        label: 'Оорунун мүнөзү кандай?',
        options: { night: 'Тиш түнкүсүн өзүнөн өзү катуу ооруйт', sharp: 'Оору курч, бирок тез басылат (суук же таттуудан)', cosmetic: 'Тиш оорубайт, сырткы көрүнүшү же ыңгайсыздык тынчсыздандырат' },
      },
      problem: {
        label: 'Кандай көйгөй пайда болду?',
        options: { newTooth: 'Дарыланбаган ЖАҢЫ тиш ооруп жатат', sameTooth: 'Мурда дарылаган ОШОЛ тиш тынчсыздандырат', planned: 'Пландуу текшерүү, тазалоо же дарылоону улантуу' },
      },
    },
    messageNames: {
      complaint: 'Арыз',
      question: 'Суроо',
      treatedBefore: 'Мурда дарыланган',
      anesthesia: 'Анестезия',
      swelling: 'Шишик',
      biting: 'Басканда ооруйбу',
      painType: 'Оорунун мүнөзү',
      problem: 'Көйгөй',
    },
    requiredChoice: 'Бир вариантты тандаңыз',
    requiredText: 'Бул талааны толтуруңуз',
    fullNameLabel: 'Аты-жөнү толук',
    fullNamePlaceholder: 'Мисалы, Иванова Мария Петровна',
    fullNameError: 'Аты-жөнүңүздү жазыңыз',
    birthLabel: 'Туулган күнү',
    birthPlaceholder: 'кк.аа.жжжж',
    birthError: 'Күндү кк.аа.жжжж түрүндө жазыңыз',
    phoneLabel: 'Телефон номери',
    phoneError: 'Номердин 9 цифрасын жазыңыз',
    parentTitle: 'Ата-эне же камкорчу',
    parentNote: 'Бейтап 18ге толо элек — чоң кишинин маалыматы керек',
    parentNameLabel: 'Ата-эненин аты-жөнү',
    parentPhoneLabel: 'Ата-эненин телефону',
    parentNameError: 'Ата-эненин аты-жөнүн жазыңыз',
    parentPhoneError: 'Номердин 9 цифрасын жазыңыз',
    summary: 'Сиздин өтүнмө',
    confirmNote: 'Администратор убакытты WhatsApp аркылуу ырастайт',
    back: 'Артка',
    next: 'Кийинки',
    submit: 'WhatsAppка жөнөтүү',
  },
  units: { hour: 'саат', minute: 'мүн' },
  months: [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ],
  monthsNominative: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  weekdaysShort: ['Жк', 'Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш'],
  formatDate: (day, month) => `${day}-${month}`,
  message: {
    title: 'Сайттан жаңы өтүнмө!',
    patientType: 'Бейтаптын түрү',
    fullName: 'Аты-жөнү',
    birth: 'Туулган күнү',
    phone: 'Телефон',
    answers: 'Суроолорго жооптор:',
  },
  location: {
    eyebrow: 'Бизди кантип табасыз',
    title: 'Дарек жана иш убактысы',
    address: 'Каракол ш., Московская көч., 125',
    hoursTitle: 'Иш убактысы',
    dayOff: 'дем алыш',
    xray: 'Клиникада дентал рентген бар',
    call: 'Чалуу',
  },
  footer: {
    rights: 'Бардык укуктар корголгон',
    note: 'Каршы көрсөтмөлөр бар. Адистин кеңеши зарыл.',
  },
}

const en: Dictionary = {
  header: {
    address: '125 Moskovskaya St., Karakol',
    install: 'Get the app',
    installShort: 'Install',
    language: 'Language',
  },
  install: {
    banner: 'Install The Phoenix app for faster booking and a discount',
    action: 'Install',
    dismiss: 'Close',
    guideTitle: 'Install the app',
    iosSteps: [
      'Tap the “Share” button in the Safari toolbar',
      'Choose “Add to Home Screen”',
      'Tap “Add” — The Phoenix icon will appear on your home screen',
    ],
    otherSteps: [
      'Open the browser menu (⋮)',
      'Choose “Install app” or “Add to Home screen”',
      'Confirm the installation',
    ],
    gotIt: 'Got it',
  },
  hero: {
    titleStart: 'Caring for your smile',
    titleAccent: 'in Karakol, pain-free',
    subtitle:
      'Answer a few questions — we will pick a dentist and a time, and your request goes to WhatsApp as a ready message.',
    book: 'Book online',
    features: ['Dental X-ray on site', 'Reply within the day', 'Booking via WhatsApp'],
  },
  booking: {
    eyebrow: 'Online booking',
    title: 'Book a visit',
    greeting:
      'Hello! To find you the right time and dentist, please answer a few questions. It takes no more than a minute.',
    steps: ['About you', 'Questions', 'Contacts'],
    pathTitle: 'Choose what fits you',
    firstVisit: { label: 'This is my first visit', hint: 'New patient' },
    intentTitle: 'What would you like to do?',
    paths: {
      booking: { label: 'I want to book a visit', hint: 'We will pick a dentist and a time' },
      ask: { label: 'I want to ask a question', hint: 'We will reply in WhatsApp' },
      returning: { label: 'I am a regular patient', hint: 'Returning patient' },
    },
    messagePathNames: {
      booking: 'New patient, booking',
      ask: 'New patient, question',
      returning: 'Returning patient',
    },
    textLabels: {
      complaint: 'What is bothering you?',
      question: 'Write your question',
    },
    optionalHint: 'optional',
    textPlaceholders: {
      complaint: 'Describe the pain or the goal of your visit (for example: a lower tooth hurts, I want a cleaning, a filling chipped)',
      question: 'Ask anything about prices, services or how the clinic works. The front desk will reply in WhatsApp',
    },
    questions: {
      treatedBefore: {
        label: 'Has this tooth been treated before?',
        options: { treated: 'Yes, it is filled or crowned', untreated: 'No, this tooth has never been treated', unknown: 'I do not know / do not remember' },
      },
      anesthesia: {
        label: 'Have you had anaesthesia before?',
        options: { fine: 'Yes, all fine, no allergy', reaction: 'Yes, but there were bad reactions or an allergy', never: 'Never had it / afraid of injections' },
      },
      swelling: {
        label: 'Is the gum or cheek swollen?',
        options: { yes: 'Yes, there is noticeable swelling', no: 'No, everything looks as usual' },
      },
      biting: {
        label: 'Does the tooth hurt when you bite or press on it?',
        options: { yes: 'Yes, it hurts to press and chew', no: 'No, biting does not hurt' },
      },
      painType: {
        label: 'What is the pain like?',
        options: { night: 'The tooth aches badly at night on its own', sharp: 'Sharp but short pain (from cold or sweet)', cosmetic: 'No pain, it is about looks or discomfort' },
      },
      problem: {
        label: 'What has happened?',
        options: { newTooth: 'A NEW tooth hurts, one you have not treated', sameTooth: 'The tooth you treated before is bothering me', planned: 'A check-up, a cleaning or continuing treatment' },
      },
    },
    messageNames: {
      complaint: 'Complaint',
      question: 'Question',
      treatedBefore: 'Treated before',
      anesthesia: 'Anaesthesia',
      swelling: 'Swelling',
      biting: 'Pain when biting',
      painType: 'Pain type',
      problem: 'Problem',
    },
    requiredChoice: 'Choose one option',
    requiredText: 'Please fill this in',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'For example, Maria Ivanova',
    fullNameError: 'Enter your full name',
    birthLabel: 'Date of birth',
    birthPlaceholder: 'dd.mm.yyyy',
    birthError: 'Enter the date as dd.mm.yyyy',
    phoneLabel: 'Phone number',
    phoneError: 'Enter all 9 digits',
    parentTitle: 'Parent or guardian',
    parentNote: 'The patient is under 18, so an adult must be named',
    parentNameLabel: 'Parent full name',
    parentPhoneLabel: 'Parent phone',
    parentNameError: 'Enter the parent name',
    parentPhoneError: 'Enter all 9 digits',
    summary: 'Your request',
    confirmNote: 'The front desk will confirm the time in WhatsApp',
    back: 'Back',
    next: 'Next',
    submit: 'Send to WhatsApp',
  },
  units: { hour: 'h', minute: 'min' },
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthsNominative: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  formatDate: (day, month) => `${month} ${day}`,
  message: {
    title: 'New request from the website!',
    patientType: 'Patient type',
    fullName: 'Full name',
    birth: 'Date of birth',
    phone: 'Phone',
    answers: 'Answers:',
  },
  location: {
    eyebrow: 'How to find us',
    title: 'Address and hours',
    address: '125 Moskovskaya St., Karakol',
    hoursTitle: 'Opening hours',
    dayOff: 'closed',
    xray: 'Dental X-ray in the clinic',
    call: 'Call',
  },
  footer: {
    rights: 'All rights reserved',
    note: 'Contraindications apply. Consult a specialist.',
  },
}

export const dictionaries: Record<Lang, Dictionary> = { ru, ky, en }
