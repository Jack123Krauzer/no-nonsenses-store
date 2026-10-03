import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminSession } from '@/lib/admin-auth';
import styles from './admin-layout.module.css';
import AdminSidebar from './AdminSidebar';
import AdminSignIn from './AdminSignIn';

export const metadata: Metadata = {
  title: { default: 'Store studio', template: '%s | No-Nonsense Studio' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return <AdminSignIn configured={isAdminConfigured()} />;
  }
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.content}>
        <header className={styles.topbar}><span>YOUR STORE, SIMPLIFIED.</span><span className={styles.privateBadge}>Private workspace</span></header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

