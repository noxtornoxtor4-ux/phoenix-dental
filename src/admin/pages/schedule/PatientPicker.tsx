import { Search, UserRoundPlus, X } from 'lucide-react'
import { useState } from 'react'
import { formatPhone } from '../../../lib/phone'
import { usePatientLookup } from '../../api/patients'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import type { Patient } from '../../types'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Field'
import { Spinner } from '../../ui/primitives'

interface PatientPickerProps {
  value: Pick<Patient, 'id' | 'full_name' | 'phone'> | null
  onChange: (patient: Patient | null) => void
  onCreate: (prefill: string) => void
  invalid?: boolean
}

export function PatientPicker({ value, onChange, onCreate, invalid = false }: PatientPickerProps) {
  const [search, setSearch] = useState('')
  const debounced = useDebouncedValue(search.trim())
  const lookup = usePatientLookup(debounced)

  if (value) {
    return (
      <div className="flex h-11 items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-3">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {value.full_name}
          {value.phone && <span className="ml-2 font-normal text-white/50">{formatPhone(value.phone)}</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Выбрать другого пациента"
          className="grid size-7 place-items-center rounded-lg text-white/60 hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  const results = lookup.data ?? []
  const showResults = debounced.length >= 2

  return (
    <div>
      <span className="relative block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Имя или телефон пациента"
          aria-invalid={invalid}
          className={`pl-9 ${invalid ? 'border-sos' : ''}`}
        />
      </span>
      {showResults && (
        <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-900/80">
          {lookup.isFetching && results.length === 0 ? (
            <div className="grid h-14 place-items-center">
              <Spinner className="size-5" />
            </div>
          ) : (
            <ul className="max-h-56 divide-y divide-white/5 overflow-y-auto">
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => onChange(patient)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-white/5"
                  >
                    <span className="truncate font-semibold">{patient.full_name}</span>
                    <span className="shrink-0 text-xs text-white/50 tabular-nums">{formatPhone(patient.phone)}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="px-3 py-3 text-sm text-white/50">Пациент не найден</li>}
            </ul>
          )}
        </div>
      )}
      <Button size="sm" variant="ghost" icon={UserRoundPlus} className="mt-2" onClick={() => onCreate(search.trim())}>
        Новый пациент
      </Button>
    </div>
  )
}
