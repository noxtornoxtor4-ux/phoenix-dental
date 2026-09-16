import { Armchair, Pencil, Plus, Save, ShieldCheck, UserCog, UserRoundPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { formatPhone, isValidLocalDigits, toE164, toLocalDigits } from '../../../lib/phone'
import { useChairs, useSaveChair } from '../../api/chairs'
import { StaffAccountExistsError, useCreateStaffAccount, useSaveStaff, useStaff, type StaffInput } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { roleLabels } from '../../labels'
import type { Chair, Staff, StaffRole } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Input, Select } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { PhoneInput } from '../../ui/PhoneInput'
import { Badge, cardClass, ErrorState, LoadingBlock, PageHeader } from '../../ui/primitives'
import { useToast } from '../../ui/toastContext'

const palette = ['#00E5FF', '#A78BFA', '#34D399', '#FBBF24', '#F472B6', '#60A5FA', '#FB7185', '#2DD4BF']

function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export function StaffPage() {
  const staff = useStaff()
  const [editing, setEditing] = useState<Staff | 'new' | null>(null)

  return (
    <>
      <PageHeader
        title="Сотрудники"
        subtitle="Доступ к CRM, роли и цвета в расписании"
        actions={
          <Button variant="primary" icon={UserRoundPlus} onClick={() => setEditing('new')}>
            Добавить сотрудника
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
        <p className={`${cardClass} flex gap-3 p-4 text-white/65`}>
          <ShieldCheck className="size-5 shrink-0 text-accent" />
          <span>
            <b className="text-white">Администратор</b> видит всё: заявки, финансы, прайс, склад и сотрудников.
          </span>
        </p>
        <p className={`${cardClass} flex gap-3 p-4 text-white/65`}>
          <UserCog className="size-5 shrink-0 text-accent" />
          <span>
            <b className="text-white">Врач</b> видит только своё расписание и своих пациентов, может списывать материалы.
          </span>
        </p>
      </div>

      {staff.isPending ? (
        <LoadingBlock />
      ) : staff.isError ? (
        <ErrorState error={staff.error} onRetry={() => staff.refetch()} />
      ) : (
        <ul className={`${cardClass} divide-y divide-white/5 overflow-hidden`}>
          {staff.data.map((member) => (
            <li key={member.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${member.active ? '' : 'opacity-60'}`}>
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-navy-900"
                style={{ backgroundColor: member.color }}
              >
                {(member.full_name || member.email || '?').slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{member.full_name || 'Без имени'}</p>
                <p className="truncate text-xs text-white/50">
                  {[member.specialty, member.email, formatPhone(member.phone)].filter(Boolean).join(' · ')}
                </p>
              </div>
              <Badge color={member.role === 'admin' ? '#FBBF24' : '#60A5FA'}>{roleLabels[member.role]}</Badge>
              {!member.active && <Badge color="#94A3B8">Нет доступа</Badge>}
              <Button size="icon" variant="ghost" aria-label="Изменить" onClick={() => setEditing(member)}>
                <Pencil className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ChairsSection />

      {editing === 'new' && <CreateStaffModal onClose={() => setEditing(null)} />}
      {editing && editing !== 'new' && <EditStaffModal member={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

interface ProfileFieldsProps {
  value: StaffInput
  phoneDigits: string
  onChange: (value: StaffInput) => void
  onPhoneChange: (digits: string) => void
  showErrors: boolean
  lockRole?: boolean
}

function ProfileFields({ value, phoneDigits, onChange, onPhoneChange, showErrors, lockRole = false }: ProfileFieldsProps) {
  const set = <K extends keyof StaffInput>(key: K, next: StaffInput[K]) => onChange({ ...value, [key]: next })
  const phoneInvalid = phoneDigits !== '' && !isValidLocalDigits(phoneDigits)

  return (
    <>
      <Field label="Имя и фамилия *" error={showErrors && !value.full_name.trim() ? 'Укажите имя' : null} className="sm:col-span-2">
        <Input value={value.full_name} onChange={(e) => set('full_name', e.target.value)} maxLength={120} />
      </Field>
      <Field label="Роль" hint={lockRole ? 'Свою роль изменить нельзя' : undefined}>
        <Select value={value.role} disabled={lockRole} onChange={(e) => set('role', e.target.value as StaffRole)}>
          {Object.entries(roleLabels).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Специальность">
        <Input
          value={value.specialty ?? ''}
          onChange={(e) => set('specialty', e.target.value || null)}
          maxLength={120}
          placeholder="Терапевт, хирург…"
        />
      </Field>
      <Field label="Телефон" error={showErrors && phoneInvalid ? 'Введите 9 цифр' : null}>
        <PhoneInput digits={phoneDigits} onChange={onPhoneChange} invalid={showErrors && phoneInvalid} />
      </Field>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-white/60">Цвет в расписании</p>
        <div className="flex flex-wrap gap-2">
          {palette.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Цвет ${color}`}
              aria-pressed={value.color === color}
              onClick={() => set('color', color)}
              className={`size-8 rounded-full transition ${value.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-800' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

const emptyProfile: StaffInput = { full_name: '', role: 'doctor', specialty: null, phone: null, color: palette[0], active: true }

function CreateStaffModal({ onClose }: { onClose: () => void }) {
  const create = useCreateStaffAccount()
  const toast = useToast()
  const [profile, setProfile] = useState(emptyProfile)
  const [phoneDigits, setPhoneDigits] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(generatePassword)
  const [showErrors, setShowErrors] = useState(false)
  const [created, setCreated] = useState<{ needsConfirmation: boolean } | null>(null)

  const invalid =
    !profile.full_name.trim() ||
    !/^\S+@\S+\.\S+$/.test(email.trim()) ||
    password.length < 8 ||
    (phoneDigits !== '' && !isValidLocalDigits(phoneDigits))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (invalid) {
      setShowErrors(true)
      return
    }
    try {
      const result = await create.mutateAsync({
        email: email.trim(),
        password,
        input: { ...profile, full_name: profile.full_name.trim(), phone: phoneDigits ? toE164(phoneDigits) : null },
      })
      setCreated(result)
    } catch (error) {
      toast.error(error instanceof StaffAccountExistsError ? { message: error.message } : error)
    }
  }

  if (created) {
    return (
      <Modal open onClose={onClose} title="Сотрудник добавлен">
        <div className="space-y-3 text-sm">
          <p className="text-white/70">Передайте сотруднику данные для входа:</p>
          <dl className="space-y-2 rounded-2xl bg-white/5 p-4">
            <div className="flex justify-between gap-3">
              <dt className="text-white/50">Адрес</dt>
              <dd className="font-semibold">{location.origin}/admin</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/50">Email</dt>
              <dd className="font-semibold break-all">{email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/50">Пароль</dt>
              <dd className="font-mono font-semibold">{password}</dd>
            </div>
          </dl>
          {created.needsConfirmation && (
            <p className="rounded-xl bg-amber-400/10 px-3 py-2 text-amber-200">
              Сотруднику придёт письмо — перед первым входом нужно подтвердить email по ссылке.
            </p>
          )}
          <p className="text-xs text-white/45">Пароль можно сменить позже через «Забыли пароль?» на странице входа.</p>
        </div>
        <ModalActions>
          <Button variant="primary" onClick={onClose}>
            Готово
          </Button>
        </ModalActions>
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} title="Новый сотрудник" size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <ProfileFields
          value={profile}
          phoneDigits={phoneDigits}
          onChange={setProfile}
          onPhoneChange={setPhoneDigits}
          showErrors={showErrors}
        />
        <Field
          label="Email для входа *"
          error={showErrors && !/^\S+@\S+\.\S+$/.test(email.trim()) ? 'Укажите email' : null}
        >
          <Input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Временный пароль *" error={showErrors && password.length < 8 ? 'Минимум 8 символов' : null}>
          <span className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" autoComplete="off" />
            <Button size="sm" className="h-11" onClick={() => setPassword(generatePassword())}>
              Новый
            </Button>
          </span>
        </Field>
        <div className="sm:col-span-2">
          <ModalActions>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" icon={UserRoundPlus} loading={create.isPending}>
              Создать доступ
            </Button>
          </ModalActions>
        </div>
      </form>
    </Modal>
  )
}

function EditStaffModal({ member, onClose }: { member: Staff; onClose: () => void }) {
  const { staff: me } = useAuth()
  const save = useSaveStaff()
  const toast = useToast()
  const isSelf = me?.id === member.id
  const [profile, setProfile] = useState<StaffInput>({
    full_name: member.full_name,
    role: member.role,
    specialty: member.specialty,
    phone: member.phone,
    color: member.color,
    active: member.active,
  })
  const [phoneDigits, setPhoneDigits] = useState(toLocalDigits(member.phone ?? ''))
  const [showErrors, setShowErrors] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!profile.full_name.trim() || (phoneDigits !== '' && !isValidLocalDigits(phoneDigits))) {
      setShowErrors(true)
      return
    }
    try {
      await save.mutateAsync({
        id: member.id,
        input: { ...profile, full_name: profile.full_name.trim(), phone: phoneDigits ? toE164(phoneDigits) : null },
      })
      toast.success('Сотрудник сохранён')
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <Modal open onClose={onClose} title={member.full_name || member.email || 'Сотрудник'} size="lg">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {member.email && <p className="text-sm text-white/50 sm:col-span-2">Вход: {member.email}</p>}
        <ProfileFields
          value={profile}
          phoneDigits={phoneDigits}
          onChange={setProfile}
          onPhoneChange={setPhoneDigits}
          showErrors={showErrors}
          lockRole={isSelf}
        />
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={profile.active}
            disabled={isSelf}
            onChange={(e) => setProfile({ ...profile, active: e.target.checked })}
            className="size-5 accent-[#00E5FF]"
          />
          Доступ к CRM {isSelf && <span className="text-white/40">(свой доступ отключить нельзя)</span>}
        </label>
        <div className="sm:col-span-2">
          <ModalActions>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" icon={Save} loading={save.isPending}>
              Сохранить
            </Button>
          </ModalActions>
        </div>
      </form>
    </Modal>
  )
}

function ChairsSection() {
  const chairs = useChairs()
  const save = useSaveChair()
  const toast = useToast()
  const [name, setName] = useState('')

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action
      toast.success(message)
    } catch (error) {
      toast.error(error)
    }
  }

  const add = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    await run(save.mutateAsync({ input: { name: name.trim(), sort: (chairs.data?.length ?? 0) + 1, active: true } }), 'Кресло добавлено')
    setName('')
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <Armchair className="size-5 text-accent" />
        Кресла и кабинеты
      </h2>
      <div className={`${cardClass} overflow-hidden`}>
        {chairs.isPending ? (
          <LoadingBlock />
        ) : chairs.isError ? (
          <div className="p-4">
            <ErrorState error={chairs.error} onRetry={() => chairs.refetch()} />
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {chairs.data.map((chair) => (
              <ChairRow key={chair.id} chair={chair} onSave={(input, message) => run(save.mutateAsync({ id: chair.id, input }), message)} />
            ))}
          </ul>
        )}
        <form onSubmit={add} className="flex gap-2 border-t border-white/5 p-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Кресло 2" maxLength={60} />
          <Button type="submit" icon={Plus} disabled={!name.trim()} loading={save.isPending}>
            Добавить
          </Button>
        </form>
      </div>
    </section>
  )
}

function ChairRow({
  chair,
  onSave,
}: {
  chair: Chair
  onSave: (input: Pick<Chair, 'name' | 'sort' | 'active'>, message: string) => Promise<void>
}) {
  const [name, setName] = useState(chair.name)
  const changed = name.trim() !== chair.name && name.trim() !== ''

  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={chair.active ? '' : 'opacity-50'} />
      {changed && (
        <Button size="icon" variant="primary" aria-label="Сохранить" onClick={() => onSave({ name: name.trim(), sort: chair.sort, active: chair.active }, 'Кресло переименовано')}>
          <Save className="size-4" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-11"
        onClick={() =>
          onSave({ name: chair.name, sort: chair.sort, active: !chair.active }, chair.active ? 'Кресло скрыто' : 'Кресло снова доступно')
        }
      >
        {chair.active ? 'Скрыть' : 'Вернуть'}
      </Button>
    </li>
  )
}
