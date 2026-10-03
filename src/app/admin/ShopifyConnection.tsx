'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

type Connection = { configured: boolean; connected: boolean; shop?: string; expiresAt?: string | null; updatedAt?: string | null; scopes?: string[] | string; missing?: string[] };

export default function ShopifyConnection() {
  const router = useRouter();
  const [status, setStatus] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/shopify/token', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load connection status.');
      setStatus(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load connection status.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function generate() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/shopify/token', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to connect Shopify.');
      setStatus(data);
      setNotice('Your Shopify Admin token is encrypted and saved in Supabase.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to connect Shopify.');
    } finally { setBusy(false); }
  }

  return (
    <section className={styles.connection} aria-labelledby="connection-title">
      <div className={styles.connectionHeader}>
        <div className={styles.connectionLogo} aria-hidden="true">S</div>
        <div><h2 id="connection-title">Shopify + Supabase</h2><p>Your store, securely connected.</p></div>
        <span className={status?.connected ? styles.connected : styles.disconnected}>{loading ? 'Checking…' : status?.connected ? 'Connected' : 'Setup required'}</span>
      </div>
      <p className={styles.connectionCopy}>Generate your Admin API token from your Shopify app credentials. It is encrypted before storage and renewed automatically when needed.</p>
      {status?.shop && <div className={styles.connectionDetail}><span>Store</span><strong>{status.shop}</strong></div>}
      {status?.expiresAt && <div className={styles.connectionDetail}><span>Token expires</span><strong>{new Date(status.expiresAt).toLocaleString()}</strong></div>}
      {!!status?.missing?.length && <div className={styles.setupNotice}><strong>Finish your environment setup</strong><p>Add these values to <code>.env.local</code>, then restart the app:</p><ul>{status.missing.map((name) => <li key={name}><code>{name}</code></li>)}</ul></div>}
      {error && <p className={styles.errorNotice} role="alert">{error}</p>}
      {notice && <p className={styles.successNotice} role="status">{notice}</p>}
      <div className={styles.connectionActions}>
        <button className="btn btn-primary" onClick={generate} disabled={loading || busy || !status?.configured}>{busy ? 'Connecting…' : status?.connected ? 'Refresh Admin token' : 'Generate Admin token'} <span aria-hidden="true">↗</span></button>
        <button className="btn btn-ghost" onClick={load} disabled={loading || busy}>Check status</button>
      </div>
      <small className={styles.connectionFootnote}>Requires a Dev Dashboard app installed on a store in your own Shopify organization. Tokens never appear in the browser.</small>
    </section>
  );
}

