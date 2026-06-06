import { getProducts } from "@/lib/actions/products";
import { ProductosClient } from "./productos-client";

export default async function ProductosPage() {
  const products = await getProducts();
  return <ProductosClient initialProducts={products} />;
}
