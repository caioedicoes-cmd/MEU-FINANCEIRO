create extension if not exists "pgcrypto";

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  company text,
  phone_whatsapp text,
  email text,
  contract_value numeric(12,2) not null default 0,
  due_date integer check (due_date between 1 and 31),
  payment_method text,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'LATE')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  kind text not null default 'BOTH' check (kind in ('INCOME', 'EXPENSE', 'BOTH')),
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.contas_bancarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  bank text,
  account_type text,
  initial_balance numeric(12,2) not null default 0,
  current_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.contas_fixas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category_id uuid references public.categorias(id) on delete set null,
  bank_account_id uuid references public.contas_bancarias(id) on delete set null,
  name text not null,
  amount numeric(12,2) not null default 0,
  recurrence text not null default 'MONTHLY' check (recurrence = 'MONTHLY'),
  due_day integer not null check (due_day between 1 and 31),
  paid_at date,
  status text not null default 'PENDING' check (status in ('PENDING', 'PAID', 'LATE')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.cartoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  bank_account_id uuid references public.contas_bancarias(id) on delete set null,
  name text not null,
  brand text,
  limit_amount numeric(12,2) not null default 0,
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz not null default now()
);

create table if not exists public.faturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid not null references public.cartoes(id) on delete cascade,
  reference_month date not null,
  closing_date date not null,
  due_date date not null,
  amount numeric(12,2) not null default 0,
  paid_at date,
  status text not null default 'OPEN' check (status in ('OPEN', 'CLOSED', 'PAID', 'LATE')),
  created_at timestamptz not null default now(),
  unique (card_id, reference_month)
);

create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null default 0,
  current_amount numeric(12,2) not null default 0,
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.transactions add column if not exists client_id uuid references public.clientes(id) on delete set null;

alter table public.clientes enable row level security;
alter table public.categorias enable row level security;
alter table public.contas_bancarias enable row level security;
alter table public.contas_fixas enable row level security;
alter table public.cartoes enable row level security;
alter table public.faturas enable row level security;
alter table public.metas enable row level security;

create policy "clientes_select_own" on public.clientes for select using (auth.uid() = user_id);
create policy "clientes_insert_own" on public.clientes for insert with check (auth.uid() = user_id);
create policy "clientes_update_own" on public.clientes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "clientes_delete_own" on public.clientes for delete using (auth.uid() = user_id);

create policy "categorias_select_own" on public.categorias for select using (auth.uid() = user_id);
create policy "categorias_insert_own" on public.categorias for insert with check (auth.uid() = user_id);
create policy "categorias_update_own" on public.categorias for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categorias_delete_own" on public.categorias for delete using (auth.uid() = user_id);

create policy "contas_bancarias_select_own" on public.contas_bancarias for select using (auth.uid() = user_id);
create policy "contas_bancarias_insert_own" on public.contas_bancarias for insert with check (auth.uid() = user_id);
create policy "contas_bancarias_update_own" on public.contas_bancarias for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contas_bancarias_delete_own" on public.contas_bancarias for delete using (auth.uid() = user_id);

create policy "contas_fixas_select_own" on public.contas_fixas for select using (auth.uid() = user_id);
create policy "contas_fixas_insert_own" on public.contas_fixas for insert with check (auth.uid() = user_id);
create policy "contas_fixas_update_own" on public.contas_fixas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contas_fixas_delete_own" on public.contas_fixas for delete using (auth.uid() = user_id);

create policy "cartoes_select_own" on public.cartoes for select using (auth.uid() = user_id);
create policy "cartoes_insert_own" on public.cartoes for insert with check (auth.uid() = user_id);
create policy "cartoes_update_own" on public.cartoes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cartoes_delete_own" on public.cartoes for delete using (auth.uid() = user_id);

create policy "faturas_select_own" on public.faturas for select using (auth.uid() = user_id);
create policy "faturas_insert_own" on public.faturas for insert with check (auth.uid() = user_id);
create policy "faturas_update_own" on public.faturas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "faturas_delete_own" on public.faturas for delete using (auth.uid() = user_id);

create policy "metas_select_own" on public.metas for select using (auth.uid() = user_id);
create policy "metas_insert_own" on public.metas for insert with check (auth.uid() = user_id);
create policy "metas_update_own" on public.metas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "metas_delete_own" on public.metas for delete using (auth.uid() = user_id);
