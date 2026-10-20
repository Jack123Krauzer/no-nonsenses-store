"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { formatPrice } from "@/lib/shopify-storefront";
import Icon from "@/components/Icon";
import styles from "./ProductCard.module.css";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: ShopifyProduct;
  priority?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const variant =
    product.variants.nodes.find((item) => item.availableForSale) ??
    product.variants.nodes[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const comparison = variant?.compareAtPrice;
  const onSale = comparison && Number(comparison.amount) > Number(price.amount);
  const available = product.availableForSale && !!variant?.availableForSale;
  const manyOptions = product.variants.nodes.length > 1;
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link
          href={`/products/${product.handle}`}
          aria-label={product.title}
          className={styles.imageLink}
        >
          {product.featuredImage && !imageFailed ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              sizes="(max-width: 900px) 45vw, 23vw"
              preload={priority}
              onError={() => setImageFailed(true)}
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>
              <Icon name="box" size={46} />
            </div>
          )}
        </Link>
        {(!available || onSale) && (
          <span className={styles.badge}>
            {!available ? "Sold out" : "A good find"}
          </span>
        )}
        <Link
          href={`/products/${product.handle}`}
          className={styles.quickAdd}
          aria-label={`View details for ${product.title}`}
        >
          <Icon name="northeast" size={18} />
        </Link>
      </div>
      <div className={styles.meta}>
        <span>
          {product.productType || product.vendor || "Everyday essential"}
        </span>
        {manyOptions && <span>{product.variants.nodes.length} options</span>}
      </div>
      <Link href={`/products/${product.handle}`}>
        <h3 className={styles.title}>{product.title}</h3>
      </Link>
      <div className={styles.prices}>
        <span>{formatPrice(price.amount, price.currencyCode)}</span>
        {onSale && (
          <del>{formatPrice(comparison.amount, comparison.currencyCode)}</del>
        )}
      </div>
    </article>
  );
}
