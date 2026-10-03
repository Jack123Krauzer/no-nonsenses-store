import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCollectionByHandle, getAllCollections } from '@/lib/shopify-storefront';
import ProductCard from '@/components/ProductCard/ProductCard';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateStaticParams() {
  try {
    const collections = await getAllCollections();
    return collections.map((c) => ({ handle: c.handle }));
  } catch (err) {
    console.warn('[Build] generateStaticParams for collections skipped:', err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  if (!collection) return {};

  return {
    title: `${collection.seo.title ?? collection.title} — No-Nonsense Store`,
    description: collection.seo.description ?? collection.description.slice(0, 160),
    openGraph: {
      title: collection.seo.title ?? collection.title,
      description: collection.seo.description ?? collection.description.slice(0, 160),
      images: collection.image ? [{ url: collection.image.url }] : [],
    },
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    notFound();
  }

  const products = collection.products.nodes;

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Hero Banner */}
      <div className="relative min-h-[320px] flex items-end overflow-hidden border-b border-white/10 bg-[#12121a]">
        {collection.image && (
          <Image
            src={collection.image.url}
            alt={collection.image.altText ?? collection.title}
            fill
            className="object-cover object-center brightness-50"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full z-10">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
              <li>/</li>
              <li className="text-zinc-200 font-semibold" aria-current="page">
                {collection.title}
              </li>
            </ol>
          </nav>

          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mt-2 leading-relaxed">
              {collection.description}
            </p>
          )}
          <span className="inline-block mt-4 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300">
            {products.length} product{products.length !== 1 ? 's' : ''} in this collection
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {products.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7"
            role="list"
            aria-label={`${collection.title} products`}
          >
            {products.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-white/10">
            <p className="text-zinc-400 text-sm">No products found in this collection yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
