-- PHOENIX CRM: schema, row level security and seed data.
-- Apply once in Supabase: SQL Editor → paste this file → Run.

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.staff_role as enum ('admin', 'doctor');
create type public.appointment_status as enum ('scheduled', 'confirmed', 'arrived', 'completed', 'no_show', 'cancelled');
create type public.lead_kind as enum ('booking', 'sos');
create type public.lead_status as enum ('new', 'contacted', 'booked', 'rejected');
create type public.payment_method as enum ('cash', 'card', 'transfer');
create type public.service_scope as enum ('tooth', 'visit');
create type public.tooth_condition as enum ('healthy', 'caries', 'filled', 'root_canal', 'crown', 'implant', 'missing', 'to_extract');
create type public.patient_source as enum ('site', 'walk_in', 'phone', 'referral', 'instagram', 'two_gis', 'other');
create type public.inventory_reason as enum ('purchase', 'usage', 'writeoff', 'correction');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  role public.staff_role not null default 'doctor',
  specialty text check (char_length(specialty) <= 120),
  phone text check (char_length(phone) <= 32),
  color text not null default '#00E5FF' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.chairs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text check (char_length(phone) <= 32),
  birth_date date,
  gender text check (gender in ('male', 'female')),
  source public.patient_source not null default 'walk_in',
  allergies text check (char_length(allergies) <= 1000),
  notes text check (char_length(notes) <= 4000),
  doctor_id uuid references public.staff (id) on delete set null,
  created_by uuid default auth.uid() references public.staff (id) on delete set null,
  created_at timestamptz not null default now()
);
create index patients_phone_idx on public.patients (phone);
create index patients_doctor_idx on public.patients (doctor_id);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  -- Stable key used by the public site calculator.
  code text unique check (code ~ '^[a-z_]{2,32}$'),
  name text not null check (char_length(name) between 1 and 120),
  category text not null default 'therapy'
    check (category in ('therapy', 'hygiene', 'surgery', 'orthopedics', 'implants', 'diagnostics', 'orthodontics', 'other')),
  scope public.service_scope not null default 'tooth',
  price numeric(12, 2) not null default 0 check (price >= 0),
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 480),
  color text not null default '#00E5FF' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  kind public.lead_kind not null default 'booking',
  status public.lead_status not null default 'new',
  name text check (char_length(name) <= 120),
  phone text check (char_length(phone) <= 32),
  summary text check (char_length(summary) <= 1000),
  estimate numeric(12, 2) check (estimate >= 0),
  preferred_at timestamptz,
  lang text check (lang in ('ru', 'ky', 'en')),
  patient_id uuid references public.patients (id) on delete set null,
  handled_by uuid references public.staff (id) on delete set null,
  note text check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  constraint leads_booking_contacts check (kind = 'sos' or (name is not null and phone is not null))
);
create index leads_status_idx on public.leads (status, created_at desc);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid not null references public.staff (id) on delete restrict,
  chair_id uuid references public.chairs (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  note text check (char_length(note) <= 2000),
  lead_id uuid references public.leads (id) on delete set null,
  created_by uuid default auth.uid() references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint appointments_time_order check (ends_at > starts_at),
  constraint appointments_doctor_overlap exclude using gist (
    doctor_id with =, tstzrange(starts_at, ends_at) with &&
  ) where (status not in ('cancelled', 'no_show')),
  constraint appointments_chair_overlap exclude using gist (
    chair_id with =, tstzrange(starts_at, ends_at) with &&
  ) where (chair_id is not null and status not in ('cancelled', 'no_show'))
);
create index appointments_starts_idx on public.appointments (starts_at);
create index appointments_patient_idx on public.appointments (patient_id);

create table public.treatments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  doctor_id uuid not null references public.staff (id) on delete restrict,
  service_id uuid references public.services (id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  tooth smallint check (tooth is null or (tooth / 10 between 1 and 4 and tooth % 10 between 1 and 8)),
  quantity integer not null default 1 check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) generated always as (price * quantity - discount) stored,
  note text check (char_length(note) <= 2000),
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint treatments_discount_limit check (discount <= price * quantity)
);
create index treatments_patient_idx on public.treatments (patient_id);
create index treatments_performed_idx on public.treatments (performed_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  method public.payment_method not null default 'cash',
  note text check (char_length(note) <= 500),
  paid_at timestamptz not null default now(),
  received_by uuid default auth.uid() references public.staff (id) on delete set null,
  created_at timestamptz not null default now()
);
create index payments_patient_idx on public.payments (patient_id);
create index payments_paid_idx on public.payments (paid_at);

create table public.tooth_records (
  patient_id uuid not null references public.patients (id) on delete cascade,
  tooth smallint not null check (tooth / 10 between 1 and 4 and tooth % 10 between 1 and 8),
  condition public.tooth_condition not null,
  note text check (char_length(note) <= 500),
  updated_by uuid default auth.uid() references public.staff (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (patient_id, tooth)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  category text check (char_length(category) <= 60),
  unit text not null default 'шт' check (char_length(unit) between 1 and 16),
  quantity numeric(12, 2) not null default 0 check (quantity >= 0),
  min_quantity numeric(12, 2) not null default 0 check (min_quantity >= 0),
  cost numeric(12, 2) check (cost >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items (id) on delete cascade,
  delta numeric(12, 2) not null check (delta <> 0),
  reason public.inventory_reason not null,
  note text check (char_length(note) <= 500),
  created_by uuid default auth.uid() references public.staff (id) on delete set null,
  created_at timestamptz not null default now()
);
create index inventory_movements_item_idx on public.inventory_movements (item_id, created_at desc);

create view public.patient_balances with (security_invoker = true) as
select
  p.id as patient_id,
  coalesce((select sum(t.total) from public.treatments t where t.patient_id = p.id), 0) as billed,
  coalesce((select sum(pm.amount) from public.payments pm where pm.patient_id = p.id), 0) as paid,
  coalesce((select sum(t.total) from public.treatments t where t.patient_id = p.id), 0)
    - coalesce((select sum(pm.amount) from public.payments pm where pm.patient_id = p.id), 0) as balance
from public.patients p;

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------

create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff where id = auth.uid() and active)
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff where id = auth.uid() and active and role = 'admin')
$$;

create function public.can_access_patient(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_admin() or (
    public.is_staff() and (
      exists (select 1 from public.patients where id = target and doctor_id = auth.uid())
      or exists (select 1 from public.appointments where patient_id = target and doctor_id = auth.uid())
    )
  )
$$;

-- Lets the login page offer "create the first administrator" on a fresh project.
create function public.has_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff)
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Every new auth user gets a staff profile. The very first one becomes an active admin,
-- everyone else stays inactive until an admin enables the account.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  first_user boolean := not exists (select 1 from public.staff);
begin
  insert into public.staff (id, full_name, role, active)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    case when first_user then 'admin'::public.staff_role else 'doctor'::public.staff_role end,
    first_user
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.ensure_active_admin() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.staff where role = 'admin' and active) then
    raise exception 'At least one active administrator is required' using errcode = 'P0001';
  end if;
  return null;
end;
$$;

create constraint trigger staff_keep_admin
  after update or delete on public.staff
  deferrable initially immediate
  for each row execute function public.ensure_active_admin();

create function public.apply_inventory_movement() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.inventory_items set quantity = quantity + new.delta where id = new.item_id;
  return new;
end;
$$;

create trigger inventory_movement_applied
  after insert on public.inventory_movements
  for each row execute function public.apply_inventory_movement();

create function public.touch_tooth_record() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger tooth_record_touched
  before update on public.tooth_records
  for each row execute function public.touch_tooth_record();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.staff enable row level security;
alter table public.chairs enable row level security;
alter table public.patients enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.treatments enable row level security;
alter table public.payments enable row level security;
alter table public.tooth_records enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;

create policy staff_select on public.staff for select to authenticated
  using (public.is_staff() or id = auth.uid());
create policy staff_update on public.staff for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy chairs_select on public.chairs for select to authenticated using (public.is_staff());
create policy chairs_admin on public.chairs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- The inline doctor_id check lets a doctor read back a patient they have just inserted:
-- can_access_patient() runs its own query and cannot see a row created by the same statement.
create policy patients_select on public.patients for select to authenticated
  using ((public.is_staff() and doctor_id = auth.uid()) or public.can_access_patient(id));
create policy patients_insert on public.patients for insert to authenticated
  with check (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()));
create policy patients_update on public.patients for update to authenticated
  using (public.can_access_patient(id)) with check (public.is_staff());
create policy patients_delete on public.patients for delete to authenticated using (public.is_admin());

create policy services_select on public.services for select to anon, authenticated
  using (active or public.is_staff());
create policy services_admin on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy leads_insert on public.leads for insert to anon, authenticated
  with check (status = 'new' and patient_id is null and handled_by is null and note is null);
create policy leads_select on public.leads for select to authenticated using (public.is_admin());
create policy leads_update on public.leads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy leads_delete on public.leads for delete to authenticated using (public.is_admin());

create policy appointments_select on public.appointments for select to authenticated
  using (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()));
create policy appointments_insert on public.appointments for insert to authenticated
  with check (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()));
create policy appointments_update on public.appointments for update to authenticated
  using (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()))
  with check (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()));
create policy appointments_delete on public.appointments for delete to authenticated using (public.is_admin());

create policy treatments_select on public.treatments for select to authenticated
  using (public.can_access_patient(patient_id));
create policy treatments_insert on public.treatments for insert to authenticated
  with check (public.is_admin() or (doctor_id = auth.uid() and public.can_access_patient(patient_id)));
create policy treatments_update on public.treatments for update to authenticated
  using (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()))
  with check (public.is_admin() or (public.is_staff() and doctor_id = auth.uid()));
create policy treatments_delete on public.treatments for delete to authenticated using (public.is_admin());

create policy payments_admin on public.payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy tooth_records_select on public.tooth_records for select to authenticated
  using (public.can_access_patient(patient_id));
create policy tooth_records_write on public.tooth_records for all to authenticated
  using (public.can_access_patient(patient_id)) with check (public.can_access_patient(patient_id));

create policy inventory_items_select on public.inventory_items for select to authenticated using (public.is_staff());
create policy inventory_items_admin on public.inventory_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy inventory_movements_select on public.inventory_movements for select to authenticated
  using (public.is_staff());
-- Movements are an audit log: no update or delete. Doctors may only record usage.
create policy inventory_movements_insert on public.inventory_movements for insert to authenticated
  with check (public.is_staff() and created_by = auth.uid() and (public.is_admin() or reason = 'usage'));

-- ---------------------------------------------------------------------------
-- Grants (Supabase grants everything by default; narrow the anonymous role)
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon;
grant select on public.services to anon;
grant insert on public.leads to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke execute on function public.handle_new_user(), public.ensure_active_admin(), public.apply_inventory_movement()
  from public, anon, authenticated;
grant execute on function public.has_staff() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime for live schedule and new site requests
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.appointments, public.leads;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Seed: services used by the site calculator and a default chair
-- ---------------------------------------------------------------------------

insert into public.services (code, name, category, scope, price, duration_minutes, color, sort) values
  ('therapy', 'Лечение кариеса', 'therapy', 'tooth', 1500, 45, '#FFB020', 10),
  ('pain', 'Неотложная помощь при острой боли', 'therapy', 'tooth', 2000, 60, '#FF3B5C', 20),
  ('hygiene', 'Профессиональная чистка', 'hygiene', 'visit', 2500, 60, '#00E5FF', 30),
  ('prosthetics', 'Коронка / протезирование', 'orthopedics', 'tooth', 6000, 60, '#A78BFA', 40),
  ('implant', 'Имплантация', 'implants', 'tooth', 35000, 90, '#34D399', 50),
  ('xray', 'Дентальный рентген', 'diagnostics', 'visit', 400, 10, '#60A5FA', 60);

insert into public.chairs (name, sort) values ('Кресло 1', 1);
