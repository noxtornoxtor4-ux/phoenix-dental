import { useQuery } from '@tanstack/react-query'
import { KeyRound, LogIn, Mail, UserRoundPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { describeError } from '../lib/errors'
import { supabase, unwrap } from '../lib/supabase'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Field'
import { FullScreenSpinner } from '../ui/primitives'
import { AuthScreen } from './AuthScreen'

type Mode = 'signIn' | 'forgot'

export function LoginPage() {
  const hasStaff = useQuery({
    queryKey: ['has-staff'],
    queryFn: async () => unwrap(await supabase.rpc('has_staff')) as boolean,
  })

  if (hasStaff.isPending) return <FullScreenSpinner />
  // If the check fails (e.g. the migration is not applied yet), show the regular login form.
  if (hasStaff.data === false) return <FirstAdminForm onCreated={() => hasStaff.refetch()} />
  return <SignInForm />
}

function SignInForm() {
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const result =
      mode === 'signIn'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin` })
    setBusy(false)
    if (result.error) setError(describeError(result.error))
    else if (mode === 'forgot') setNotice('Если такой email зарегистрирован, мы отправили ссылку для смены пароля.')
  }

  return (
    <AuthScreen
      title={mode === 'signIn' ? 'Вход для сотрудников' : 'Восстановление пароля'}
      subtitle={mode === 'forgot' ? 'Укажите email — пришлём ссылку для нового пароля.' : undefined}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email">
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        {mode === 'signIn' && (
          <Field label="Пароль">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        )}
        {error && <p className="text-sm text-sos">{error}</p>}
        {notice && <p className="text-sm text-emerald-400">{notice}</p>}
        <Button type="submit" variant="primary" icon={mode === 'signIn' ? LogIn : Mail} loading={busy} className="w-full">
          {mode === 'signIn' ? 'Войти' : 'Отправить ссылку'}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'signIn' ? 'forgot' : 'signIn')
          setError(null)
          setNotice(null)
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-white/55 transition hover:text-white"
      >
        <KeyRound className="size-4" />
        {mode === 'signIn' ? 'Забыли пароль?' : 'Вернуться ко входу'}
      </button>
    </AuthScreen>
  )
}

function FirstAdminForm({ onCreated }: { onCreated: () => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmEmail, setConfirmEmail] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${location.origin}/admin` },
    })
    setBusy(false)
    if (signUpError) setError(describeError(signUpError))
    // Without a session the project requires email confirmation first.
    else if (!data.session) setConfirmEmail(true)
    else onCreated()
  }

  if (confirmEmail) {
    return (
      <AuthScreen title="Подтвердите email" subtitle={`Мы отправили письмо на ${email}. Откройте ссылку в нём и войдите.`}>
        <Button variant="primary" className="w-full" onClick={onCreated}>
          Перейти ко входу
        </Button>
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title="Первый запуск CRM"
      subtitle="Создайте аккаунт администратора. Остальных сотрудников вы добавите уже внутри CRM."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Имя и фамилия">
          <Input autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
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
        <Button type="submit" variant="primary" icon={UserRoundPlus} loading={busy} className="w-full">
          Создать администратора
        </Button>
      </form>
    </AuthScreen>
  )
}
