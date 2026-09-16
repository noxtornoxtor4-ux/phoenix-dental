import type {
  AppointmentStatus,
  InventoryReason,
  LeadKind,
  LeadStatus,
  PatientSource,
  PaymentMethod,
  ServiceCategory,
  ServiceScope,
  StaffRole,
  ToothCondition,
} from './types'

interface Tone {
  label: string
  color: string
}

export const roleLabels: Record<StaffRole, string> = {
  admin: 'Администратор',
  doctor: 'Врач',
}

export const appointmentStatuses: Record<AppointmentStatus, Tone> = {
  scheduled: { label: 'Записан', color: '#60A5FA' },
  confirmed: { label: 'Подтверждён', color: '#00E5FF' },
  arrived: { label: 'Пришёл', color: '#FBBF24' },
  completed: { label: 'Завершён', color: '#34D399' },
  no_show: { label: 'Не пришёл', color: '#F87171' },
  cancelled: { label: 'Отменён', color: '#94A3B8' },
}

export const leadStatuses: Record<LeadStatus, Tone> = {
  new: { label: 'Новая', color: '#00E5FF' },
  contacted: { label: 'Связались', color: '#FBBF24' },
  booked: { label: 'Записан', color: '#34D399' },
  rejected: { label: 'Отказ', color: '#94A3B8' },
}

export const leadKinds: Record<LeadKind, Tone> = {
  booking: { label: 'Запись с сайта', color: '#60A5FA' },
  sos: { label: 'SOS: острая боль', color: '#FF3B5C' },
}

export const paymentMethods: Record<PaymentMethod, string> = {
  cash: 'Наличные',
  card: 'Карта',
  transfer: 'Перевод',
}

export const serviceScopes: Record<ServiceScope, string> = {
  tooth: 'за зуб',
  visit: 'за визит',
}

export const serviceCategories: Record<ServiceCategory, string> = {
  therapy: 'Терапия',
  hygiene: 'Гигиена',
  surgery: 'Хирургия',
  orthopedics: 'Ортопедия',
  implants: 'Имплантация',
  diagnostics: 'Диагностика',
  orthodontics: 'Ортодонтия',
  other: 'Другое',
}

export const toothConditions: Record<ToothCondition, Tone> = {
  healthy: { label: 'Здоров', color: '#E2E8F0' },
  caries: { label: 'Кариес', color: '#FFB020' },
  filled: { label: 'Пломба', color: '#60A5FA' },
  root_canal: { label: 'Лечение каналов', color: '#F472B6' },
  crown: { label: 'Коронка', color: '#A78BFA' },
  implant: { label: 'Имплант', color: '#34D399' },
  missing: { label: 'Отсутствует', color: '#475569' },
  to_extract: { label: 'Под удаление', color: '#FF3B5C' },
}

export const patientSources: Record<PatientSource, string> = {
  site: 'Сайт',
  walk_in: 'Пришёл сам',
  phone: 'Звонок',
  referral: 'По рекомендации',
  instagram: 'Instagram',
  two_gis: '2GIS',
  other: 'Другое',
}

export const inventoryReasons: Record<InventoryReason, string> = {
  purchase: 'Поступление',
  usage: 'Расход на приёме',
  writeoff: 'Списание',
  correction: 'Корректировка',
}
