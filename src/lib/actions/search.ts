"use server";

import { getCustomers } from "@/lib/actions/customers";
import { searchClaims } from "@/lib/actions/claims";
import { getProducts } from "@/lib/actions/products";
import { searchWarranties } from "@/lib/actions/warranties";
import type {
  Customer,
  ProductWithStats,
  WarrantyClaimWithRelations,
  WarrantyWithRelations,
} from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { shortProductId } from "@/lib/warranty";

const RESULT_LIMIT = 12;

export interface GlobalSearchResults {
  warranties: WarrantyWithRelations[];
  claims: WarrantyClaimWithRelations[];
  customers: Customer[];
  products: ProductWithStats[];
}

function limit<T>(items: T[]): T[] {
  return items.slice(0, RESULT_LIMIT);
}

function filterProducts(products: ProductWithStats[], query: string) {
  const q = query.toLowerCase();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(q) ||
      shortProductId(product.id).toLowerCase().includes(q) ||
      CATEGORY_LABELS[product.category].toLowerCase().includes(q)
  );
}

export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { warranties: [], claims: [], customers: [], products: [] };
  }

  const [warranties, claims, customers, allProducts] = await Promise.all([
    searchWarranties(trimmed),
    searchClaims(trimmed),
    getCustomers(trimmed),
    getProducts(),
  ]);

  return {
    warranties: limit(warranties),
    claims: limit(claims),
    customers: limit(customers),
    products: limit(filterProducts(allProducts, trimmed)),
  };
}
