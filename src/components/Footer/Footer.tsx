import Link from "next/link";
import Icon from "@/components/Icon";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            no nonsenses<span>™</span>
          </Link>
          <p>
            Wear your inside voice.
            <br />A little attitude. A lot of you.
          </p>
        </div>
        <div className={styles.links}>
          <span className="eyebrow">FIND YOUR KIND OF NONSENSE</span>
          <Link href="/products">
            Shop all <Icon name="arrow" size={16} />
          </Link>
          <Link href="/collections">
            Explore collections <Icon name="arrow" size={16} />
          </Link>
          <Link href="/cart">
            Your shopping bag <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className={styles.note}>
          <Icon name="spark" size={34} />
          <p>
            Less pretending.
            <br />
            <strong>More personality.</strong>
          </p>
          <span>Life is serious. Your tee doesn’t have to be.</span>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} No Nonsenses</span>
        <span>nononsenses.com · WEAR WHAT YOU THINK.</span>
        <Link href="/admin">
          Store management <Icon name="northeast" size={12} />
        </Link>
      </div>
    </footer>
  );
}
