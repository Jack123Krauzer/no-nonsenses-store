import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedProducts, getAllCollections, formatPrice } from '@/lib/shopify-storefront';
import ProductCard from '@/components/ProductCard/ProductCard';
import Icon from '@/components/Icon';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'No–Nonsense — Good things. Nothing else.',
  description: 'Thoughtful essentials for your everyday. Discover a considered edit of accessories, audio, and things that work beautifully.',
};

export default async function HomePage() {
  const [products, collections] = await Promise.all([getFeaturedProducts(8), getAllCollections()]);
  const spotlight = products[0];
  const demo = products.some(product => product.id.includes('fallback-'));
  return <>
    <section className={`container ${styles.hero}`}>
      <div className={styles.heroCopy}>
        <span className={styles.kicker}><span/> THE EVERYDAY, RECONSIDERED</span>
        <h1>Buy less.<br/>Choose <span>better.</span></h1>
        <p>Good design. Real purpose. Nothing you don’t need.<br className={styles.desktopBreak}/> Meet the essentials that earn their place in your everyday.</p>
        <div className={styles.heroActions}><Link href="/products" className="btn btn-primary btn-lg">Discover the collection <Icon name="arrow" size={18}/></Link><span>Considered, not complicated.</span></div>
        <div className={styles.heroFoot}><div className={styles.star}>✳</div><p>For a life with<br/><strong>a little less nonsense.</strong></p><span className={styles.edition}>THE ESSENTIALS EDIT<br/>VOL. 01 — EVERY DAY</span></div>
      </div>
      {spotlight ? <Link className={styles.heroVisual} href={`/products/${spotlight.handle}`}>
        <div className={styles.visualTop}><span>OBJECTS WITH PURPOSE</span><span>01 / {String(products.length).padStart(2, '0')}</span></div>
        <div className={styles.heroImage}>{spotlight.featuredImage ? <Image src={spotlight.featuredImage.url} alt={spotlight.featuredImage.altText ?? spotlight.title} fill sizes="(max-width: 760px) 90vw, 48vw" preload className={styles.image}/> : <Icon name="box" size={100}/>}</div>
        <span className={styles.stamp}>LESS, BUT<br/><strong>BETTER.</strong><Icon name="spark" size={22}/></span>
        <div className={styles.visualBottom}><div><span className={styles.productType}>{spotlight.productType || 'The everyday essential'}</span><h2>{spotlight.title}</h2><span className={styles.heroPrice}>{formatPrice(spotlight.priceRange.minVariantPrice.amount, spotlight.priceRange.minVariantPrice.currencyCode)}</span></div><span className={styles.visualArrow}><Icon name="northeast" size={24}/></span></div>
      </Link> : <div className={styles.heroVisual}><div className={styles.blankHero}>GOOD<br/>THINGS<br/><span>AHEAD.</span></div></div>}
    </section>
    <section className={styles.principles} aria-label="Our principles"><div className="container">{[{icon:'spark' as const,title:'Thoughtfully selected',text:'Less to browse. More to love.'},{icon:'box' as const,title:'Everyday, elevated',text:'Useful things, considered well.'},{icon:'shield' as const,title:'Simply straightforward',text:'Clear choices. No unnecessary extras.'}].map(item => <div key={item.title} className={styles.principle}><Icon name={item.icon} size={22}/><p><strong>{item.title}</strong><span>{item.text}</span></p></div>)}</div></section>

    <section className="container section" aria-labelledby="featured-heading">
      <div className={styles.sectionHead}><div><span className="eyebrow">THE GOOD STUFF</span><h2 id="featured-heading">Worth making room for.</h2></div><Link href="/products" className={styles.textLink}>Shop all essentials <Icon name="arrow" size={17}/></Link></div>
      {demo && <p className={styles.demoNote}>You’re exploring our sample edit. Purchases will be available when the live collection launches.</p>}
      <div className="products-grid">{products.slice(0, 4).map(product => <ProductCard key={product.id} product={product}/>)}</div>
      {products.length === 0 && <div className="empty-state"><p>Our next edit is on its way. Check back for new essentials.</p></div>}
    </section>

    {collections.length > 0 && <section className={`container ${styles.collectionSection}`} aria-labelledby="collections-heading">
      <div className={styles.sectionHead}><div><span className="eyebrow">FIND YOUR EVERYDAY</span><h2 id="collections-heading">A place for everything.</h2></div><Link href="/collections" className={styles.textLink}>Explore collections <Icon name="arrow" size={17}/></Link></div>
      <div className="collections-grid">{collections.slice(0, 2).map((collection, index) => <Link href={`/collections/${collection.handle}`} key={collection.id} className={styles.collectionCard}>
        {collection.image && <Image src={collection.image.url} alt={collection.image.altText ?? collection.title} fill sizes="(max-width: 600px) 90vw, 46vw" className={styles.collectionImage}/>}
        <div className={styles.collectionOverlay}/><div className={styles.collectionContent}><span className="eyebrow">THE COLLECTION / 0{index + 1}</span><div><h3>{collection.title}</h3><span className={styles.collectionArrow}><Icon name="northeast" size={24}/></span></div><p>{collection.description}</p></div>
      </Link>)}</div>
    </section>}

    <section id="our-approach" className={`container ${styles.manifesto}`}><div><span className="eyebrow">THE NO–NONSENSE APPROACH</span><h2>More intention.<br/>Less everything else.</h2></div><div className={styles.manifestoRight}><Icon name="spark" size={45}/><p>We believe the things you bring into your life should have a reason to be there. So we keep our edit focused: thoughtful design, everyday utility, and things you’ll reach for again.</p><Link href="/collections" className={styles.textLink}>Find your kind of essential <Icon name="arrow" size={19}/></Link></div></section>
  </>;
}

