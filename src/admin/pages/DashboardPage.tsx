import { useAuth } from '../auth/useAuth'
import { roleLabels } from '../labels'
import { PageHeader } from '../ui/primitives'

function greeting(hour: number) {
  if (hour < 5) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

export function DashboardPage() {
  const { staff } = useAuth()
  const firstName = staff?.full_name.split(/\s+/)[0]

  return (
    <PageHeader
      title={`${greeting(new Date().getHours())}${firstName ? `, ${firstName}` : ''}`}
      subtitle={staff ? roleLabels[staff.role] : undefined}
    />
  )
}
