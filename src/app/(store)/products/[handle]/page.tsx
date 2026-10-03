import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByHandle, getAllProducts } from '@/lib/shopify-storefront';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  try {
    const products = await getAllProducts(100);
    return products.map((p) => ({ handle: p.handle }));
  } catch (err) {
    console.warn('[Build] generateStaticParams for products skipped:', err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  return {
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.description.slice(0, 160),
    openGraph: {
      title: product.seo.title ?? product.title,
      description: product.seo.description ?? product.description.slice(0, 160),
      images: product.featuredImage
        ? [{ url: product.featuredImage.url, alt: product.featuredImage.altText ?? product.title }]
        : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
