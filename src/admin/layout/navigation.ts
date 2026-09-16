import { CalendarDays, LayoutDashboard, Users, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
  /** Shown in the phone bottom bar; the rest goes to the "More" sheet. */
  primary?: boolean
}

export const navigation: NavItem[] = [
  { to: '/', label: 'Главная', icon: LayoutDashboard, primary: true },
  { to: '/schedule', label: 'Расписание', icon: CalendarDays, primary: true },
  { to: '/patients', label: 'Пациенты', icon: Users, primary: true },
]
