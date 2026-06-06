export type ProductCategory =
  | "telefonia"
  | "computadores"
  | "pantallas"
  | "accesorios"
  | "electrodomesticos"
  | "videojuegos";

export type IdentifierType = "imei" | "referencia";

export type WarrantyStatus = "vigente" | "por_vencer" | "vencida" | "anulada";

export type WarrantyClaimStatus =
  | "ingresado"
  | "en_diagnostico"
  | "aprobado"
  | "no_aplica"
  | "devolucion_aprobada"
  | "listo_entrega";

export type CoverageResult = "sin_registro" | "sin_cobertura" | "cubierta";

export type WarrantyClaimType = "reparacion" | "devolucion" | "cambio";

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  nit: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  warranty_document_title: string | null;
  warranty_terms: string | null;
  warranty_footer: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  document_number: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  category: ProductCategory;
  warranty_months: number;
  created_at: string;
}

export interface ProductWithStats extends Product {
  warranty_count: number;
}

export interface Sale {
  id: string;
  store_id: string;
  customer_id: string;
  sale_date: string;
  notes: string | null;
  created_at: string;
}

export interface Warranty {
  id: string;
  store_id: string;
  sale_id: string | null;
  customer_id: string;
  product_id: string;
  sale_date: string;
  warranty_end_date: string;
  identifier: string;
  identifier_type: IdentifierType;
  status: WarrantyStatus;
  notes: string | null;
  void_reason: string | null;
  voided_at: string | null;
  created_at: string;
}

export interface WarrantyWithRelations extends Warranty {
  customer: Customer;
  product: Product;
}

export interface WarrantyClaim {
  id: string;
  store_id: string;
  warranty_id: string;
  status: WarrantyClaimStatus;
  claim_type: WarrantyClaimType | null;
  intake_notes: string | null;
  diagnosis_notes: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface WarrantyClaimWithRelations extends WarrantyClaim {
  warranty: WarrantyWithRelations;
}

export interface ManagementWarrantyItem {
  warranty: WarrantyWithRelations;
  coverage: CoverageResult;
  openClaimId: string | null;
}

export interface IdentifierSearchResult {
  coverage: CoverageResult;
  warranty: WarrantyWithRelations | null;
  openClaimId: string | null;
}

export interface SaleWarrantyItem {
  productId: string;
  identifier: string;
}

export interface WarrantyDetailData {
  warranty: WarrantyWithRelations;
  sale: Sale | null;
  saleItems: WarrantyWithRelations[];
}

export interface ManageWarrantyItem {
  warranty: WarrantyWithRelations;
  coverage: CoverageResult;
  openClaimId: string | null;
}

export interface WarrantyManageContext {
  defaultWarrantyId: string;
  customerName: string;
  saleDate: string;
  sale: Sale | null;
  items: ManageWarrantyItem[];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  telefonia: "Telefonía",
  computadores: "Computadores",
  pantallas: "Pantallas",
  accesorios: "Accesorios",
  electrodomesticos: "Electrodomésticos",
  videojuegos: "Videojuegos",
};

export const STATUS_LABELS: Record<WarrantyStatus, string> = {
  vigente: "Vigente",
  por_vencer: "Por vencer",
  vencida: "Vencida",
  anulada: "Anulada",
};

export const CLAIM_STATUS_LABELS: Record<WarrantyClaimStatus, string> = {
  ingresado: "Ingresado",
  en_diagnostico: "En diagnóstico",
  aprobado: "Aprobado para garantía",
  no_aplica: "No aplica garantía",
  devolucion_aprobada: "Devolución aprobada",
  listo_entrega: "Listo para entrega",
};

export const COVERAGE_LABELS: Record<CoverageResult, string> = {
  sin_registro: "Sin registro",
  sin_cobertura: "Sin cobertura",
  cubierta: "Cobertura vigente",
};

export const CLAIM_TYPE_LABELS: Record<WarrantyClaimType, string> = {
  reparacion: "Reparación",
  devolucion: "Devolución",
  cambio: "Cambio",
};
