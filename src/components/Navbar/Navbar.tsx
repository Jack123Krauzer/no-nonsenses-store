'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/Cart/cart-store';
import Icon from '@/components/Icon';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const links = [{ href: '/products', label: 'Shop all' }, { href: '/collections', label: 'Collections' }, { href: '/#our-approach', label: 'Our approach' }];
  return <>
    <div className={styles.announcement}>Less noise. Better things. <span>Discover your everyday essentials <Icon name="arrow" size={13} /></span></div>
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="No-Nonsense Store home"><span className={styles.mark}>n<span>n</span><i /></span><span className={styles.wordmark}>NO–NONSENSE<span>GOOD THINGS. NOTHING ELSE.</span></span></Link>
        <nav className={styles.desktop} aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}</nav>
        <div className={styles.actions}>
          <Link href="/products#search" className={styles.search} aria-label="Search products"><Icon name="search" /></Link>
          <Link href="/cart" className={styles.bag} aria-label={`Shopping bag, ${count} items`}><Icon name="bag" /><span className={styles.bagLabel}>Bag</span><span className={styles.count}>{count}</span></Link>
          <button type="button" className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={menuOpen ? 'Close menu' : 'Open menu'}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-nav" className={styles.mobile} aria-label="Mobile navigation">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}<Icon name="arrow" size={18} /></Link>)}</nav>}
    </header>
  </>;
}

