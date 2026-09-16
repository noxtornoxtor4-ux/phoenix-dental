import { CalendarDays, Inbox, LayoutDashboard, Users, Wallet, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
  /** Shown in the phone bottom bar; the rest goes to the "More" sheet. */
  primary?: boolean
  /** Shows the number of new site requests. */
  badge?: 'newLeads'
}

export const navigation: NavItem[] = [
  { to: '/', label: 'Главная', icon: LayoutDashboard, primary: true },
  { to: '/schedule', label: 'Расписание', icon: CalendarDays, primary: true },
  { to: '/patients', label: 'Пациенты', icon: Users, primary: true },
  { to: '/leads', label: 'Заявки', icon: Inbox, adminOnly: true, primary: true, badge: 'newLeads' },
  { to: '/finance', label: 'Финансы', icon: Wallet, adminOnly: true },
]
