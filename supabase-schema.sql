create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null check (
    service_type in (
      'domain',
      'hosting',
      'website',
      'email',
      'trademark',
      'other'
    )
  ),
  service_name text not null,
  external_fee numeric(12,2) not null default 0,
  vionora_fee numeric(12,2) not null default 0
    check (vionora_fee >= 0 and vionora_fee <= 999),
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2)
    generated always as (
      external_fee + vionora_fee + tax_amount
    ) stored,
  payment_status text not null default 'pending',
  order_status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users can read own profile"
on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile"
on public.profiles;

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile"
on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read own orders"
on public.orders;

create policy "Users can read own orders"
on public.orders
for select
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data->>'phone',
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
