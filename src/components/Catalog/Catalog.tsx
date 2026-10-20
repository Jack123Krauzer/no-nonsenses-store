"use client";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import ProductCard from "@/components/ProductCard/ProductCard";
import styles from "./Catalog.module.css";
export default function Catalog({ products }: { products: ShopifyProduct[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const types = Array.from(
    new Set(products.map((product) => product.productType).filter(Boolean)),
  );
  const filtered = products.filter(
    (product) =>
      (type === "All" || product.productType === type) &&
      `${product.title} ${product.description} ${product.productType}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  return (
    <>
      <div className={styles.toolbar} id="search">
        <label>
          Search products
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the collection"
          />
        </label>
        <label>
          Product type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option>All</option>
            {types.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={styles.count} role="status">
        {filtered.length} {filtered.length === 1 ? "product" : "products"} found
      </p>
      {filtered.length ? (
        <div className="products-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No products match your search.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              setType("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
