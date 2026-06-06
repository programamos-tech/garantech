-- Atomic sale + warranty creation with store-scoped validation

create unique index if not exists idx_warranties_store_identifier_active
  on public.warranties (store_id, lower(identifier))
  where voided_at is null;

create or replace function public.create_sale_with_warranties(
  p_customer_id uuid,
  p_sale_date date,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_sale_id uuid;
  v_warranty_ids uuid[];
  v_item jsonb;
  v_product record;
  v_identifier text;
  v_identifiers text[] := '{}';
begin
  v_store_id := public.get_user_store_id();
  if v_store_id is null then
    raise exception 'No autorizado';
  end if;

  if p_customer_id is null then
    raise exception 'Selecciona un cliente';
  end if;

  if p_sale_date is null then
    raise exception 'Indica la fecha de venta';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Agrega al menos un producto';
  end if;

  if not exists (
    select 1
    from public.customers c
    where c.id = p_customer_id
      and c.store_id = v_store_id
  ) then
    raise exception 'Cliente no encontrado';
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_items) as value
  loop
    if coalesce(v_item->>'product_id', '') = '' then
      raise exception 'Producto no encontrado';
    end if;

    v_identifier := trim(coalesce(v_item->>'identifier', ''));
    if v_identifier = '' then
      raise exception 'Identificador obligatorio';
    end if;

    if v_identifier = any(v_identifiers) then
      raise exception 'El identificador % está repetido en esta venta', v_identifier;
    end if;

    v_identifiers := array_append(v_identifiers, v_identifier);

    select p.id, p.name, p.category, p.warranty_months
    into v_product
    from public.products p
    where p.id = (v_item->>'product_id')::uuid
      and p.store_id = v_store_id;

    if not found then
      raise exception 'Producto no encontrado';
    end if;

    if v_product.category = 'telefonia' and v_identifier !~ '^\d{15}$' then
      raise exception '%: El IMEI debe tener exactamente 15 dígitos numéricos', v_product.name;
    end if;

    if exists (
      select 1
      from public.warranties w
      where w.store_id = v_store_id
        and lower(w.identifier) = lower(v_identifier)
        and w.voided_at is null
    ) then
      raise exception 'Ya existe una garantía activa con el identificador %', v_identifier;
    end if;
  end loop;

  insert into public.sales (store_id, customer_id, sale_date, notes)
  values (
    v_store_id,
    p_customer_id,
    p_sale_date,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_sale_id;

  with inserted as (
    insert into public.warranties (
      store_id,
      customer_id,
      product_id,
      sale_id,
      sale_date,
      warranty_end_date,
      identifier,
      identifier_type,
      status,
      notes
    )
    select
      v_store_id,
      p_customer_id,
      p.id,
      v_sale_id,
      p_sale_date,
      (p_sale_date + make_interval(months => p.warranty_months))::date,
      trim(elem->>'identifier'),
      case
        when p.category = 'telefonia' then 'imei'
        else 'referencia'
      end,
      case
        when current_date > (p_sale_date + make_interval(months => p.warranty_months))::date then 'vencida'
        when current_date >= (p_sale_date + make_interval(months => p.warranty_months))::date - 30 then 'por_vencer'
        else 'vigente'
      end,
      null
    from jsonb_array_elements(p_items) as elem
    inner join public.products p
      on p.id = (elem->>'product_id')::uuid
      and p.store_id = v_store_id
    returning id
  )
  select coalesce(array_agg(id), '{}')
  into v_warranty_ids
  from inserted;

  if coalesce(array_length(v_warranty_ids, 1), 0) <> jsonb_array_length(p_items) then
    raise exception 'No se pudieron registrar las garantías';
  end if;

  return jsonb_build_object(
    'sale_id', v_sale_id,
    'warranty_ids', to_jsonb(v_warranty_ids)
  );
end;
$$;

revoke all on function public.create_sale_with_warranties(uuid, date, text, jsonb) from public;
grant execute on function public.create_sale_with_warranties(uuid, date, text, jsonb) to authenticated;
