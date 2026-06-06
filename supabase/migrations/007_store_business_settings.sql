-- Configuración del negocio y documento de garantía

alter table public.stores
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists warranty_document_title text default 'Certificado de garantía',
  add column if not exists warranty_terms text,
  add column if not exists warranty_footer text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-logos',
  'store-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Public read store logos"
  on storage.objects for select
  using (bucket_id = 'store-logos');

create policy "Owners upload store logo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'store-logos'
    and (storage.foldername(name))[1] = public.get_user_store_id()::text
  );

create policy "Owners update store logo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'store-logos'
    and (storage.foldername(name))[1] = public.get_user_store_id()::text
  );

create policy "Owners delete store logo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'store-logos'
    and (storage.foldername(name))[1] = public.get_user_store_id()::text
  );
