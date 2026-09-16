import { ChevronRight, Search, UserRoundPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatPhone } from '../../../lib/phone'
import { usePatients } from '../../api/patients'
import { useStaffById } from '../../api/staff'
import { ageFrom, formatShortDate } from '../../lib/dates'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { patientSources } from '../../labels'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Field'
import { cardClass, EmptyState, ErrorState, LoadingBlock, PageHeader } from '../../ui/primitives'
import { PatientFormModal } from './PatientFormModal'

export function PatientsPage() {
  const navigate = useNavigate()
  const staffById = useStaffById()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim())
  const query = usePatients(debouncedSearch)

  const rows = query.data?.pages.flatMap((page) => page.rows) ?? []
  const total = query.data?.pages[0]?.count ?? 0

  return (
    <>
      <PageHeader
        title="Пациенты"
        subtitle={query.isSuccess ? `Найдено: ${total}` : undefined}
        actions={
          <Button variant="primary" icon={UserRoundPlus} onClick={() => setCreating(true)}>
            Новый пациент
          </Button>
        }
      />

      <label className="relative mb-4 block">
        <span className="sr-only">Поиск пациента</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Имя или номер телефона"
          className="pl-9"
        />
      </label>

      {query.isPending ? (
        <LoadingBlock />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title={debouncedSearch ? 'Никого не нашли' : 'Пациентов пока нет'}
          text={debouncedSearch ? 'Проверьте написание имени или номера.' : 'Добавьте первого пациента в базу.'}
          action={
            !debouncedSearch && (
              <Button variant="primary" icon={UserRoundPlus} onClick={() => setCreating(true)}>
                Новый пациент
              </Button>
            )
          }
        />
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-white/10 text-xs text-white/45">
              <tr>
                <th className="px-4 py-3 font-semibold">Пациент</th>
                <th className="px-4 py-3 font-semibold">Телефон</th>
                <th className="px-4 py-3 font-semibold">Лечащий врач</th>
                <th className="px-4 py-3 font-semibold">Источник</th>
                <th className="px-4 py-3 font-semibold">Добавлен</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="cursor-pointer border-b border-white/5 transition last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link to={`/patients/${patient.id}`} className="font-semibold hover:text-accent">
                      {patient.full_name}
                    </Link>
                    {patient.birth_date && (
                      <span className="ml-2 text-xs text-white/40">{ageFrom(patient.birth_date)} лет</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-white/70 tabular-nums">
                    {formatPhone(patient.phone) || '—'}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {patient.doctor_id ? (staffById.get(patient.doctor_id)?.full_name ?? '—') : '—'}
                  </td>
                  <td className="px-4 py-3 text-white/55">{patientSources[patient.source]}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-white/55">{formatShortDate(patient.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-white/5 md:hidden">
            {rows.map((patient) => (
              <li key={patient.id}>
                <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-white/5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{patient.full_name}</span>
                    <span className="block truncate text-xs text-white/50 tabular-nums">
                      {formatPhone(patient.phone) || 'Без телефона'}
                      {patient.doctor_id && staffById.get(patient.doctor_id)
                        ? ` · ${staffById.get(patient.doctor_id)?.full_name}`
                        : ''}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-white/30" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {query.hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
            Показать ещё
          </Button>
        </div>
      )}

      <PatientFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(patient) => navigate(`/patients/${patient.id}`)}
      />
    </>
  )
}
