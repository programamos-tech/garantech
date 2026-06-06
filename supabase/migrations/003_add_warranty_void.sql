alter table public.warranties
  drop constraint if exists warranties_status_check;

alter table public.warranties
  add constraint warranties_status_check
  check (status in ('vigente', 'por_vencer', 'vencida', 'anulada'));

alter table public.warranties
  add column void_reason text,
  add column voided_at timestamptz;
