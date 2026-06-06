-- Claim type at intake (requested resolution path)

alter table public.warranty_claims
  add column claim_type text check (claim_type in ('reparacion', 'devolucion', 'cambio'));
