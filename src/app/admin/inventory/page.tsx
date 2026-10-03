'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminLocation } from '@/lib/shopify-admin';
import styles from './inventory.module.css';


interface InventoryItem {
  inventoryItemId: string;
  sku: string | null;
  productTitle: string;
  variantTitle: string;
  available: number;
  updatedAt: string;
}

export default function AdminInventoryPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [search, setSearch] = useState('');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [customDelta, setCustomDelta] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Locations
  useEffect(() => {
    async function loadLocations() {
      setLoadingLocations(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/inventory', {
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error('Failed to fetch Shopify locations');
        const data = await res.json();
        const locs: AdminLocation[] = data.locations ?? [];
        setLocations(locs);
        if (locs.length > 0) {
          setSelectedLocation(locs[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading locations');
      } finally {
        setLoadingLocations(false);
      }
    }
    loadLocations();
  }, []);

  // Fetch Inventory for Selected Location
  const loadInventory = useCallback(async () => {
    if (!selectedLocation) return;
    setLoadingItems(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/inventory?locationId=${encodeURIComponent(selectedLocation)}`,
        {
          credentials: 'same-origin',
        }
      );
      if (!res.ok) throw new Error('Failed to fetch inventory levels');
      const data = await res.json();
      setItems(data.inventory ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading inventory');
    } finally {
      setLoadingItems(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Adjust Inventory Handler
  const handleAdjust = async (inventoryItemId: string, delta: number) => {
    if (delta === 0) return;
    setAdjustingId(inventoryItemId);
    setError(null);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventoryItemId,
          locationId: selectedLocation,
          delta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = data.errors?.map((e: { message: string }) => e.message).join(', ') || data.error || 'Adjustment failed in Shopify';
        throw new Error(errorText);
      }

      // Optimistically update stock in UI
      setItems((prev) =>
        prev.map((item) =>
          item.inventoryItemId === inventoryItemId
            ? { ...item, available: item.available + delta }
            : item
        )
      );

      setSuccessMsg(`Inventory updated (${delta > 0 ? `+${delta}` : delta}) in Shopify!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setCustomDelta((prev) => ({ ...prev, [inventoryItemId]: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory');
    } finally {
      setAdjustingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.productTitle.toLowerCase().includes(term) ||
      item.variantTitle.toLowerCase().includes(term) ||
      (item.sku && item.sku.toLowerCase().includes(term))
    );
  });

  const getStockClass = (qty: number) => {
    if (qty <= 0) return styles.outOfStock;
    if (qty <= 5) return styles.lowStock;
    return styles.inStock;
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="display-md">Inventory Management</h1>
          <p className={styles.subtitle}>
            Adjust stock levels across Shopify fulfillment locations in real time
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="status-banner status-banner-error" role="alert" style={{ marginBottom: 'var(--space-xl)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMsg && (
        <div className="status-banner status-banner-success" role="status" style={{ marginBottom: 'var(--space-xl)' }}>
          <strong>Success:</strong> {successMsg}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div>
          <label htmlFor="location-select" style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4, color: 'var(--color-text-secondary)' }}>
            Location
          </label>
          <select
            id="location-select"
            className={`form-input form-select ${styles.locationSelect}`}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            disabled={loadingLocations || locations.length === 0}
          >
            {locations.length === 0 && <option value="">No locations available</option>}
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name} {loc.isActive ? '' : '(Inactive)'}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="inventory-search" style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4, color: 'var(--color-text-secondary)' }}>
            Search Products
          </label>
          <input
            id="inventory-search"
            type="search"
            className={`form-input ${styles.searchInput}`}
            placeholder="Search by title or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-end', height: 42 }}
          onClick={loadInventory}
          disabled={loadingItems}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      {loadingItems ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {items.length === 0
              ? 'No inventory tracked for this location. Products must have inventory tracking enabled in Shopify.'
              : 'No items match your search filter.'}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Product / Variant</th>
                <th scope="col">SKU</th>
                <th scope="col">Available Stock</th>
                <th scope="col">Quick Adjustment (Direct to Shopify)</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isBusy = adjustingId === item.inventoryItemId;
                const customVal = customDelta[item.inventoryItemId] ?? '';

                return (
                  <tr key={item.inventoryItemId}>
                    <td>
                      <div className={styles.productCell}>
                        <span className={styles.productTitle}>{item.productTitle}</span>
                        {item.variantTitle && item.variantTitle !== 'Default Title' && (
                          <span className={styles.variantTitle}>{item.variantTitle}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.sku}>{item.sku || '—'}</span>
                    </td>
                    <td>
                      <span className={`${styles.stockBadge} ${getStockClass(item.available)}`}>
                        {item.available} units
                      </span>
                    </td>
                    <td>
                      <div className={styles.adjustCell}>
                        <button
                          type="button"
                          className={styles.adjustBtn}
                          disabled={isBusy}
                          onClick={() => handleAdjust(item.inventoryItemId, -5)}
                          title="Reduce stock by 5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          className={styles.adjustBtn}
                          disabled={isBusy}
                          onClick={() => handleAdjust(item.inventoryItemId, -1)}
                          title="Reduce stock by 1"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          className={styles.adjustBtn}
                          disabled={isBusy}
                          onClick={() => handleAdjust(item.inventoryItemId, 1)}
                          title="Increase stock by 1"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          className={styles.adjustBtn}
                          disabled={isBusy}
                          onClick={() => handleAdjust(item.inventoryItemId, 5)}
                          title="Increase stock by 5"
                        >
                          +5
                        </button>

                        <div className={styles.customAdjust}>
                          <input
                            type="number"
                            className={`form-input ${styles.customInput}`}
                            placeholder="±qty"
                            value={customVal}
                            onChange={(e) =>
                              setCustomDelta((prev) => ({
                                ...prev,
                                [item.inventoryItemId]: e.target.value,
                              }))
                            }
                            disabled={isBusy}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={isBusy || !customVal || isNaN(parseInt(customVal, 10))}
                            onClick={() =>
                              handleAdjust(item.inventoryItemId, parseInt(customVal, 10))
                            }
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
