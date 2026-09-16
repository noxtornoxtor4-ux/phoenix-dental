import { PGlite } from '@electric-sql/pglite'
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist'
import { beforeAll, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migration = readFileSync(join(import.meta.dir, '../migrations/0001_crm.sql'), 'utf8')

// Minimal stand-in for the pieces of Supabase the migration relies on.
const supabaseStub = `
  create schema auth;
  create schema extensions;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public, auth, extensions to anon, authenticated;
`

const ADMIN = '00000000-0000-4000-8000-000000000001'
const DOCTOR = '00000000-0000-4000-8000-000000000002'
const OTHER_DOCTOR = '00000000-0000-4000-8000-000000000003'

let db: PGlite

async function asSuperuser() {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`)
}

async function as(userId: string | null) {
  await asSuperuser()
  if (userId === null) {
    await db.exec('set role anon;')
  } else {
    await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId])
    await db.exec('set role authenticated;')
  }
}

async function rows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows
}

async function signUp(id: string, name: string) {
  await asSuperuser()
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [
    id,
    `${name}@phoenix.test`,
    { full_name: name },
  ])
}

beforeAll(async () => {
  db = await PGlite.create({ extensions: { btree_gist } })
  await db.exec(supabaseStub)
  await db.exec(migration)
}, 60_000)

describe('staff onboarding', () => {
  test('the first account becomes an active admin, next ones wait for approval', async () => {
    await as(null)
    expect((await rows<{ has_staff: boolean }>('select public.has_staff()'))[0].has_staff).toBe(false)

    await signUp(ADMIN, 'Admin')
    await signUp(DOCTOR, 'Doctor')
    await signUp(OTHER_DOCTOR, 'Other')

    await asSuperuser()
    const staff = await rows<{ id: string; role: string; active: boolean; full_name: string }>(
      'select id, role, active, full_name from public.staff order by id',
    )
    expect(staff).toEqual([
      { id: ADMIN, role: 'admin', active: true, full_name: 'Admin' },
      { id: DOCTOR, role: 'doctor', active: false, full_name: 'Doctor' },
      { id: OTHER_DOCTOR, role: 'doctor', active: false, full_name: 'Other' },
    ])
  })

  test('an inactive account has no access', async () => {
    await as(DOCTOR)
    expect(await rows('select * from public.patients')).toEqual([])
    await expect(
      db.query(`insert into public.patients (full_name, doctor_id) values ('X', $1)`, [DOCTOR]),
    ).rejects.toThrow(/row-level security/)
  })

  test('only an admin can activate staff and the last admin cannot be disabled', async () => {
    await as(DOCTOR)
    await db.query(`update public.staff set active = true where id = $1`, [DOCTOR])
    await asSuperuser()
    expect((await rows<{ active: boolean }>('select active from public.staff where id = $1', [DOCTOR]))[0].active).toBe(
      false,
    )

    await as(ADMIN)
    await db.query(`update public.staff set active = true where id in ($1, $2)`, [DOCTOR, OTHER_DOCTOR])
    await expect(db.query(`update public.staff set active = false where id = $1`, [ADMIN])).rejects.toThrow(
      /active administrator/,
    )
  })
})

describe('patients and medical data', () => {
  let ownPatient: string
  let foreignPatient: string

  test('doctors see only their own patients', async () => {
    await as(ADMIN)
    ownPatient = (
      await rows<{ id: string }>(`insert into public.patients (full_name, doctor_id) values ('Own', $1) returning id`, [
        DOCTOR,
      ])
    )[0].id
    foreignPatient = (
      await rows<{ id: string }>(`insert into public.patients (full_name, doctor_id) values ('Foreign', $1) returning id`, [
        OTHER_DOCTOR,
      ])
    )[0].id

    await as(DOCTOR)
    expect((await rows<{ full_name: string }>('select full_name from public.patients')).map((p) => p.full_name)).toEqual([
      'Own',
    ])
  })

  test('a doctor can create a patient only for themself', async () => {
    await as(DOCTOR)
    await expect(
      db.query(`insert into public.patients (full_name, doctor_id) values ('Stolen', $1)`, [OTHER_DOCTOR]),
    ).rejects.toThrow(/row-level security/)
    const created = await rows<{ created_by: string }>(
      `insert into public.patients (full_name, doctor_id) values ('Mine', $1) returning created_by`,
      [DOCTOR],
    )
    expect(created[0].created_by).toBe(DOCTOR)
  })

  test('treatments and tooth records follow patient access, payments are admin-only', async () => {
    await as(DOCTOR)
    await db.query(
      `insert into public.treatments (patient_id, doctor_id, title, tooth, price, quantity, discount) values ($1, $2, 'Filling', 36, 1500, 2, 500)`,
      [ownPatient, DOCTOR],
    )
    await expect(
      db.query(`insert into public.treatments (patient_id, doctor_id, title, price) values ($1, $2, 'X', 100)`, [
        foreignPatient,
        DOCTOR,
      ]),
    ).rejects.toThrow(/row-level security/)
    await db.query(`insert into public.tooth_records (patient_id, tooth, condition) values ($1, 36, 'filled')`, [
      ownPatient,
    ])
    await expect(
      db.query(`insert into public.tooth_records (patient_id, tooth, condition) values ($1, 11, 'caries')`, [
        foreignPatient,
      ]),
    ).rejects.toThrow(/row-level security/)
    await expect(
      db.query(`insert into public.payments (patient_id, amount) values ($1, 100)`, [ownPatient]),
    ).rejects.toThrow(/row-level security/)

    await as(ADMIN)
    await db.query(`insert into public.payments (patient_id, amount, method) values ($1, 1000, 'card')`, [ownPatient])
    const [balance] = await rows<{ billed: string; paid: string; balance: string }>(
      'select billed, paid, balance from public.patient_balances where patient_id = $1',
      [ownPatient],
    )
    expect(balance).toEqual({ billed: '2500.00', paid: '1000.00', balance: '1500.00' })

    await as(DOCTOR)
    expect(await rows('select * from public.payments')).toEqual([])
  })

  test('rejects invalid tooth numbers and oversized discounts', async () => {
    await as(ADMIN)
    await expect(
      db.query(`insert into public.tooth_records (patient_id, tooth, condition) values ($1, 19, 'caries')`, [ownPatient]),
    ).rejects.toThrow(/check constraint/)
    await expect(
      db.query(`insert into public.treatments (patient_id, doctor_id, title, price, discount) values ($1, $2, 'X', 100, 200)`, [
        ownPatient,
        DOCTOR,
      ]),
    ).rejects.toThrow(/treatments_discount_limit/)
  })

  test('appointments cannot overlap for the same doctor or chair', async () => {
    await as(ADMIN)
    const [chair] = await rows<{ id: string }>('select id from public.chairs limit 1')
    const book = (doctor: string, start: string, end: string, chairId: string | null = null) =>
      db.query(
        `insert into public.appointments (patient_id, doctor_id, chair_id, starts_at, ends_at) values ($1, $2, $3, $4, $5)`,
        [ownPatient, doctor, chairId, start, end],
      )

    await book(DOCTOR, '2026-09-21T10:00:00+06', '2026-09-21T11:00:00+06', chair.id)
    await expect(book(DOCTOR, '2026-09-21T10:30:00+06', '2026-09-21T11:30:00+06')).rejects.toThrow(
      /appointments_doctor_overlap/,
    )
    await expect(book(OTHER_DOCTOR, '2026-09-21T10:30:00+06', '2026-09-21T11:30:00+06', chair.id)).rejects.toThrow(
      /appointments_chair_overlap/,
    )
    await book(DOCTOR, '2026-09-21T11:00:00+06', '2026-09-21T12:00:00+06')

    await db.exec(`update public.appointments set status = 'cancelled' where starts_at = '2026-09-21T11:00:00+06'`)
    await book(DOCTOR, '2026-09-21T11:15:00+06', '2026-09-21T11:45:00+06')

    await as(OTHER_DOCTOR)
    expect(await rows('select * from public.appointments')).toEqual([])
  })
})

describe('public site access', () => {
  test('anonymous visitors can read active services and send requests only', async () => {
    await as(null)
    const services = await rows<{ code: string }>('select code from public.services order by sort')
    expect(services.map((s) => s.code)).toEqual(['therapy', 'pain', 'hygiene', 'prosthetics', 'implant', 'xray'])

    await db.query(`insert into public.leads (kind, name, phone, summary) values ('booking', 'Aigerim', '+996700123456', '№36')`)
    await db.query(`insert into public.leads (kind) values ('sos')`)
    await expect(db.query(`insert into public.leads (kind) values ('booking')`)).rejects.toThrow(/leads_booking_contacts/)
    await expect(
      db.query(`insert into public.leads (kind, status) values ('sos', 'booked')`),
    ).rejects.toThrow(/row-level security/)
    await expect(db.query('select * from public.leads')).rejects.toThrow(/permission denied/)
    await expect(db.query('select * from public.patients')).rejects.toThrow(/permission denied/)

    await as(DOCTOR)
    expect(await rows('select * from public.leads')).toEqual([])
    await as(ADMIN)
    expect(await rows('select * from public.leads')).toHaveLength(2)
  })
})

describe('inventory', () => {
  test('movements update stock; doctors can only record usage', async () => {
    await as(ADMIN)
    const [item] = await rows<{ id: string }>(
      `insert into public.inventory_items (name, unit, min_quantity) values ('Composite', 'шт', 2) returning id`,
    )
    await db.query(`insert into public.inventory_movements (item_id, delta, reason, created_by) values ($1, 10, 'purchase', $2)`, [
      item.id,
      ADMIN,
    ])

    await as(DOCTOR)
    await db.query(`insert into public.inventory_movements (item_id, delta, reason, created_by) values ($1, -3, 'usage', $2)`, [
      item.id,
      DOCTOR,
    ])
    await expect(
      db.query(`insert into public.inventory_movements (item_id, delta, reason, created_by) values ($1, 5, 'purchase', $2)`, [
        item.id,
        DOCTOR,
      ]),
    ).rejects.toThrow(/row-level security/)
    await expect(
      db.query(`insert into public.inventory_movements (item_id, delta, reason, created_by) values ($1, -50, 'usage', $2)`, [
        item.id,
        DOCTOR,
      ]),
    ).rejects.toThrow(/inventory_items_quantity_check/)
    await expect(db.query(`delete from public.inventory_movements`)).resolves.toBeDefined()

    await asSuperuser()
    expect((await rows<{ quantity: string }>('select quantity from public.inventory_items where id = $1', [item.id]))[0].quantity).toBe(
      '7.00',
    )
    expect(await rows('select * from public.inventory_movements')).toHaveLength(2)
  })
})
