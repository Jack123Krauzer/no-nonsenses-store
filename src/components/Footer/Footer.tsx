import Link from 'next/link';
import Icon from '@/components/Icon';
import styles from './Footer.module.css';

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={`container ${styles.top}`}>
      <div className={styles.brand}><Link href="/" className={styles.logo}>No–nonsense<span>®</span></Link><p>Thoughtful essentials.<br/>For the way you live, work, and move.</p></div>
      <div className={styles.links}><span className="eyebrow">Find your next good thing</span><Link href="/products">Shop all <Icon name="arrow" size={16}/></Link><Link href="/collections">Explore collections <Icon name="arrow" size={16}/></Link><Link href="/cart">Your shopping bag <Icon name="arrow" size={16}/></Link></div>
      <div className={styles.note}><Icon name="spark" size={34}/><p>A little less.<br/><strong>A whole lot better.</strong></p><span>Considered products. Clear choices.</span></div>
    </div>
    <div className={`container ${styles.bottom}`}><span>© {new Date().getFullYear()} No–Nonsense Store</span><span>Good things. Nothing else.</span><Link href="/admin">Store management <Icon name="northeast" size={12}/></Link></div>
  </footer>;
}

