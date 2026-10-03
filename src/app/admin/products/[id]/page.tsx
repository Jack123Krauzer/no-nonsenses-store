'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { AdminProduct } from '@/lib/shopify-admin';
import styles from '@/app/admin/admin-form.module.css';


interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [vendor, setVendor] = useState('');
  const [productType, setProductType] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [variantId, setVariantId] = useState<string | undefined>();
  const [handle, setHandle] = useState('');

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
          credentials: 'same-origin',
        });

        if (!res.ok) {
          throw new Error('Failed to load product details from Shopify');
        }

        const data = await res.json();
        const p: AdminProduct = data.product;

        setTitle(p.title || '');
        setHandle(p.handle || '');
        // Strip out enclosing <p> tags for editing
        setDescription(p.descriptionHtml ? p.descriptionHtml.replace(/<[^>]*>/g, '') : '');
        setStatus((p.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED') || 'ACTIVE');
        setVendor(p.vendor || '');
        setProductType(p.productType || '');
        setTags((p.tags || []).join(', '));

        if (p.featuredImage) {
          setImageUrl(p.featuredImage.url || '');
          setImageAlt(p.featuredImage.altText || '');
        }

        const primaryVariant = p.variants?.nodes?.[0];
        if (primaryVariant) {
          setVariantId(primaryVariant.id);
          setPrice(primaryVariant.price || '');
          setCompareAtPrice(primaryVariant.compareAtPrice || '');
          setSku(primaryVariant.sku || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch product details');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }

    setSaving(true);
    setError(null);

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      descriptionHtml: description.trim() ? `<p>${description.trim().replace(/\n\n/g, '</p><p>')}</p>` : undefined,
      status,
      vendor: vendor.trim() || undefined,
      productType: productType.trim() || undefined,
      tags: tagArray,
      variants: variantId
        ? [
            {
              id: variantId,
              price: price.trim(),
              compareAtPrice: compareAtPrice.trim() || undefined,
              sku: sku.trim() || undefined,
            },
          ]
        : undefined,
    };

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg =
          data.errors?.map((err: { message: string }) => err.message).join(', ') ||
          data.error ||
          'Failed to update product in Shopify.';
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove it from Shopify.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      router.push('/admin/products');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className="skeleton" style={{ width: 200, height: 32 }} />
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/products" className={styles.backLink}>
            ← Back to Products
          </Link>
          <h1 className="display-md">Edit Product</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {handle && (
            <Link
              href={`/products/${handle}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
            >
              View on Storefront ↗
            </Link>
          )}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Product'}
          </button>
        </div>
      </div>

      {/* Status banners */}
      {error && (
        <div className={`${styles.statusBanner} ${styles.statusBannerError}`} role="alert">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {success && (
        <div className={`${styles.statusBanner} ${styles.statusBannerSuccess}`} role="status">
          <div>
            <strong>Success!</strong> Changes synced directly to Shopify.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* Main Column */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Product Information</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-title">Title *</label>
                <input
                  id="product-title"
                  type="text"
                  className={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-desc">Description</label>
                <textarea
                  id="product-desc"
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Pricing</h2>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="product-price">Price (₹) *</label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="product-compare-price">Compare-at Price (₹)</label>
                  <input
                    id="product-compare-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-sku">SKU</label>
                <input
                  id="product-sku"
                  type="text"
                  className={styles.input}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            {/* Media */}
            {imageUrl && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Featured Image</h2>
                <div className={styles.previewImage}>
                  <Image
                    src={imageUrl}
                    alt={imageAlt || title}
                    fill
                    sizes="400px"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Status & Organization</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-status">Status</label>
                <select
                  id="product-status"
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'DRAFT' | 'ARCHIVED')}
                >
                  <option value="ACTIVE">Active (Live in Store)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-vendor">Vendor</label>
                <input
                  id="product-vendor"
                  type="text"
                  className={styles.input}
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-type">Category</label>
                <input
                  id="product-type"
                  type="text"
                  className={styles.input}
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-tags">Tags</label>
                <input
                  id="product-tags"
                  type="text"
                  className={styles.input}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <span className={styles.helpText}>Comma-separated list</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/admin/products" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                id="save-changes-btn"
              >
                {saving ? 'Syncing to Shopify…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
