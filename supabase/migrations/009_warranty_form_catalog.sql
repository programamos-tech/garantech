-- Single round-trip catalog for the new warranty form

create or replace function public.get_warranty_form_catalog()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
begin
  v_store_id := public.get_user_store_id();
  if v_store_id is null then
    return jsonb_build_object('customers', '[]'::jsonb, 'products', '[]'::jsonb);
  end if;

  return jsonb_build_object(
    'customers',
    coalesce(
      (
        select jsonb_agg(to_jsonb(c) order by c.name)
        from (
          select
            id,
            store_id,
            name,
            phone,
            email,
            document_number,
            created_at
          from public.customers
          where store_id = v_store_id
        ) as c
      ),
      '[]'::jsonb
    ),
    'products',
    coalesce(
      (
        select jsonb_agg(to_jsonb(p) order by p.name)
        from (
          select
            id,
            store_id,
            name,
            category,
            warranty_months,
            created_at
          from public.products
          where store_id = v_store_id
        ) as p
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.get_warranty_form_catalog() from public;
grant execute on function public.get_warranty_form_catalog() to authenticated;
