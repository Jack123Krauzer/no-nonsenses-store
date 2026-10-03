'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './admin-layout.module.css';

export default function AdminSignIn({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in. Please try again.');
      setPassword('');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.signInPage}>
      <Link href="/" className={styles.signInBrand}>NO-NONSENSE<span>®</span></Link>
      <div className={styles.signInGrid}>
        <section className={styles.signInIntro}>
          <span className={styles.eyebrow}>THE STORE STUDIO / 01</span>
          <h1>Good things.<br />All in order.</h1>
          <p>Your products, collections, and inventory. One considered workspace to keep it all moving.</p>
          <Link href="/">Back to the storefront <span aria-hidden="true">↗</span></Link>
        </section>
        <section className={styles.signInCard} aria-labelledby="sign-in-heading">
          <div className={styles.lockMark} aria-hidden="true">↗</div>
          <h2 id="sign-in-heading">Welcome back.</h2>
          <p>Sign in to manage your store.</p>
          {!configured ? (
            <div className={styles.notice} role="status">Set <code>ADMIN_SECRET_TOKEN</code> to a unique secret of at least 32 characters in <code>.env.local</code>, then restart the app to enable sign-in.</div>
          ) : (
            <form onSubmit={signIn}>
              <label htmlFor="admin-password">Admin password</label>
              <input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your admin secret" />
              {error && <p className={styles.error} role="alert">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Signing in…' : 'Enter the studio'} <span aria-hidden="true">↗</span></button>
            </form>
          )}
          <small>Private access. Your session stays on this device.</small>
        </section>
      </div>
      <div className={styles.signInFooter}>LESS FRICTION. MORE FOCUS.</div>
    </main>
  );
}

