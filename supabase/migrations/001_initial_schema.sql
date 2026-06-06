-- GaranTech initial schema

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  nit text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  phone text,
  document_number text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  category text not null check (category in (
    'telefonia', 'computadores', 'pantallas', 'accesorios', 'electrodomesticos', 'videojuegos'
  )),
  warranty_months integer not null check (warranty_months > 0),
  created_at timestamptz not null default now()
);

create table public.warranties (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  sale_date date not null,
  warranty_end_date date not null,
  identifier text not null,
  identifier_type text not null check (identifier_type in ('imei', 'referencia')),
  status text not null check (status in ('vigente', 'por_vencer', 'vencida')),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_customers_store_id on public.customers(store_id);
create index idx_customers_name on public.customers(name);
create index idx_customers_document on public.customers(document_number);
create index idx_products_store_id on public.products(store_id);
create index idx_warranties_store_id on public.warranties(store_id);
create index idx_warranties_customer_id on public.warranties(customer_id);
create index idx_warranties_identifier on public.warranties(identifier);
create index idx_warranties_status on public.warranties(status);
create index idx_stores_owner_id on public.stores(owner_id);

alter table public.stores enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.warranties enable row level security;

create or replace function public.get_user_store_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.stores where owner_id = auth.uid() limit 1;
$$;

-- Stores policies
create policy "Users can view own store"
  on public.stores for select
  using (owner_id = auth.uid());

create policy "Users can insert own store"
  on public.stores for insert
  with check (owner_id = auth.uid());

create policy "Users can update own store data"
  on public.stores for update
  using (owner_id = auth.uid());

-- Customers policies
create policy "Users can view store customers"
  on public.customers for select
  using (store_id = public.get_user_store_id());

create policy "Users can insert store customers"
  on public.customers for insert
  with check (store_id = public.get_user_store_id());

create policy "Users can update store customers"
  on public.customers for update
  using (store_id = public.get_user_store_id());

create policy "Users can delete store customers"
  on public.customers for delete
  using (store_id = public.get_user_store_id());

-- Products policies
create policy "Users can view store products"
  on public.products for select
  using (store_id = public.get_user_store_id());

create policy "Users can insert store products"
  on public.products for insert
  with check (store_id = public.get_user_store_id());

create policy "Users can update store products"
  on public.products for update
  using (store_id = public.get_user_store_id());

create policy "Users can delete store products"
  on public.products for delete
  using (store_id = public.get_user_store_id());

-- Warranties policies
create policy "Users can view store warranties"
  on public.warranties for select
  using (store_id = public.get_user_store_id());

create policy "Users can insert store warranties"
  on public.warranties for insert
  with check (store_id = public.get_user_store_id());

create policy "Users can update store warranties"
  on public.warranties for update
  using (store_id = public.get_user_store_id());

create policy "Users can delete store warranties"
  on public.warranties for delete
  using (store_id = public.get_user_store_id());
