'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { AdminCollection } from '@/lib/shopify-admin';
import styles from './collections.module.css';


export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation form state
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createImage, setCreateImage] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/collections', {
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('Failed to fetch collections');
      const data = await res.json();
      setCollections(data.collections ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: createTitle.trim(),
          descriptionHtml: createDesc.trim() ? `<p>${createDesc.trim()}</p>` : undefined,
          image: createImage.trim() ? { src: createImage.trim(), altText: createTitle.trim() } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create collection in Shopify');
      }

      setCreateTitle('');
      setCreateDesc('');
      setCreateImage('');
      setShowCreate(false);
      await fetchCollections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (collection: AdminCollection) => {
    if (!confirm(`Delete collection "${collection.title}"? This cannot be undone.`)) return;

    setDeletingId(collection.id);
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: collection.id }),
      });

      if (!res.ok) throw new Error('Failed to delete collection');
      await fetchCollections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="display-md">Collections</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading…' : `${collections.length} collections synced with Shopify`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreate(!showCreate)}
          id="toggle-create-collection-btn"
        >
          {showCreate ? 'Close Form' : '+ New Collection'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="status-banner status-banner-error" role="alert" style={{ marginBottom: 'var(--space-xl)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create Collection Card */}
      {showCreate && (
        <form onSubmit={handleCreate} className={styles.createCard}>
          <h2 className={styles.createTitle}>Create New Collection in Shopify</h2>
          <div className={styles.formGrid}>
            <div>
              <label htmlFor="col-title" style={{ display: 'block', fontSize: '0.875rem', marginBottom: 6 }}>
                Title *
              </label>
              <input
                id="col-title"
                type="text"
                className="form-input"
                placeholder="e.g. Summer Essentials"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="col-image" style={{ display: 'block', fontSize: '0.875rem', marginBottom: 6 }}>
                Image URL (optional)
              </label>
              <input
                id="col-image"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={createImage}
                onChange={(e) => setCreateImage(e.target.value)}
              />
            </div>
            <div className={styles.formFull}>
              <label htmlFor="col-desc" style={{ display: 'block', fontSize: '0.875rem', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                id="col-desc"
                className="form-input"
                rows={3}
                placeholder="Collection description for customers and SEO…"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
              id="submit-collection-btn"
            >
              {creating ? 'Saving to Shopify…' : 'Create Collection'}
            </button>
          </div>
        </form>
      )}

      {/* Collections List */}
      {loading ? (
        <div className={styles.grid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className={styles.empty}>
          <p>No collections found in your Shopify store.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 'var(--space-md)' }}
            onClick={() => setShowCreate(true)}
          >
            Create your first collection
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {collections.map((col) => (
            <div key={col.id} className={styles.collectionCard}>
              <div className={styles.imageWrapper}>
                {col.image ? (
                  <Image
                    src={col.image.url}
                    alt={col.image.altText || col.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className={styles.imagePlaceholder} aria-hidden="true">
                    🗂️
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{col.title}</h2>
                <span className={styles.cardHandle}>/{col.handle}</span>
                {col.descriptionHtml && (
                  <p
                    className={styles.cardDesc}
                    dangerouslySetInnerHTML={{ __html: col.descriptionHtml }}
                  />
                )}
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.productCount}>
                  {col.productsCount?.count ?? 0} products
                </span>
                <div className={styles.cardButtons}>
                  <Link
                    href={`/collections/${col.handle}`}
                    target="_blank"
                    className="btn btn-ghost btn-sm"
                    title="View on storefront"
                  >
                    ↗ View
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(col)}
                    disabled={deletingId === col.id}
                  >
                    {deletingId === col.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
