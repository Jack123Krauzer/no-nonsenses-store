'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { AdminProduct } from '@/lib/shopify-admin';
import styles from './products.module.css';


function useAdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products', {
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export default function AdminProductsPage() {
  const { products, loading, error, refetch } = useAdminProducts();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (product: AdminProduct) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      const id = product.id.split('/').pop()!;
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'badge-success',
      DRAFT: 'badge-warning',
      ARCHIVED: 'badge-muted',
    };
    return `badge ${map[status] ?? 'badge-muted'}`;
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className="display-md">Products</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading…' : `${products.length} products in your Shopify store`}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary" id="add-product-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="search"
          className={`form-input ${styles.searchInput}`}
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
          id="product-search"
        />
        <select
          className={`form-input form-select ${styles.filterSelect}`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          id="status-filter"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          className="btn btn-ghost btn-sm"
          onClick={refetch}
          id="refresh-products-btn"
          aria-label="Refresh products"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <strong>Error:</strong> {error}
          <p className={styles.errorHint}>
            Open <Link href="/admin/connections">Connections</Link> to check your Shopify setup and generate an Admin token.
          </p>
        </div>
      )}

      {/* Table */}
      {!error && (
        loading ? (
          <div className={styles.skeletons}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonRow}`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.empty}>
            <p>No products found. {search && 'Try a different search.'}</p>
            {!search && (
              <Link href="/admin/products/new" className="btn btn-primary btn-sm" id="empty-add-product-btn">
                Add your first product
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table} aria-label="Products table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Status</th>
                  <th scope="col">Type</th>
                  <th scope="col">Vendor</th>
                  <th scope="col">Inventory</th>
                  <th scope="col">Variants</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productThumb}>
                          {product.featuredImage ? (
                            <Image
                              src={product.featuredImage.url}
                              alt={product.title}
                              fill
                              className={styles.thumbImg}
                              sizes="48px"
                            />
                          ) : (
                            <span aria-hidden="true">📦</span>
                          )}
                        </div>
                        <div>
                          <p className={styles.productTitle}>{product.title}</p>
                          <p className={styles.productHandle}>{product.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={statusBadge(product.status)}>
                        {product.status.toLowerCase()}
                      </span>
                    </td>
                    <td className={styles.cellMuted}>{product.productType || '—'}</td>
                    <td className={styles.cellMuted}>{product.vendor || '—'}</td>
                    <td>
                      <span className={product.totalInventory <= 0 ? styles.stockOut : styles.stockIn}>
                        {product.totalInventory}
                      </span>
                    </td>
                    <td className={styles.cellMuted}>{product.variants.nodes.length}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/products/${encodeURIComponent(product.id.split('/').pop()!)}`}
                          className="btn btn-ghost btn-sm"
                          aria-label={`Edit ${product.title}`}
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product)}
                          disabled={deleting === product.id}
                          aria-label={`Delete ${product.title}`}
                        >
                          {deleting === product.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
