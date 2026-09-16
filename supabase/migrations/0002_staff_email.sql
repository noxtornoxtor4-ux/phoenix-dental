-- Staff email for the CRM staff list (auth.users is not readable from the browser).

alter table public.staff add column email text check (char_length(email) <= 320);

update public.staff s set email = u.email from auth.users u where u.id = s.id;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  first_user boolean := not exists (select 1 from public.staff);
begin
  insert into public.staff (id, full_name, email, role, active)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    new.email,
    case when first_user then 'admin'::public.staff_role else 'doctor'::public.staff_role end,
    first_user
  );
  return new;
end;
$$;

create function public.sync_staff_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.staff set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_staff_email();

revoke execute on function public.sync_staff_email() from public, anon, authenticated;
