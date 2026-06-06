-- Sales: one purchase can include multiple warranty line items

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  sale_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_sales_store_id on public.sales(store_id);
create index idx_sales_customer_id on public.sales(customer_id);
create index idx_sales_sale_date on public.sales(sale_date);

alter table public.warranties
  add column sale_id uuid references public.sales(id) on delete set null;

create index idx_warranties_sale_id on public.warranties(sale_id);

alter table public.sales enable row level security;

create policy "Users can view store sales"
  on public.sales for select
  using (store_id = public.get_user_store_id());

create policy "Users can insert store sales"
  on public.sales for insert
  with check (store_id = public.get_user_store_id());

create policy "Users can update store sales"
  on public.sales for update
  using (store_id = public.get_user_store_id());

create policy "Users can delete store sales"
  on public.sales for delete
  using (store_id = public.get_user_store_id());
