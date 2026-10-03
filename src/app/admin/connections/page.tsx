import type { Metadata } from 'next';
import ShopifyConnection from '../ShopifyConnection';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Connections' };

export default function ConnectionsPage() {
  return <div><div className={styles.header}><div><p className={styles.eyebrow}>WORKING TOGETHER</p><h1 className={styles.title}>A well-connected store.</h1><p className={styles.subtitle}>Manage the services that keep everything running.</p></div></div><ShopifyConnection /></div>;
}
