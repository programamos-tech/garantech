-- Warranty claims (postventa / gestión de garantías)

create table public.warranty_claims (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  warranty_id uuid not null references public.warranties(id) on delete cascade,
  status text not null check (status in (
    'ingresado',
    'en_diagnostico',
    'aprobado',
    'no_aplica',
    'devolucion_aprobada',
    'listo_entrega'
  )) default 'ingresado',
  intake_notes text,
  diagnosis_notes text,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create index idx_warranty_claims_store_id on public.warranty_claims(store_id);
create index idx_warranty_claims_warranty_id on public.warranty_claims(warranty_id);
create index idx_warranty_claims_status on public.warranty_claims(status);

-- One open claim per warranty (terminal: no_aplica, listo_entrega)
create unique index idx_warranty_claims_one_open_per_warranty
  on public.warranty_claims (warranty_id)
  where status not in ('no_aplica', 'listo_entrega');

alter table public.warranty_claims enable row level security;

create policy "Users can view store warranty claims"
  on public.warranty_claims for select
  using (store_id = public.get_user_store_id());

create policy "Users can insert store warranty claims"
  on public.warranty_claims for insert
  with check (store_id = public.get_user_store_id());

create policy "Users can update store warranty claims"
  on public.warranty_claims for update
  using (store_id = public.get_user_store_id());

create policy "Users can delete store warranty claims"
  on public.warranty_claims for delete
  using (store_id = public.get_user_store_id());
