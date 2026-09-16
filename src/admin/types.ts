// Row shapes of supabase/migrations/0001_crm.sql.

export type StaffRole = 'admin' | 'doctor'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'arrived' | 'completed' | 'no_show' | 'cancelled'
export type LeadKind = 'booking' | 'sos'
export type LeadStatus = 'new' | 'contacted' | 'booked' | 'rejected'
export type PaymentMethod = 'cash' | 'card' | 'transfer'
export type ServiceScope = 'tooth' | 'visit'
export type ServiceCategory =
  | 'therapy'
  | 'hygiene'
  | 'surgery'
  | 'orthopedics'
  | 'implants'
  | 'diagnostics'
  | 'orthodontics'
  | 'other'
export type ToothCondition =
  | 'healthy'
  | 'caries'
  | 'filled'
  | 'root_canal'
  | 'crown'
  | 'implant'
  | 'missing'
  | 'to_extract'
export type PatientSource = 'site' | 'walk_in' | 'phone' | 'referral' | 'instagram' | 'two_gis' | 'other'
export type InventoryReason = 'purchase' | 'usage' | 'writeoff' | 'correction'

export interface Staff {
  id: string
  full_name: string
  email: string | null
  role: StaffRole
  specialty: string | null
  phone: string | null
  color: string
  active: boolean
  created_at: string
}

export interface Chair {
  id: string
  name: string
  sort: number
  active: boolean
  created_at: string
}

export interface Patient {
  id: string
  full_name: string
  phone: string | null
  birth_date: string | null
  gender: 'male' | 'female' | null
  source: PatientSource
  allergies: string | null
  notes: string | null
  doctor_id: string | null
  created_by: string | null
  created_at: string
}

export interface Service {
  id: string
  code: string | null
  name: string
  category: ServiceCategory
  scope: ServiceScope
  price: number
  duration_minutes: number
  color: string
  sort: number
  active: boolean
  created_at: string
}

export interface Lead {
  id: string
  kind: LeadKind
  status: LeadStatus
  name: string | null
  phone: string | null
  summary: string | null
  estimate: number | null
  preferred_at: string | null
  lang: 'ru' | 'ky' | 'en' | null
  patient_id: string | null
  handled_by: string | null
  note: string | null
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  chair_id: string | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  note: string | null
  lead_id: string | null
  created_by: string | null
  created_at: string
}

export interface Treatment {
  id: string
  patient_id: string
  appointment_id: string | null
  doctor_id: string
  service_id: string | null
  title: string
  tooth: number | null
  quantity: number
  price: number
  discount: number
  total: number
  note: string | null
  performed_at: string
  created_at: string
}

export interface Payment {
  id: string
  patient_id: string
  amount: number
  method: PaymentMethod
  note: string | null
  paid_at: string
  received_by: string | null
  created_at: string
}

export interface ToothRecord {
  patient_id: string
  tooth: number
  condition: ToothCondition
  note: string | null
  updated_by: string | null
  updated_at: string
}

export interface PatientBalance {
  patient_id: string
  billed: number
  paid: number
  balance: number
}

export interface InventoryItem {
  id: string
  name: string
  category: string | null
  unit: string
  quantity: number
  min_quantity: number
  cost: number | null
  active: boolean
  created_at: string
}

export interface InventoryMovement {
  id: string
  item_id: string
  delta: number
  reason: InventoryReason
  note: string | null
  created_by: string | null
  created_at: string
}
