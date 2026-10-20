import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/shopify-storefront";
import Catalog from "@/components/Catalog/Catalog";
export const metadata: Metadata = {
  title: "Shop all — No Nonsenses",
  description: "Explore the current No Nonsenses product catalog.",
};
export default async function ProductsPage() {
  const products = await getAllProducts(48);
  const sorted = [
    ...products.filter((product) => product.availableForSale),
    ...products.filter((product) => !product.availableForSale),
  ];
  return (
    <div className="container section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span aria-current="page">Products</span>
      </nav>
      <span className="eyebrow">THE CURRENT CATALOG</span>
      <h1 className="display-md" style={{ margin: "15px 0 24px" }}>
        Find your next good thing.
      </h1>
      {products.some((product) => product.isDemo) ? (
        <p style={{ color: "#aaa", fontSize: 12, marginBottom: 30 }}>
          Sample catalog — these items are for browsing and cannot be purchased.
        </p>
      ) : null}
      <Catalog products={sorted} />
    </div>
  );
}
