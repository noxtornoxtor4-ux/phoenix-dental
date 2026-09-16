import { Hourglass, LogOut, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { describeError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Field'
import { AuthScreen } from './AuthScreen'
import { useAuth } from './useAuth'

export function SetPasswordPage() {
  const { finishRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(describeError(updateError))
    else finishRecovery()
  }

  return (
    <AuthScreen title="Новый пароль">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Пароль" hint="Минимум 8 символов">
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <p className="text-sm text-sos">{error}</p>}
        <Button type="submit" variant="primary" icon={Save} loading={busy} className="w-full">
          Сохранить пароль
        </Button>
      </form>
    </AuthScreen>
  )
}

export function PendingAccountPage() {
  const { session, staffError, signOut } = useAuth()

  return (
    <AuthScreen
      title={staffError ? 'Не удалось загрузить профиль' : 'Аккаунт ожидает подтверждения'}
      subtitle={
        staffError
          ? describeError(staffError)
          : `Вы вошли как ${session?.user.email}. Попросите администратора клиники активировать ваш доступ.`
      }
    >
      <div className="mb-5 grid place-items-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
          <Hourglass className="size-7" />
        </span>
      </div>
      <Button icon={LogOut} className="w-full" onClick={signOut}>
        Выйти
      </Button>
    </AuthScreen>
  )
}

export function ConfigMissingPage() {
  return (
    <AuthScreen
      title="CRM ещё не подключена к базе"
      subtitle="Добавьте переменные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (файл .env.local или настройки Vercel) и пересоберите проект."
    >
      <a href="/" className="block text-center text-sm text-accent hover:underline">
        Вернуться на сайт
      </a>
    </AuthScreen>
  )
}
