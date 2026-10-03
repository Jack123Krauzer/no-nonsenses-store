'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './AdminSidebar.module.css';

const NAV_ITEMS = [
  // {
  //   label: 'Connections',
  //   href: '/admin/connections',
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
  //       <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-2 2M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l2-2" />
  //     </svg>
  //   ),
  // },
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: 'Collections',
    href: '/admin/collections',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2" y="3" width="6" height="10" rx="1" /><rect x="10" y="3" width="12" height="5" rx="1" />
        <rect x="10" y="12" width="12" height="4" rx="1" /><rect x="2" y="17" width="6" height="4" rx="1" />
        <rect x="10" y="20" width="12" height="1" rx="0.5" />
      </svg>
    ),
  },
  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function signOut() {
    setSigningOut(true);
    setSignOutError('');
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' });
      if (!response.ok) throw new Error('Sign-out failed. Please try again.');
      router.refresh();
    } catch {
      setSignOutError('Sign-out failed. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside className={styles.sidebar} aria-label="Admin navigation">
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark} aria-hidden="true">n.</div>
        <div>
          <div className={styles.logoName}>No-Nonsense</div>
          <div className={styles.logoSub}>Store studio</div>
        </div>
      </div>

      {/* Nav */}
      <nav>
        <ul className={styles.navList} role="list">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/" className={styles.storeFrontLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View Storefront
        </Link>
        <button className={styles.signOut} onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'} <span aria-hidden="true">↗</span></button>
        {signOutError && <p role="alert">{signOutError}</p>}
      </div>
    </aside>
  );
}
