import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts } from '@/lib/shopify-storefront';
import ProductCard from '@/components/ProductCard/ProductCard';

export const metadata: Metadata = {
  title: 'Full Product Catalog — No-Nonsense Store',
  description:
    'Browse our complete catalogue of premium goods synced directly with Shopify. Live inventory, fair pricing, and 1-click Razorpay checkout.',
};

export default async function ProductsPage() {
  const products = await getAllProducts(48);

  const available = products.filter((p) => p.availableForSale);
  const unavailable = products.filter((p) => !p.availableForSale);
  const sorted = [...available, ...unavailable];

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
            Products
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            All Products
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time Shopify inventory • Secure Razorpay checkout
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-zinc-300">
            {products.length} Products Available
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {sorted.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7"
          role="list"
          aria-label="Product catalog"
        >
          {sorted.map((product) => (
            <div key={product.id} role="listitem">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-white mb-2">No products found</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Ensure your Shopify store has products published and inventory tracking configured.
          </p>
          <Link
            href="/admin/products/new"
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            Add Product via Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
}
