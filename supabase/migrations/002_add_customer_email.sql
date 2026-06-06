alter table public.customers add column if not exists email text;

create index if not exists idx_customers_email on public.customers(email);
