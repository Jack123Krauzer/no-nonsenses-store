import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllCollections } from '@/lib/shopify-storefront';

export const metadata: Metadata = {
  title: 'Curated Collections — No-Nonsense Store',
  description: 'Explore hand-picked collections and product categories directly synced with Shopify.',
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-zinc-400">
          <li>
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-200 font-semibold" aria-current="page">
            Collections
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Categories
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Product Collections
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse goods grouped by line, material, and utility
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-zinc-300">
          {collections.length} Collections
        </span>
      </div>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative h-80 rounded-3xl overflow-hidden border border-white/[0.08] hover:border-violet-500/50 transition-all duration-500 shadow-xl flex flex-col justify-end"
            >
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.title}
                  fill
                  className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full bg-[#181824] flex items-center justify-center text-4xl">
                  📁
                </div>
              )}
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

              {/* Content */}
              <div className="relative p-6 z-10">
                <span className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1">
                  Collection
                </span>
                <h2 className="text-2xl font-bold text-white group-hover:text-violet-200 transition-colors">
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className="text-xs text-zinc-300 line-clamp-2 mt-1">
                    {collection.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <span className="text-xs text-zinc-400">
                    {collection.products.nodes.length} products
                  </span>
                  <span className="text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                    Explore →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="text-5xl mb-4">🗂️</div>
          <h2 className="text-xl font-bold text-white mb-2">No collections found</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Create your first collection in Shopify or via the Admin Panel.
          </p>
          <Link
            href="/admin/collections"
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            Manage Collections in Admin
          </Link>
        </div>
      )}
    </div>
  );
}
