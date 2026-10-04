import { Ellipsis, LogOut } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useLeadCounts } from '../api/leads'
import { useAuth } from '../auth/useAuth'
import { useRealtimeInvalidation } from '../lib/useRealtimeInvalidation'
import { roleLabels } from '../labels'
import { Modal } from '../ui/Modal'
import { navigation, type NavItem } from './navigation'

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

function CountBadge({ count }: { count: number | undefined }) {
  if (!count) return null
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sos px-1.5 text-[11px] font-bold text-white tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function SidebarLink({ item, badge, onNavigate }: { item: NavItem; badge?: number; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
          isActive ? 'bg-accent/15 text-accent' : 'text-white/65 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon className="size-5 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      <CountBadge count={badge} />
    </NavLink>
  )
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-ink-900"
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </span>
  )
}

function UserCard({ action }: { action?: ReactNode }) {
  const { staff, session } = useAuth()
  if (!staff) return null
  return (
    <div className="flex items-center gap-3">
      <Avatar name={staff.full_name || session?.user.email || ''} color={staff.color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{staff.full_name || session?.user.email}</p>
        <p className="truncate text-xs text-white/45">{roleLabels[staff.role]}</p>
      </div>
      {action}
    </div>
  )
}

export function AdminLayout() {
  const { isAdmin, signOut } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const leadCounts = useLeadCounts(isAdmin)
  useRealtimeInvalidation('leads', ['leads'], isAdmin)
  const badgeFor = (item: NavItem) => (item.badge === 'newLeads' ? leadCounts.data?.new : undefined)

  const items = navigation.filter((item) => !item.adminOnly || isAdmin)
  const primary = items.filter((item) => item.primary).slice(0, 4)
  const secondary = items.filter((item) => !primary.includes(item))

  const signOutButton = (
    <button
      type="button"
      onClick={signOut}
      aria-label="Выйти"
      className="grid size-9 place-items-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white"
    >
      <LogOut className="size-4" />
    </button>
  )

  return (
    <div className="min-h-dvh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-ink-950/70 backdrop-blur-xl lg:flex">
        <NavLink to="/" className="flex h-16 items-center gap-3 px-5">
          <img src="/favicon.svg" alt="" className="size-9 rounded-xl shadow-glow" />
          <span className="font-display text-sm font-bold tracking-[0.18em]">
            PHOENIX <span className="text-accent">CRM</span>
          </span>
        </NavLink>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {items.map((item) => (
            <SidebarLink key={item.to} item={item} badge={badgeFor(item)} />
          ))}
        </nav>
        <div className="border-t border-white/5 p-4">
          <UserCard action={signOutButton} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/5 bg-ink-900/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl lg:hidden">
        <img src="/favicon.svg" alt="" className="size-8 rounded-lg" />
        <span className="flex-1 font-display text-sm font-bold tracking-[0.18em]">
          PHOENIX <span className="text-accent">CRM</span>
        </span>
        {signOutButton}
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-ink-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md">
          {primary.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                    isActive ? 'text-accent' : 'text-white/50'
                  }`
                }
              >
                <span className="relative">
                  <Icon className="size-5" />
                  <span className="absolute -top-2 -right-3">
                    <CountBadge count={badgeFor(item)} />
                  </span>
                </span>
                {item.label}
              </NavLink>
            )
          })}
          {secondary.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white/50"
            >
              <Ellipsis className="size-5" />
              Ещё
            </button>
          )}
        </div>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Меню">
        <div className="space-y-1">
          {secondary.map((item) => (
            <SidebarLink key={item.to} item={item} badge={badgeFor(item)} onNavigate={() => setMoreOpen(false)} />
          ))}
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <UserCard action={signOutButton} />
        </div>
      </Modal>
    </div>
  )
}
