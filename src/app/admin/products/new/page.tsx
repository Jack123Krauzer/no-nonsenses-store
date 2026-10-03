'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/app/admin/admin-form.module.css';


export default function NewProductPage() {
  const router = useRouter();

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
  const [inventoryQuantity, setInventoryQuantity] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!price || isNaN(Number(price))) {
      setError('A valid product price is required.');
      return;
    }

    setSubmitting(true);
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
      tags: tagArray.length > 0 ? tagArray : undefined,
      variants: [
        {
          price: price.trim(),
          compareAtPrice: compareAtPrice.trim() || undefined,
          sku: sku.trim() || undefined,
          inventoryQuantity: parseInt(inventoryQuantity, 10) || 0,
        },
      ],
      images: imageUrl.trim()
        ? [
            {
              src: imageUrl.trim(),
              altText: imageAlt.trim() || title.trim(),
            },
          ]
        : undefined,
      seo: (seoTitle.trim() || seoDescription.trim())
        ? {
            title: seoTitle.trim() || undefined,
            description: seoDescription.trim() || undefined,
          }
        : undefined,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.errors?.map((err: { message: string }) => err.message).join(', ') || data.error || 'Failed to create product in Shopify.';
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/products" className={styles.backLink}>
            ← Back to Products
          </Link>
          <h1 className="display-md">Add Product</h1>
        </div>
      </div>

      {/* Notifications */}
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
            <strong>Success!</strong> Product created and synced to Shopify. Redirecting…
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          {/* Main Column */}
          <div>
            {/* General Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Product Information</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-title">Title *</label>
                <input
                  id="product-title"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Minimalist Matte Black Watch"
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
                  placeholder="Detailed description of features, materials, and specifications…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Pricing & Inventory</h2>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="product-price">Price (₹) *</label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder="2499"
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
                    placeholder="2999"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                  />
                  <span className={styles.helpText}>Shows a strike-through discount</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="product-sku">SKU (Stock Keeping Unit)</label>
                  <input
                    id="product-sku"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. NNS-WTC-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="product-inventory">Available Stock</label>
                  <input
                    id="product-inventory"
                    type="number"
                    min="0"
                    className={styles.input}
                    placeholder="10"
                    value={inventoryQuantity}
                    onChange={(e) => setInventoryQuantity(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Media</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-image">Image URL</label>
                <input
                  id="product-image"
                  type="url"
                  className={styles.input}
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <span className={styles.helpText}>Enter a direct image link from Unsplash, Shopify CDN, or any CDN</span>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-image-alt">Alt Text</label>
                <input
                  id="product-image-alt"
                  type="text"
                  className={styles.input}
                  placeholder="Brief image description for SEO & accessibility"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>

              {imageUrl && (
                <div className={styles.previewImage}>
                  <Image
                    src={imageUrl}
                    alt={imageAlt || 'Preview'}
                    fill
                    sizes="400px"
                    style={{ objectFit: 'contain' }}
                    onError={() => setError('Image failed to load from provided URL. Please verify the link.')}
                  />
                </div>
              )}
            </div>

            {/* SEO */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Search Engine Optimization (SEO)</h2>

              <div className={styles.fieldGroup}>
                <label htmlFor="seo-title">Meta Title</label>
                <input
                  id="seo-title"
                  type="text"
                  className={styles.input}
                  placeholder={title || 'Product title on search engines'}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="seo-description">Meta Description</label>
                <textarea
                  id="seo-description"
                  className={styles.textarea}
                  placeholder="Concise summary for Google search results (120-160 characters)"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Status & Visibility</h2>

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
                <label htmlFor="product-vendor">Vendor / Brand</label>
                <input
                  id="product-vendor"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Acme Goods"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="product-type">Product Category / Type</label>
                <input
                  id="product-type"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Accessories, Electronics"
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
                  placeholder="minimal, sale, new"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <span className={styles.helpText}>Separate tags with commas</span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Link href="/admin/products" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                id="save-product-btn"
              >
                {submitting ? 'Creating in Shopify…' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
