'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ShopifyProduct } from '@/lib/shopify-storefront';
import { formatPrice } from '@/lib/shopify-storefront';
import { addToCart } from '@/components/Cart/cart-store';
import Icon from '@/components/Icon';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, priority = false }: { product: ShopifyProduct; priority?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'added' | 'error'>('idle');
  const variant = product.variants.nodes.find(item => item.availableForSale) ?? product.variants.nodes[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const comparison = variant?.compareAtPrice;
  const onSale = comparison && Number(comparison.amount) > Number(price.amount);
  const available = product.availableForSale && !!variant?.availableForSale;
  const manyOptions = product.variants.nodes.length > 1;
  function handleAdd() {
    if (!available || !variant) return;
    try {
      addToCart({ variantId: variant.id, title: product.title, variantTitle: variant.title, price: price.amount, currencyCode: price.currencyCode, quantity: 1, image: variant.image?.url ?? product.featuredImage?.url, handle: product.handle });
      setStatus('added');
      setTimeout(() => setStatus('idle'), 2400);
    } catch { setStatus('error'); }
  }
  return <article className={styles.card}>
    <div className={styles.imageWrap}>
      <Link href={`/products/${product.handle}`} aria-label={product.title} className={styles.imageLink}>{product.featuredImage ? <Image src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title} fill sizes="(max-width: 900px) 45vw, 23vw" preload={priority} className={styles.image}/> : <div className={styles.placeholder}><Icon name="box" size={46}/></div>}</Link>
      {(!available || onSale) && <span className={styles.badge}>{!available ? 'Sold out' : 'A good find'}</span>}
      {manyOptions ? <Link href={`/products/${product.handle}`} className={styles.quickAdd} aria-label={`Choose options for ${product.title}`}><Icon name="northeast" size={18}/></Link> : <button type="button" className={styles.quickAdd} onClick={handleAdd} disabled={!available} aria-label={`Add ${product.title} to bag`}><Icon name={status === 'added' ? 'check' : 'plus'} size={18}/></button>}
    </div>
    <div className={styles.meta}><span>{product.productType || product.vendor || 'Everyday essential'}</span>{manyOptions && <span>{product.variants.nodes.length} options</span>}</div>
    <Link href={`/products/${product.handle}`}><h3 className={styles.title}>{product.title}</h3></Link>
    <div className={styles.prices}><span>{formatPrice(price.amount, price.currencyCode)}</span>{onSale && <del>{formatPrice(comparison.amount, comparison.currencyCode)}</del>}</div>
    <span role="status" className={status === 'error' ? styles.error : styles.status}>{status === 'added' ? 'Added to your bag' : status === 'error' ? 'Unable to save your bag. Please try again.' : ''}</span>
  </article>;
}

