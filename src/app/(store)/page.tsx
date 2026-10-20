import type { Metadata } from "next";
import Link from "next/link";
import MonochromeHome from "@/components/MonochromeHome/MonochromeHome";
import ProductCard from "@/components/ProductCard/ProductCard";
import {
  getFeaturedProducts,
  getAllCollections,
} from "@/lib/shopify-storefront";

export const metadata: Metadata = {
  title: "No Nonsenses — Wear your inside voice.",
  description:
    "Everyday clothing with an unapologetic sense of humour. Explore the first No Nonsenses collection and shop our current catalog.",
};

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getFeaturedProducts(8),
    getAllCollections(),
  ]);
  const demo = products.some(
    (product) => product.isDemo || product.id.includes("fallback-"),
  );
  return (
    <MonochromeHome>
      <section
        className="section live-catalog"
        id="shop"
        aria-labelledby="shop-title"
      >
        <div className="section-top">
          <div>
            <span className="kicker">THE STORE / CURRENT CATALOG</span>
            <h2 id="shop-title">
              Find your next
              <br />
              <span>good thing.</span>
            </h2>
          </div>
          <Link href="/products" className="text-button">
            Shop all products <span>↗</span>
          </Link>
        </div>
        <div className="live-collections" aria-label="Shop collections">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
            >
              {collection.title} ↗
            </Link>
          ))}
        </div>
        {demo ? (
          <p className="catalog-note">
            Sample catalog — configure the existing Shopify connection to
            display your live products. Concept clothing above is a separate
            preview.
          </p>
        ) : null}
        {products.length ? (
          <div className="live-products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="catalog-note">
            Our next edit is on the way. Check back for new arrivals.
          </p>
        )}
      </section>
    </MonochromeHome>
  );
}
