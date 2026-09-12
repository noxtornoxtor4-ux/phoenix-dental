import type { ServiceId } from '../data/services'
import type { ToothKind } from '../data/teeth'
import type { SlotStatus } from '../lib/slots'

export type Lang = 'ru' | 'ky' | 'en'

export const languages: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'ky', label: 'KG' },
  { code: 'en', label: 'EN' },
]

interface ServiceText {
  name: string
  description: string
}

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
    badge: string
    titleStart: string
    titleAccent: string
    subtitle: string
    book: string
    pickTooth: string
    features: string[]
  }
  compare: {
    title: string
    cleaning: string
    whitening: string
    before: string
    after: string
    hint: string
    caption: string
    sliderLabel: string
  }
  booking: {
    eyebrow: string
    title: string
    subtitle: string
    steps: string[]
    modeChart: string
    modeList: string
    upperJaw: string
    lowerJaw: string
    chartHint: string
    toothTitle: (toothNumber: number) => string
    toothKinds: Record<ToothKind, string>
    problemQuestion: string
    removeTooth: string
    selected: string
    clear: string
    empty: string
    perTooth: string
    perVisit: string
    dateTitle: string
    timeTitle: string
    prevMonth: string
    nextMonth: string
    customTime: string
    chosen: string
    timeErrors: Record<Exclude<SlotStatus, 'available'>, (open: string, close: string) => string>
    confirmNote: string
    nameLabel: string
    namePlaceholder: string
    phoneLabel: string
    nameError: string
    phoneError: string
    summary: string
    back: string
    next: string
    submit: string
    estimate: string
    priceFrom: (price: string) => string
    duration: string
    visitsNote: string
    disclaimer: string
  }
  problems: Record<ServiceId, string>
  services: Record<ServiceId, ServiceText>
  units: { hour: string; minute: string }
  months: string[]
  /** Month names for calendar headers. */
  monthsNominative: string[]
  weekdaysShort: string[]
  formatDate: (day: number, month: string) => string
  message: { greeting: string; service: string; price: string; dateTime: string; patient: string }
  toothLabel: (toothNumber: number) => string
  sos: { button: string; title: string; body: string; aria: string }
  location: {
    eyebrow: string
    title: string
    address: string
    hoursTitle: string
    dayOff: string
    xray: string
    route: string
    call: string
    mapTitle: string
  }
  footer: { rights: string; note: string }
  dock: { book: string }
}

const ru: Dictionary = {
  header: {
    address: 'г. Каракол, ул. Токтогула, 263',
    install: 'Скачать приложение',
    installShort: 'Установить',
    language: 'Язык',
  },
  install: {
    banner: 'Установите приложение PHOENIX для быстрой записи и скидки',
    action: 'Установить',
    dismiss: 'Закрыть',
    guideTitle: 'Установка приложения',
    iosSteps: [
      'Нажмите кнопку «Поделиться» в панели Safari',
      'Выберите пункт «На экран „Домой“»',
      'Нажмите «Добавить» — иконка PHOENIX появится на главном экране',
    ],
    otherSteps: [
      'Откройте меню браузера (⋮)',
      'Выберите «Установить приложение» или «Добавить на главный экран»',
      'Подтвердите установку',
    ],
    gotIt: 'Понятно',
  },
  hero: {
    badge: 'Стоматология в Караколе',
    titleStart: 'Забота о вашей улыбке',
    titleAccent: 'в Караколе без боли',
    subtitle:
      'Отметьте беспокоящий зуб на интерактивной схеме — мы сразу покажем ориентировочную стоимость и время приёма.',
    book: 'Записаться онлайн',
    pickTooth: 'Выбрать зуб',
    features: ['Дентальный рентген на месте', 'Смета до визита', 'Запись через WhatsApp'],
  },
  compare: {
    title: 'До / после',
    cleaning: 'Чистка',
    whitening: 'Отбеливание',
    before: 'До',
    after: 'После',
    hint: 'Потяните ползунок',
    caption: 'Иллюстрация результата',
    sliderLabel: 'Сравнение до и после',
  },
  booking: {
    eyebrow: 'Онлайн-запись',
    title: 'Калькулятор и запись',
    subtitle:
      'Три шага: зуб или услуга, дата и время, контакты. Заявка уйдёт в WhatsApp готовым сообщением.',
    steps: ['Зуб или услуга', 'Дата и время', 'Контакты'],
    modeChart: 'Схема зубов',
    modeList: 'Список услуг',
    upperJaw: 'Верхняя челюсть',
    lowerJaw: 'Нижняя челюсть',
    chartHint: 'Нажмите на зуб, чтобы выбрать проблему',
    toothTitle: (n) => `Зуб №${n}`,
    toothKinds: { incisor: 'Резец', canine: 'Клык', premolar: 'Премоляр', molar: 'Моляр' },
    problemQuestion: 'Что беспокоит?',
    removeTooth: 'Снять отметку',
    selected: 'Выбрано',
    clear: 'Сбросить',
    empty: 'Выберите зуб на схеме или услугу из списка',
    perTooth: 'за зуб',
    perVisit: 'за визит',
    dateTitle: 'Выберите дату',
    timeTitle: 'Свободное время',
    prevMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    customTime: 'Или укажите удобное время',
    chosen: 'Вы выбрали',
    timeErrors: {
      dayOff: () => 'В этот день клиника не работает — выберите другую дату',
      closed: (open, close) => `Клиника принимает с ${open} до ${close}`,
      tooSoon: () => 'Это время уже недоступно — выберите позже',
      tooLate: (_open, close) => `Приём не успеет завершиться до ${close} — выберите время раньше`,
    },
    confirmNote: 'Администратор подтвердит время в WhatsApp',
    nameLabel: 'Ваше имя',
    namePlaceholder: 'Например, Айгерим',
    phoneLabel: 'Номер телефона',
    nameError: 'Введите имя',
    phoneError: 'Введите 9 цифр номера',
    summary: 'Ваша заявка',
    back: 'Назад',
    next: 'Далее',
    submit: 'Записаться в WhatsApp',
    estimate: 'Предварительно',
    priceFrom: (price) => `от ${price} сом`,
    duration: 'Время приёма',
    visitsNote: 'Лечение может занять несколько визитов',
    disclaimer: 'Цены ориентировочные. Точная стоимость — после осмотра врача.',
  },
  problems: {
    therapy: 'Кариес',
    pain: 'Острая боль',
    hygiene: 'Чистка',
    prosthetics: 'Протезирование',
    implant: 'Имплант',
    xray: 'Рентген',
  },
  services: {
    therapy: { name: 'Терапия', description: 'Лечение кариеса, пломбы' },
    pain: { name: 'Острая боль', description: 'Неотложная помощь' },
    hygiene: { name: 'Профессиональная чистка', description: 'Удаление зубного камня и налёта' },
    prosthetics: { name: 'Ортопедия', description: 'Коронки и протезы' },
    implant: { name: 'Имплантация', description: 'Восстановление утраченного зуба' },
    xray: { name: 'Дентальный рентген', description: 'Прицельный снимок зуба' },
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
    greeting: 'Здравствуйте! Хочу записаться в клинику PHOENIX (Каракол).',
    service: 'Услуга / Зуб',
    price: 'Ориентир цены',
    dateTime: 'Дата и время',
    patient: 'Пациент',
  },
  toothLabel: (n) => `№${n}`,
  sos: {
    button: 'Острая боль',
    title: 'СРОЧНО: Острая боль',
    body: 'Здравствуйте! У меня острая зубная боль, прошу принять как можно скорее. PHOENIX (Каракол).',
    aria: 'Срочная заявка при острой боли в WhatsApp',
  },
  location: {
    eyebrow: 'Как нас найти',
    title: 'Локация и навигация',
    address: 'г. Каракол, ул. Токтогула, 263',
    hoursTitle: 'Режим работы',
    dayOff: 'выходной',
    xray: 'Дентальный рентген в клинике',
    route: 'Построить маршрут',
    call: 'Позвонить',
    mapTitle: 'Карта проезда',
  },
  footer: {
    rights: 'Все права защищены',
    note: 'Имеются противопоказания. Необходима консультация специалиста.',
  },
  dock: { book: 'Записаться' },
}

const ky: Dictionary = {
  header: {
    address: 'Каракол ш., Токтогул көч., 263',
    install: 'Тиркемени жүктөө',
    installShort: 'Орнотуу',
    language: 'Тил',
  },
  install: {
    banner: 'Тез жазылуу жана арзандатуу үчүн PHOENIX тиркемесин орнотуңуз',
    action: 'Орнотуу',
    dismiss: 'Жабуу',
    guideTitle: 'Тиркемени орнотуу',
    iosSteps: [
      'Safari панелиндеги «Бөлүшүү» баскычын басыңыз',
      '«Башкы экранга» пунктун тандаңыз',
      '«Кошуу» баскычын басыңыз — PHOENIX сүрөтчөсү башкы экранда пайда болот',
    ],
    otherSteps: [
      'Браузердин менюсун ачыңыз (⋮)',
      '«Тиркемени орнотуу» же «Башкы экранга кошуу» тандаңыз',
      'Орнотууну ырастаңыз',
    ],
    gotIt: 'Түшүндүм',
  },
  hero: {
    badge: 'Караколдогу стоматология',
    titleStart: 'Жылмаюуңузга кам көрүү',
    titleAccent: 'Караколдо, оорутпай',
    subtitle:
      'Тынчсыздандырган тишти интерактивдүү схемадан белгилеңиз — болжолдуу баасын жана кабыл алуу убактысын дароо көрсөтөбүз.',
    book: 'Онлайн жазылуу',
    pickTooth: 'Тиш тандоо',
    features: ['Клиникада дентал рентген', 'Баасы визитке чейин', 'WhatsApp аркылуу жазылуу'],
  },
  compare: {
    title: 'Чейин / кийин',
    cleaning: 'Тазалоо',
    whitening: 'Агартуу',
    before: 'Чейин',
    after: 'Кийин',
    hint: 'Сыдырманы жылдырыңыз',
    caption: 'Натыйжанын иллюстрациясы',
    sliderLabel: 'Чейин жана кийин салыштыруу',
  },
  booking: {
    eyebrow: 'Онлайн жазылуу',
    title: 'Калькулятор жана жазылуу',
    subtitle:
      'Үч кадам: тиш же кызмат, күн жана убакыт, байланыш. Өтүнмө WhatsAppка даяр билдирүү болуп жөнөтүлөт.',
    steps: ['Тиш же кызмат', 'Күн жана убакыт', 'Байланыш'],
    modeChart: 'Тиш схемасы',
    modeList: 'Кызматтар тизмеси',
    upperJaw: 'Үстүңкү жаак',
    lowerJaw: 'Астыңкы жаак',
    chartHint: 'Көйгөйдү тандоо үчүн тишти басыңыз',
    toothTitle: (n) => `№${n} тиш`,
    toothKinds: { incisor: 'Кесүүчү тиш', canine: 'Ит азуу', premolar: 'Кичи азуу', molar: 'Азуу тиш' },
    problemQuestion: 'Эмне тынчсыздандырат?',
    removeTooth: 'Белгини алып салуу',
    selected: 'Тандалды',
    clear: 'Баарын өчүрүү',
    empty: 'Схемадан тишти же тизмеден кызматты тандаңыз',
    perTooth: 'бир тиш үчүн',
    perVisit: 'бир визит үчүн',
    dateTitle: 'Күндү тандаңыз',
    timeTitle: 'Бош убакыт',
    prevMonth: 'Мурунку ай',
    nextMonth: 'Кийинки ай',
    customTime: 'Же өзүңүзгө ыңгайлуу убакытты жазыңыз',
    chosen: 'Сиз тандадыңыз',
    timeErrors: {
      dayOff: () => 'Бул күнү клиника иштебейт — башка күндү тандаңыз',
      closed: (open, close) => `Клиниканын иш убактысы: ${open}–${close}`,
      tooSoon: () => 'Бул убакыт жеткиликсиз — кечирээк убакытты тандаңыз',
      tooLate: (_open, close) => `Кабыл алуу саат ${close} чейин бүтпөй калат — эртерээк убакытты тандаңыз`,
    },
    confirmNote: 'Администратор убакытты WhatsApp аркылуу ырастайт',
    nameLabel: 'Атыңыз',
    namePlaceholder: 'Мисалы, Айгерим',
    phoneLabel: 'Телефон номери',
    nameError: 'Атыңызды жазыңыз',
    phoneError: 'Номердин 9 цифрасын жазыңыз',
    summary: 'Сиздин өтүнмө',
    back: 'Артка',
    next: 'Кийинки',
    submit: 'WhatsApp аркылуу жазылуу',
    estimate: 'Болжолдуу',
    priceFrom: (price) => `${price} сомдон`,
    duration: 'Кабыл алуу убактысы',
    visitsNote: 'Дарылоо бир нече визитке созулушу мүмкүн',
    disclaimer: 'Баалар болжолдуу. Так баасы дарыгер карагандан кийин аныкталат.',
  },
  problems: {
    therapy: 'Кариес',
    pain: 'Катуу оору',
    hygiene: 'Тазалоо',
    prosthetics: 'Протездөө',
    implant: 'Имплант',
    xray: 'Рентген',
  },
  services: {
    therapy: { name: 'Терапия', description: 'Кариести дарылоо, пломба' },
    pain: { name: 'Катуу оору', description: 'Шашылыш жардам' },
    hygiene: { name: 'Кесипкөй тазалоо', description: 'Тиш таштарын жана кирди тазалоо' },
    prosthetics: { name: 'Ортопедия', description: 'Коронкалар жана протездер' },
    implant: { name: 'Имплантация', description: 'Жоголгон тишти калыбына келтирүү' },
    xray: { name: 'Дентал рентген', description: 'Тиштин максаттуу сүрөтү' },
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
    greeting: 'Саламатсызбы! PHOENIX клиникасына (Каракол) жазылгым келет.',
    service: 'Кызмат / Тиш',
    price: 'Болжолдуу баасы',
    dateTime: 'Күнү жана убактысы',
    patient: 'Бейтап',
  },
  toothLabel: (n) => `№${n}`,
  sos: {
    button: 'Катуу оору',
    title: 'ШАШЫЛЫШ: Катуу оору',
    body: 'Саламатсызбы! Тишим катуу ооруп жатат, мүмкүн болушунча тезирээк кабыл алып коюңузчу. PHOENIX (Каракол).',
    aria: 'Катуу ооруда WhatsApp аркылуу шашылыш өтүнмө',
  },
  location: {
    eyebrow: 'Бизди кантип табасыз',
    title: 'Дарек жана жол',
    address: 'Каракол ш., Токтогул көч., 263',
    hoursTitle: 'Иш убактысы',
    dayOff: 'дем алыш',
    xray: 'Клиникада дентал рентген бар',
    route: 'Маршрут түзүү',
    call: 'Чалуу',
    mapTitle: 'Жол картасы',
  },
  footer: {
    rights: 'Бардык укуктар корголгон',
    note: 'Каршы көрсөтмөлөр бар. Адистин кеңеши зарыл.',
  },
  dock: { book: 'Жазылуу' },
}

const en: Dictionary = {
  header: {
    address: '263 Toktogul St., Karakol',
    install: 'Get the app',
    installShort: 'Install',
    language: 'Language',
  },
  install: {
    banner: 'Install the PHOENIX app for faster booking and a discount',
    action: 'Install',
    dismiss: 'Close',
    guideTitle: 'Install the app',
    iosSteps: [
      'Tap the “Share” button in the Safari toolbar',
      'Choose “Add to Home Screen”',
      'Tap “Add” — the PHOENIX icon will appear on your home screen',
    ],
    otherSteps: [
      'Open the browser menu (⋮)',
      'Choose “Install app” or “Add to Home screen”',
      'Confirm the installation',
    ],
    gotIt: 'Got it',
  },
  hero: {
    badge: 'Dental clinic in Karakol',
    titleStart: 'Caring for your smile',
    titleAccent: 'in Karakol, pain-free',
    subtitle:
      'Tap the tooth that bothers you on the interactive chart — we will instantly show an estimated price and visit time.',
    book: 'Book online',
    pickTooth: 'Pick a tooth',
    features: ['Dental X-ray on site', 'Estimate before the visit', 'Booking via WhatsApp'],
  },
  compare: {
    title: 'Before / after',
    cleaning: 'Cleaning',
    whitening: 'Whitening',
    before: 'Before',
    after: 'After',
    hint: 'Drag the slider',
    caption: 'Illustration of the result',
    sliderLabel: 'Before and after comparison',
  },
  booking: {
    eyebrow: 'Online booking',
    title: 'Calculator & booking',
    subtitle:
      'Three steps: tooth or service, date and time, contacts. Your request goes to WhatsApp as a ready message.',
    steps: ['Tooth or service', 'Date & time', 'Contacts'],
    modeChart: 'Tooth chart',
    modeList: 'Service list',
    upperJaw: 'Upper jaw',
    lowerJaw: 'Lower jaw',
    chartHint: 'Tap a tooth to choose a problem',
    toothTitle: (n) => `Tooth #${n}`,
    toothKinds: { incisor: 'Incisor', canine: 'Canine', premolar: 'Premolar', molar: 'Molar' },
    problemQuestion: 'What bothers you?',
    removeTooth: 'Remove mark',
    selected: 'Selected',
    clear: 'Reset',
    empty: 'Pick a tooth on the chart or a service from the list',
    perTooth: 'per tooth',
    perVisit: 'per visit',
    dateTitle: 'Choose a date',
    timeTitle: 'Available time',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    customTime: 'Or enter a time that suits you',
    chosen: 'Your choice',
    timeErrors: {
      dayOff: () => 'The clinic is closed on this day — pick another date',
      closed: (open, close) => `Opening hours: ${open}–${close}`,
      tooSoon: () => 'This time is no longer available — pick a later one',
      tooLate: (_open, close) => `The visit would run past ${close} — pick an earlier time`,
    },
    confirmNote: 'The front desk will confirm the time in WhatsApp',
    nameLabel: 'Your name',
    namePlaceholder: 'e.g. Aigerim',
    phoneLabel: 'Phone number',
    nameError: 'Enter your name',
    phoneError: 'Enter all 9 digits',
    summary: 'Your request',
    back: 'Back',
    next: 'Next',
    submit: 'Book via WhatsApp',
    estimate: 'Estimate',
    priceFrom: (price) => `from ${price} som`,
    duration: 'Visit time',
    visitsNote: 'Treatment may take several visits',
    disclaimer: 'Prices are indicative. The exact cost is set after an examination.',
  },
  problems: {
    therapy: 'Caries',
    pain: 'Acute pain',
    hygiene: 'Cleaning',
    prosthetics: 'Prosthetics',
    implant: 'Implant',
    xray: 'X-ray',
  },
  services: {
    therapy: { name: 'Therapy', description: 'Caries treatment, fillings' },
    pain: { name: 'Acute pain', description: 'Emergency care' },
    hygiene: { name: 'Professional cleaning', description: 'Tartar and plaque removal' },
    prosthetics: { name: 'Prosthodontics', description: 'Crowns and dentures' },
    implant: { name: 'Implantation', description: 'Replacing a missing tooth' },
    xray: { name: 'Dental X-ray', description: 'Targeted tooth image' },
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
    greeting: 'Hello! I would like to book a visit at PHOENIX clinic (Karakol).',
    service: 'Service / Tooth',
    price: 'Estimated price',
    dateTime: 'Date and time',
    patient: 'Patient',
  },
  toothLabel: (n) => `#${n}`,
  sos: {
    button: 'Acute pain',
    title: 'URGENT: Acute pain',
    body: 'Hello! I have acute tooth pain and need to be seen as soon as possible. PHOENIX (Karakol).',
    aria: 'Urgent acute pain request via WhatsApp',
  },
  location: {
    eyebrow: 'How to find us',
    title: 'Location & directions',
    address: '263 Toktogul St., Karakol',
    hoursTitle: 'Opening hours',
    dayOff: 'closed',
    xray: 'Dental X-ray in the clinic',
    route: 'Get directions',
    call: 'Call',
    mapTitle: 'Map',
  },
  footer: {
    rights: 'All rights reserved',
    note: 'Contraindications apply. Consult a specialist.',
  },
  dock: { book: 'Book' },
}

export const dictionaries: Record<Lang, Dictionary> = { ru, ky, en }
