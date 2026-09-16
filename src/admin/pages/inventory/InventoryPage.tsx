import { FileClock, Minus, Package, PackagePlus, Pencil, Plus, Save, Search, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAddMovement, useInventoryItems, useItemMovements, useSaveInventoryItem } from '../../api/inventory'
import { useStaffById } from '../../api/staff'
import { useAuth } from '../../auth/useAuth'
import { formatDateTime, formatSom } from '../../lib/dates'
import { formatQuantity, isLowStock, movementDelta } from '../../lib/inventory'
import { inventoryReasons } from '../../labels'
import type { InventoryItem, InventoryReason } from '../../types'
import { Button } from '../../ui/Button'
import { Field, Input, Select, Textarea } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { Badge, cardClass, EmptyState, ErrorState, LoadingBlock, PageHeader, StatCard } from '../../ui/primitives'
import { useToast } from '../../ui/toastContext'

type Dialog =
  | { type: 'item'; item?: InventoryItem }
  | { type: 'movement'; item: InventoryItem; reason: InventoryReason }
  | { type: 'history'; item: InventoryItem }

export function InventoryPage() {
  const { isAdmin } = useAuth()
  const items = useInventoryItems()
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)

  const all = (items.data ?? []).filter((item) => item.active || isAdmin)
  const low = all.filter((item) => item.active && isLowStock(item))
  const query = search.trim().toLowerCase()
  const visible = all.filter(
    (item) =>
      (!lowOnly || isLowStock(item)) &&
      (!query || item.name.toLowerCase().includes(query) || item.category?.toLowerCase().includes(query)),
  )
  const stockValue = all.reduce((sum, item) => sum + (item.cost ?? 0) * item.quantity, 0)

  return (
    <>
      <PageHeader
        title="Склад"
        subtitle={isAdmin ? 'Материалы, приход, расход и инвентаризация' : 'Отмечайте расход материалов на приёме'}
        actions={
          isAdmin && (
            <Button variant="primary" icon={PackagePlus} onClick={() => setDialog({ type: 'item' })}>
              Новый материал
            </Button>
          )
        }
      />

      {items.isPending ? (
        <LoadingBlock />
      ) : items.isError ? (
        <ErrorState error={items.error} onRetry={() => items.refetch()} />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard icon={Package} label="Позиций" value={all.filter((item) => item.active).length} />
            <StatCard
              icon={TriangleAlert}
              label="Заканчивается"
              value={low.length}
              color={low.length > 0 ? '#FF3B5C' : '#34D399'}
            />
            {isAdmin && <StatCard icon={PackagePlus} label="Стоимость остатков" value={formatSom(stockValue)} color="#A78BFA" />}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <label className="relative min-w-60 flex-1">
              <span className="sr-only">Поиск материала</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Название или категория" className="pl-9" />
            </label>
            <Button variant={lowOnly ? 'primary' : 'secondary'} icon={TriangleAlert} onClick={() => setLowOnly(!lowOnly)}>
              Заканчивается
            </Button>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={Package}
              title={all.length === 0 ? 'Склад пуст' : 'Ничего не найдено'}
              text={all.length === 0 && isAdmin ? 'Добавьте материалы, чтобы вести учёт остатков.' : undefined}
            />
          ) : (
            <ul className={`${cardClass} divide-y divide-white/5 overflow-hidden`}>
              {visible.map((item) => {
                const lowStock = isLowStock(item)
                return (
                  <li key={item.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${item.active ? '' : 'opacity-50'}`}>
                    <div className="min-w-44 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-white/45">
                        {[item.category, `мин. ${formatQuantity(item.min_quantity)} ${item.unit}`, isAdmin && item.cost ? formatSom(item.cost) : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className={`font-display text-lg font-bold tabular-nums ${lowStock ? 'text-sos' : ''}`}>
                      {formatQuantity(item.quantity)} <span className="font-sans text-sm font-normal text-white/50">{item.unit}</span>
                    </span>
                    {lowStock && item.active && <Badge color="#FF3B5C">Заканчивается</Badge>}
                    <div className="flex gap-1">
                      <Button size="sm" icon={Minus} onClick={() => setDialog({ type: 'movement', item, reason: 'usage' })}>
                        Расход
                      </Button>
                      {isAdmin && (
                        <>
                          <Button size="sm" icon={Plus} onClick={() => setDialog({ type: 'movement', item, reason: 'purchase' })}>
                            Приход
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="Изменить" onClick={() => setDialog({ type: 'item', item })}>
                            <Pencil className="size-4" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" aria-label="История" onClick={() => setDialog({ type: 'history', item })}>
                        <FileClock className="size-4" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {dialog?.type === 'item' && <ItemFormModal item={dialog.item} onClose={() => setDialog(null)} />}
      {dialog?.type === 'movement' && (
        <MovementModal item={dialog.item} initialReason={dialog.reason} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === 'history' && <HistoryModal item={dialog.item} onClose={() => setDialog(null)} />}
    </>
  )
}

function ItemFormModal({ item, onClose }: { item?: InventoryItem; onClose: () => void }) {
  const { staff } = useAuth()
  const save = useSaveInventoryItem()
  const toast = useToast()
  const [name, setName] = useState(item?.name ?? '')
  const [category, setCategory] = useState(item?.category ?? '')
  const [unit, setUnit] = useState(item?.unit ?? 'шт')
  const [minQuantity, setMinQuantity] = useState(item ? String(item.min_quantity) : '0')
  const [cost, setCost] = useState(item?.cost != null ? String(item.cost) : '')
  const [initialQuantity, setInitialQuantity] = useState('0')
  const [active, setActive] = useState(item?.active ?? true)
  const [showErrors, setShowErrors] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !unit.trim() || Number(minQuantity) < 0) {
      setShowErrors(true)
      return
    }
    try {
      await save.mutateAsync({
        id: item?.id,
        input: {
          name: name.trim(),
          category: category.trim() || null,
          unit: unit.trim(),
          min_quantity: Number(minQuantity) || 0,
          cost: cost === '' ? null : Number(cost),
          active,
        },
        initialQuantity: Number(initialQuantity) || 0,
        staffId: staff?.id,
      })
      toast.success(item ? 'Материал сохранён' : 'Материал добавлен')
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <Modal open onClose={onClose} title={item ? 'Изменить материал' : 'Новый материал'}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Название *" error={showErrors && !name.trim() ? 'Укажите название' : null} className="sm:col-span-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={160} placeholder="Композит светового отверждения" />
        </Field>
        <Field label="Категория">
          <Input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={60} placeholder="Пломбировочные" />
        </Field>
        <Field label="Единица *" error={showErrors && !unit.trim() ? 'Укажите единицу' : null}>
          <Input value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={16} placeholder="шт, уп, мл" />
        </Field>
        <Field label="Минимальный остаток" hint="Ниже — отметка «Заканчивается»">
          <Input type="number" inputMode="decimal" min={0} step="any" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
        </Field>
        <Field label="Цена закупки за единицу, сом">
          <Input type="number" inputMode="decimal" min={0} step="any" value={cost} onChange={(e) => setCost(e.target.value)} />
        </Field>
        {!item && (
          <Field label="Начальный остаток">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={initialQuantity}
              onChange={(e) => setInitialQuantity(e.target.value)}
            />
          </Field>
        )}
        {item && (
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-[#00E5FF]" />
            Используется (скрытые материалы не видны врачам)
          </label>
        )}
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

function MovementModal({
  item,
  initialReason,
  onClose,
}: {
  item: InventoryItem
  initialReason: InventoryReason
  onClose: () => void
}) {
  const { staff, isAdmin } = useAuth()
  const add = useAddMovement()
  const toast = useToast()
  const [reason, setReason] = useState<InventoryReason>(initialReason)
  const [amount, setAmount] = useState(reason === 'correction' ? String(item.quantity) : '')
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const value = Number(amount)
  const delta = amount === '' ? 0 : movementDelta(reason, value, item.quantity)
  const after = item.quantity + delta
  const invalid = amount === '' || value < 0 || (reason !== 'correction' && value === 0) || delta === 0 || after < 0

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (invalid || !staff) {
      setShowErrors(true)
      return
    }
    try {
      await add.mutateAsync({ item_id: item.id, delta, reason, note: note.trim() || null, created_by: staff.id })
      toast.success(`${item.name}: ${formatQuantity(after)} ${item.unit}`)
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  const reasons = isAdmin ? (Object.keys(inventoryReasons) as InventoryReason[]) : (['usage'] as InventoryReason[])

  return (
    <Modal open onClose={onClose} title={item.name}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-white/55">
          Сейчас на складе: <b className="text-white">{formatQuantity(item.quantity)} {item.unit}</b>
        </p>
        {reasons.length > 1 && (
          <Field label="Операция">
            <Select
              value={reason}
              onChange={(e) => {
                const next = e.target.value as InventoryReason
                setReason(next)
                setAmount(next === 'correction' ? String(item.quantity) : '')
              }}
            >
              {reasons.map((value) => (
                <option key={value} value={value}>
                  {inventoryReasons[value]}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field
          label={reason === 'correction' ? `Фактический остаток, ${item.unit}` : `Количество, ${item.unit}`}
          error={
            showErrors && invalid
              ? after < 0
                ? 'Больше, чем есть на складе'
                : reason === 'correction'
                  ? 'Остаток не изменился'
                  : 'Укажите количество'
              : null
          }
        >
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold"
          />
        </Field>
        {amount !== '' && delta !== 0 && (
          <p className="text-sm text-white/60">
            Станет: <b className={after < 0 ? 'text-sos' : 'text-white'}>{formatQuantity(after)} {item.unit}</b>
            <span className={delta > 0 ? 'ml-2 text-emerald-400' : 'ml-2 text-amber-300'}>
              ({delta > 0 ? '+' : ''}
              {formatQuantity(delta)})
            </span>
          </p>
        )}
        <Field label="Комментарий">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            className="min-h-16"
            placeholder={reason === 'usage' ? 'Пациент, процедура' : 'Поставщик, накладная'}
          />
        </Field>
        <ModalActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="primary" icon={Save} loading={add.isPending}>
            Провести
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}

function HistoryModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const movements = useItemMovements(item.id)
  const staffById = useStaffById()

  return (
    <Modal open onClose={onClose} title={`История: ${item.name}`}>
      {movements.isPending ? (
        <LoadingBlock />
      ) : movements.isError ? (
        <ErrorState error={movements.error} onRetry={() => movements.refetch()} />
      ) : movements.data.length === 0 ? (
        <p className="text-sm text-white/50">Движений пока не было</p>
      ) : (
        <ul className="space-y-2">
          {movements.data.map((movement) => (
            <li key={movement.id} className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{inventoryReasons[movement.reason]}</p>
                <p className="text-xs text-white/45">
                  {formatDateTime(movement.created_at)}
                  {movement.created_by && ` · ${staffById.get(movement.created_by)?.full_name ?? ''}`}
                </p>
                {movement.note && <p className="mt-0.5 text-xs text-white/65">{movement.note}</p>}
              </div>
              <span className={`font-semibold tabular-nums ${movement.delta > 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                {movement.delta > 0 ? '+' : ''}
                {formatQuantity(movement.delta)} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
