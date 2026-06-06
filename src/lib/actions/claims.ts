"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStoreId } from "@/lib/store";
import {
  canTransitionClaimStatusForType,
  evaluateCoverage,
  isTerminalClaimStatus,
  shortClaimId,
} from "@/lib/claim";
import type {
  IdentifierSearchResult,
  ManageWarrantyItem,
  ManagementWarrantyItem,
  WarrantyClaimStatus,
  WarrantyClaimType,
  WarrantyClaimWithRelations,
  WarrantyManageContext,
  WarrantyWithRelations,
} from "@/lib/types";
import { withRecalculatedStatus } from "@/lib/warranty";
import { getWarrantyDetail } from "@/lib/actions/warranties";

function enrichWarranty(w: Record<string, unknown>): WarrantyWithRelations {
  return withRecalculatedStatus(w as unknown as WarrantyWithRelations);
}

function enrichClaim(row: Record<string, unknown>): WarrantyClaimWithRelations {
  const warranty = enrichWarranty(row.warranty as Record<string, unknown>);
  const { warranty: _w, ...claim } = row;
  return {
    ...(claim as unknown as WarrantyClaimWithRelations),
    warranty,
  };
}

async function getOpenClaimIdForWarrantyInternal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storeId: string,
  warrantyId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("warranty_claims")
    .select("id, status")
    .eq("store_id", storeId)
    .eq("warranty_id", warrantyId)
    .order("created_at", { ascending: false });

  if (!data?.length) return null;

  const open = data.find(
    (c) => !isTerminalClaimStatus(c.status as WarrantyClaimStatus)
  );
  return open?.id ?? null;
}

export async function getOpenClaimIdForWarranty(
  warrantyId: string
): Promise<string | null> {
  const storeId = await getStoreId();
  if (!storeId) return null;

  const supabase = await createClient();
  return getOpenClaimIdForWarrantyInternal(supabase, storeId, warrantyId);
}

export async function getManageContext(
  warrantyId: string
): Promise<WarrantyManageContext | null> {
  const detail = await getWarrantyDetail(warrantyId);
  if (!detail) return null;

  const storeId = await getStoreId();
  if (!storeId) return null;

  const supabase = await createClient();
  const warrantyIds = detail.saleItems.map((w) => w.id);

  const { data: claims } = await supabase
    .from("warranty_claims")
    .select("id, warranty_id, status")
    .eq("store_id", storeId)
    .in("warranty_id", warrantyIds);

  const openClaimByWarranty = new Map<string, string>();
  for (const claim of claims ?? []) {
    if (isTerminalClaimStatus(claim.status as WarrantyClaimStatus)) continue;
    if (!openClaimByWarranty.has(claim.warranty_id)) {
      openClaimByWarranty.set(claim.warranty_id, claim.id);
    }
  }

  const items: ManageWarrantyItem[] = detail.saleItems.map((warranty) => {
    const coverage = evaluateCoverage(warranty);
    return {
      warranty,
      coverage,
      openClaimId:
        coverage === "cubierta"
          ? openClaimByWarranty.get(warranty.id) ?? null
          : null,
    };
  });

  return {
    defaultWarrantyId: warrantyId,
    customerName: detail.warranty.customer.name,
    saleDate: detail.warranty.sale_date,
    sale: detail.sale,
    items,
  };
}

export async function searchByIdentifier(
  identifier: string
): Promise<IdentifierSearchResult> {
  const storeId = await getStoreId();
  if (!storeId || !identifier.trim()) {
    return { coverage: "sin_registro", warranty: null, openClaimId: null };
  }

  const supabase = await createClient();
  const trimmed = identifier.trim();

  const { data } = await supabase
    .from("warranties")
    .select("*, customer:customers(*), product:products(*)")
    .eq("store_id", storeId)
    .eq("identifier", trimmed)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return { coverage: "sin_registro", warranty: null, openClaimId: null };
  }

  const warranty = enrichWarranty(data);
  const coverage = evaluateCoverage(warranty);
  const openClaimId =
    coverage === "cubierta"
      ? await getOpenClaimIdForWarrantyInternal(supabase, storeId, warranty.id)
      : null;

  return { coverage, warranty, openClaimId };
}

export async function searchByDocument(
  document: string
): Promise<ManagementWarrantyItem[]> {
  const storeId = await getStoreId();
  if (!storeId || !document.trim()) return [];

  const supabase = await createClient();
  const trimmed = document.trim();

  const { data: customers } = await supabase
    .from("customers")
    .select("id")
    .eq("store_id", storeId)
    .eq("document_number", trimmed);

  if (!customers?.length) return [];

  const customerIds = customers.map((c) => c.id);

  const { data: warranties } = await supabase
    .from("warranties")
    .select("*, customer:customers(*), product:products(*)")
    .eq("store_id", storeId)
    .in("customer_id", customerIds)
    .order("created_at", { ascending: false });

  if (!warranties?.length) return [];

  const enriched = warranties.map(enrichWarranty);
  const warrantyIds = enriched.map((w) => w.id);

  const { data: claims } = await supabase
    .from("warranty_claims")
    .select("id, warranty_id, status")
    .eq("store_id", storeId)
    .in("warranty_id", warrantyIds);

  const openClaimByWarranty = new Map<string, string>();
  for (const claim of claims ?? []) {
    if (isTerminalClaimStatus(claim.status as WarrantyClaimStatus)) continue;
    if (!openClaimByWarranty.has(claim.warranty_id)) {
      openClaimByWarranty.set(claim.warranty_id, claim.id);
    }
  }

  return enriched.map((warranty) => {
    const coverage = evaluateCoverage(warranty);
    return {
      warranty,
      coverage,
      openClaimId:
        coverage === "cubierta"
          ? openClaimByWarranty.get(warranty.id) ?? null
          : null,
    };
  });
}

export async function openOrResumeClaim(
  warrantyId: string,
  intakeNotes: string,
  claimType: WarrantyClaimType
) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const trimmedNotes = intakeNotes.trim();
  if (!trimmedNotes) return { error: "Indica el motivo de ingreso del equipo" };

  const supabase = await createClient();

  const { data: warrantyRow } = await supabase
    .from("warranties")
    .select("*, customer:customers(*), product:products(*)")
    .eq("id", warrantyId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!warrantyRow) return { error: "Garantía no encontrada" };

  const warranty = enrichWarranty(warrantyRow);
  if (evaluateCoverage(warranty) !== "cubierta") {
    return { error: "Esta garantía no tiene cobertura vigente" };
  }

  const existingId = await getOpenClaimIdForWarrantyInternal(
    supabase,
    storeId,
    warrantyId
  );
  if (existingId) {
    return { success: true, claimId: existingId, resumed: true };
  }

  const { data: created, error } = await supabase
    .from("warranty_claims")
    .insert({
      store_id: storeId,
      warranty_id: warrantyId,
      status: "ingresado",
      claim_type: claimType,
      intake_notes: trimmedNotes,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/gestion");
  revalidatePath(`/gestion/reclamos/${created.id}`);
  revalidatePath(`/garantias/${warrantyId}`);
  revalidatePath(`/garantias/${warrantyId}/gestionar`);
  return { success: true, claimId: created.id, resumed: false };
}

export async function updateClaimStatus(
  claimId: string,
  newStatus: WarrantyClaimStatus,
  notes?: { diagnosisNotes?: string; resolutionNotes?: string }
) {
  const storeId = await getStoreId();
  if (!storeId) return { error: "No autorizado" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("warranty_claims")
    .select("*")
    .eq("id", claimId)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!existing) return { error: "Reclamo no encontrado" };

  const currentStatus = existing.status as WarrantyClaimStatus;
  const claimType = (existing.claim_type as WarrantyClaimType | null) ?? null;
  if (!canTransitionClaimStatusForType(currentStatus, newStatus, claimType)) {
    return { error: "Transición de estado no permitida" };
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: newStatus,
    updated_at: now,
  };

  if (notes?.diagnosisNotes !== undefined) {
    update.diagnosis_notes = notes.diagnosisNotes.trim() || null;
  }

  if (notes?.resolutionNotes !== undefined) {
    update.resolution_notes = notes.resolutionNotes.trim() || null;
  }

  if (isTerminalClaimStatus(newStatus)) {
    update.closed_at = now;
  }

  const { error } = await supabase
    .from("warranty_claims")
    .update(update)
    .eq("id", claimId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  revalidatePath("/gestion");
  revalidatePath(`/gestion/reclamos/${claimId}`);
  revalidatePath(`/garantias/${existing.warranty_id}`);
  return { success: true };
}

export async function getClaimById(
  id: string
): Promise<WarrantyClaimWithRelations | null> {
  const storeId = await getStoreId();
  if (!storeId) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("warranty_claims")
    .select("*, warranty:warranties(*, customer:customers(*), product:products(*))")
    .eq("id", id)
    .eq("store_id", storeId)
    .maybeSingle();

  if (!data) return null;
  return enrichClaim(data as Record<string, unknown>);
}

export async function listClaims(): Promise<WarrantyClaimWithRelations[]> {
  const storeId = await getStoreId();
  if (!storeId) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("warranty_claims")
    .select("*, warranty:warranties(*, customer:customers(*), product:products(*))")
    .eq("store_id", storeId)
    .order("updated_at", { ascending: false });

  if (!data) return [];
  return data.map((row) => enrichClaim(row as Record<string, unknown>));
}

export async function searchClaims(
  query: string
): Promise<WarrantyClaimWithRelations[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const claims = await listClaims();

  return claims.filter(
    (claim) =>
      shortClaimId(claim.id).toLowerCase().includes(q) ||
      claim.warranty.customer.name.toLowerCase().includes(q) ||
      claim.warranty.product.name.toLowerCase().includes(q) ||
      claim.warranty.identifier.toLowerCase().includes(q)
  );
}

export async function listOpenClaims(): Promise<WarrantyClaimWithRelations[]> {
  const claims = await listClaims();
  return claims.filter((claim) => !isTerminalClaimStatus(claim.status));
}
