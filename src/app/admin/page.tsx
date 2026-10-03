import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { adminGetDashboardStats } from '@/lib/shopify-admin';
import ShopifyConnection from './ShopifyConnection';
import styles from './dashboard.module.css';

export const metadata: Metadata = { title: 'Overview' };

export default async function AdminDashboardPage() {
  if (!isValidAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)) return null;
  let stats: Awaited<ReturnType<typeof adminGetDashboardStats>> | null = null;
  try { stats = await adminGetDashboardStats(); } catch { /* Connection status below explains setup. */ }
  const statCards = [
    { label: 'Products', value: stats?.totalProducts, note: 'In your catalog', mark: '01' },
    { label: 'Active', value: stats?.activeProducts, note: 'Ready to discover', mark: '02' },
    { label: 'Drafts', value: stats?.draftProducts, note: 'Work in progress', mark: '03' },
    { label: 'Collections', value: stats?.totalCollections, note: 'Thoughtfully grouped', mark: '04' },
    { label: 'Out of stock', value: stats?.outOfStock, note: 'Needs your attention', mark: '05' },
  ];
  return (
    <div>
      <div className={styles.header}>
        <div><p className={styles.eyebrow}>THE BIG PICTURE</p><h1 className={styles.title}>Your store, at a glance.</h1><p className={styles.subtitle}>A little clarity. A lot less busywork.</p></div>
        <Link href="/admin/products/new" className="btn btn-primary">Add a product <span aria-hidden="true">+</span></Link>
      </div>
      {!stats && <p className={styles.dataNotice}>Live store data is unavailable. Check your Shopify connection below to get started.</p>}
      <div className={styles.statsGrid} role="list" aria-label="Store statistics">
        {statCards.map((stat) => (
          <div key={stat.label} className={styles.statCard} role="listitem">
            <div className={styles.statTop}><span>{stat.label}</span><span>{stat.mark}</span></div>
            <div className={styles.statValue}>{stat.value?.toLocaleString() ?? '—'}</div>
            <div className={styles.statLabel}>{stat.note}</div>
          </div>
        ))}
      </div>
      <div className={styles.sectionHeader}><h2>Make things happen.</h2><span>YOUR EVERYDAY TOOLS</span></div>
      <div className={styles.actionsGrid}>
        {[
          { title: 'Products', desc: 'Fine-tune the details. Make every product count.', href: '/admin/products', mark: '↗' },
          { title: 'Collections', desc: 'Bring good things together in one place.', href: '/admin/collections', mark: '⊞' },
          { title: 'Inventory', desc: 'Know what is available, down to the last one.', href: '/admin/inventory', mark: '≡' },
        ].map((action) => (
          <Link key={action.href} href={action.href} className={styles.actionCard}>
            <span className={styles.actionIcon} aria-hidden="true">{action.mark}</span>
            <h3>{action.title}</h3><p>{action.desc}</p><span className={styles.actionArrow}>Open workspace <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
      {/* <ShopifyConnection /> */}
    </div>
  );
}

