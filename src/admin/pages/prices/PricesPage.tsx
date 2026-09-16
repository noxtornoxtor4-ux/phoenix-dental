import { Globe, Pencil, Plus, Save, Tags, Trash } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDeleteService, useSaveService, useServices, type ServiceInput } from '../../api/services'
import { formatSom } from '../../lib/dates'
import { serviceCategories, serviceScopes } from '../../labels'
import type { Service, ServiceCategory, ServiceScope } from '../../types'
import { Button } from '../../ui/Button'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import { Field, Input, Select } from '../../ui/Field'
import { Modal, ModalActions } from '../../ui/Modal'
import { cardClass, EmptyState, ErrorState, LoadingBlock, PageHeader } from '../../ui/primitives'
import { useToast } from '../../ui/toastContext'

export function PricesPage() {
  const services = useServices()
  const remove = useDeleteService()
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)

  const categories = Object.keys(serviceCategories) as ServiceCategory[]

  return (
    <>
      <PageHeader
        title="Прайс-лист"
        subtitle="Цены используются в лечении, а услуги с отметкой «Сайт» — в калькуляторе на сайте"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>
            Новая услуга
          </Button>
        }
      />

      {services.isPending ? (
        <LoadingBlock />
      ) : services.isError ? (
        <ErrorState error={services.error} onRetry={() => services.refetch()} />
      ) : services.data.length === 0 ? (
        <EmptyState icon={Tags} title="Прайс-лист пуст" />
      ) : (
        <div className="space-y-4">
          {categories
            .map((category) => ({ category, items: services.data.filter((item) => item.category === category) }))
            .filter(({ items }) => items.length > 0)
            .map(({ category, items }) => (
              <section key={category} className={`${cardClass} overflow-hidden`}>
                <h2 className="border-b border-white/5 px-4 py-3 text-sm font-semibold text-white/70">
                  {serviceCategories[category]}
                </h2>
                <ul className="divide-y divide-white/5">
                  {items.map((service) => (
                    <li key={service.id} className={`flex items-center gap-3 px-4 py-3 ${service.active ? '' : 'opacity-50'}`}>
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: service.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          {service.name}
                          {service.code && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">
                              <Globe className="size-3" />
                              Сайт
                            </span>
                          )}
                          {!service.active && <span className="text-xs font-normal text-white/50">скрыта</span>}
                        </p>
                        <p className="text-xs text-white/45">
                          {service.duration_minutes} мин · {serviceScopes[service.scope]}
                        </p>
                      </div>
                      <span className="font-semibold whitespace-nowrap tabular-nums">{formatSom(service.price)}</span>
                      <Button size="icon" variant="ghost" aria-label="Изменить" onClick={() => setEditing(service)}>
                        <Pencil className="size-4" />
                      </Button>
                      {!service.code && (
                        <Button size="icon" variant="ghost" aria-label="Удалить" onClick={() => setDeleting(service)}>
                          <Trash className="size-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      {editing !== null && (
        <ServiceFormModal service={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
      <ConfirmDialog
        open={deleting !== null}
        title="Удалить услугу?"
        confirmLabel="Удалить"
        onClose={() => setDeleting(null)}
        onConfirm={() => remove.mutateAsync(deleting!.id)}
      >
        «{deleting?.name}» исчезнет из прайса. Уже проведённое лечение сохранится с прежней ценой.
      </ConfirmDialog>
    </>
  )
}

function ServiceFormModal({ service, onClose }: { service?: Service; onClose: () => void }) {
  const save = useSaveService()
  const toast = useToast()
  const [name, setName] = useState(service?.name ?? '')
  const [category, setCategory] = useState<ServiceCategory>(service?.category ?? 'therapy')
  const [scope, setScope] = useState<ServiceScope>(service?.scope ?? 'tooth')
  const [price, setPrice] = useState(service ? String(service.price) : '')
  const [duration, setDuration] = useState(service ? String(service.duration_minutes) : '30')
  const [color, setColor] = useState(service?.color ?? '#00E5FF')
  const [sort, setSort] = useState(service ? String(service.sort) : '100')
  const [active, setActive] = useState(service?.active ?? true)
  const [showErrors, setShowErrors] = useState(false)

  const errors = {
    name: name.trim() ? null : 'Укажите название',
    price: price !== '' && Number(price) >= 0 ? null : 'Укажите цену',
    duration: Number(duration) >= 5 && Number(duration) <= 480 ? null : 'От 5 до 480 минут',
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true)
      return
    }
    const input: ServiceInput = {
      name: name.trim(),
      category,
      scope,
      price: Number(price),
      duration_minutes: Math.round(Number(duration)),
      color,
      sort: Math.round(Number(sort) || 0),
      active,
    }
    try {
      await save.mutateAsync({ id: service?.id, input })
      toast.success('Прайс-лист обновлён')
      onClose()
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <Modal open onClose={onClose} title={service ? 'Изменить услугу' : 'Новая услуга'}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {service?.code && (
          <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent sm:col-span-2">
            Услуга используется в калькуляторе на сайте: новая цена и длительность появятся там автоматически.
          </p>
        )}
        <Field label="Название *" error={showErrors ? errors.name : null} className="sm:col-span-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </Field>
        <Field label="Категория">
          <Select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)}>
            {Object.entries(serviceCategories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Как считается цена">
          <Select value={scope} onChange={(e) => setScope(e.target.value as ServiceScope)}>
            {Object.entries(serviceScopes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Цена от, сом *" error={showErrors ? errors.price : null}>
          <Input type="number" inputMode="decimal" min={0} step="any" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Длительность, мин" error={showErrors ? errors.duration : null}>
          <Input type="number" inputMode="numeric" min={5} max={480} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Field>
        <Field label="Цвет">
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} className="p-1" />
        </Field>
        <Field label="Порядок в списке">
          <Input type="number" inputMode="numeric" value={sort} onChange={(e) => setSort(e.target.value)} />
        </Field>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-[#00E5FF]" />
          Показывать в прайсе{service?.code ? ' и на сайте' : ''}
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
