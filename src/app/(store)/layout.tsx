import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import styles from './store-layout.module.css';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>
    <a href="#main-content" className={styles.skipLink}>Skip to content</a>
    <Navbar />
    <main id="main-content" className={styles.main}>{children}</main>
    <Footer />
  </div>;
}

