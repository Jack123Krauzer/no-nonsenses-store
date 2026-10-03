import type { ShopifyProduct, ShopifyCollection } from './shopify-storefront';

export const FALLBACK_PRODUCTS: ShopifyProduct[] = [
  {
    id: 'gid://shopify/Product/fallback-1',
    handle: 'minimalist-matte-black-watch',
    title: 'Minimalist Matte Black Watch',
    description: 'A precision timepiece crafted with aerospace-grade 316L stainless steel, sapphire crystal glass, and Japanese quartz movement. Waterproof up to 5 ATM.',
    descriptionHtml: '<p>A precision timepiece crafted with aerospace-grade 316L stainless steel, sapphire crystal glass, and Japanese quartz movement. Waterproof up to 5 ATM.</p><ul><li>Case diameter: 40mm</li><li>Lug width: 20mm</li><li>Water resistance: 50m / 5 ATM</li><li>Italian leather quick-release strap</li></ul>',
    availableForSale: true,
    vendor: 'Chronos Lab',
    productType: 'Accessories',
    tags: ['featured', 'accessories', 'minimal', 'watches'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
      altText: 'Minimalist Matte Black Watch',
      width: 1000,
      height: 1000,
    },
    images: {
      nodes: [
        {
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
          altText: 'Minimalist Matte Black Watch front view',
          width: 1000,
          height: 1000,
        },
        {
          url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80',
          altText: 'Minimalist Watch wrist lifestyle',
          width: 1000,
          height: 1000,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: '6499', currencyCode: 'INR' },
      maxVariantPrice: { amount: '7499', currencyCode: 'INR' },
    },
    options: [
      { name: 'Strap Color', values: ['Midnight Black', 'Caramel Brown'] },
      { name: 'Size', values: ['40mm', '42mm'] },
    ],
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/fallback-1-v1',
          title: 'Midnight Black / 40mm',
          availableForSale: true,
          sku: 'WATCH-BLK-40',
          price: { amount: '6499', currencyCode: 'INR' },
          compareAtPrice: { amount: '7999', currencyCode: 'INR' },
          selectedOptions: [
            { name: 'Strap Color', value: 'Midnight Black' },
            { name: 'Size', value: '40mm' },
          ],
          image: {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
            altText: 'Watch Midnight Black 40mm',
            width: 1000,
            height: 1000,
          },
        },
        {
          id: 'gid://shopify/ProductVariant/fallback-1-v2',
          title: 'Caramel Brown / 42mm',
          availableForSale: true,
          sku: 'WATCH-BRN-42',
          price: { amount: '7499', currencyCode: 'INR' },
          compareAtPrice: null,
          selectedOptions: [
            { name: 'Strap Color', value: 'Caramel Brown' },
            { name: 'Size', value: '42mm' },
          ],
          image: {
            url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80',
            altText: 'Watch Caramel Brown 42mm',
            width: 1000,
            height: 1000,
          },
        },
      ],
    },
    seo: {
      title: 'Minimalist Matte Black Watch | No-Nonsense Store',
      description: 'Aerospace-grade 316L stainless steel watch with sapphire crystal and Japanese movement.',
    },
  },
  {
    id: 'gid://shopify/Product/fallback-2',
    handle: 'noise-cancelling-wireless-headphones',
    title: 'Studio Pro ANC Wireless Headphones',
    description: 'Immersive sound powered by custom 40mm beryllium drivers, active hybrid noise cancellation, and up to 45 hours of high-fidelity playback on a single charge.',
    descriptionHtml: '<p>Immersive sound powered by custom 40mm beryllium drivers, active hybrid noise cancellation, and up to 45 hours of high-fidelity playback.</p>',
    availableForSale: true,
    vendor: 'Acoustic Labs',
    productType: 'Audio',
    tags: ['featured', 'audio', 'electronics'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
      altText: 'Studio Pro ANC Headphones',
      width: 1000,
      height: 1000,
    },
    images: {
      nodes: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
          altText: 'Studio Pro Headphones',
          width: 1000,
          height: 1000,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: '12999', currencyCode: 'INR' },
      maxVariantPrice: { amount: '12999', currencyCode: 'INR' },
    },
    options: [{ name: 'Color', values: ['Matte Black', 'Silver Frost'] }],
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/fallback-2-v1',
          title: 'Matte Black',
          availableForSale: true,
          sku: 'HP-BLK-01',
          price: { amount: '12999', currencyCode: 'INR' },
          compareAtPrice: { amount: '15999', currencyCode: 'INR' },
          selectedOptions: [{ name: 'Color', value: 'Matte Black' }],
          image: {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
            altText: 'Headphones Matte Black',
            width: 1000,
            height: 1000,
          },
        },
      ],
    },
    seo: {
      title: 'Studio Pro ANC Wireless Headphones | No-Nonsense Store',
      description: 'Hybrid noise cancelling wireless headphones with 45h battery life.',
    },
  },
  {
    id: 'gid://shopify/Product/fallback-3',
    handle: 'full-grain-leather-everyday-backpack',
    title: 'Full-Grain Leather Everyday Backpack',
    description: 'Handcrafted vegetable-tanned full-grain leather backpack designed to age with a rich patina. Features padded 16-inch laptop compartment and YKK brass zippers.',
    descriptionHtml: '<p>Handcrafted vegetable-tanned full-grain leather backpack designed to age with a rich patina.</p>',
    availableForSale: true,
    vendor: 'Atelier Leather',
    productType: 'Bags',
    tags: ['featured', 'bags', 'leather'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80',
      altText: 'Full Grain Leather Backpack',
      width: 1000,
      height: 1000,
    },
    images: {
      nodes: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80',
          altText: 'Full Grain Leather Backpack',
          width: 1000,
          height: 1000,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: '8999', currencyCode: 'INR' },
      maxVariantPrice: { amount: '8999', currencyCode: 'INR' },
    },
    options: [{ name: 'Color', values: ['Cognac Tan', 'Dark Espresso'] }],
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/fallback-3-v1',
          title: 'Cognac Tan',
          availableForSale: true,
          sku: 'BP-COG-01',
          price: { amount: '8999', currencyCode: 'INR' },
          compareAtPrice: { amount: '10999', currencyCode: 'INR' },
          selectedOptions: [{ name: 'Color', value: 'Cognac Tan' }],
          image: {
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80',
            altText: 'Backpack Cognac Tan',
            width: 1000,
            height: 1000,
          },
        },
      ],
    },
    seo: {
      title: 'Full-Grain Leather Everyday Backpack | No-Nonsense Store',
      description: 'Handcrafted vegetable-tanned full-grain leather backpack with laptop compartment.',
    },
  },
  {
    id: 'gid://shopify/Product/fallback-4',
    handle: 'mechanical-keyboard-custom-switches',
    title: 'Tactile Mechanical Keyboard 75%',
    description: 'CNC anodized aluminum body, hot-swappable tactile switches, per-key RGB backlighting, and south-facing LEDs with PBT dye-sub keycaps.',
    descriptionHtml: '<p>CNC anodized aluminum body, hot-swappable tactile switches, and PBT dye-sub keycaps.</p>',
    availableForSale: true,
    vendor: 'KeebCraft',
    productType: 'Peripherals',
    tags: ['featured', 'workspace', 'keyboards'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80',
      altText: 'Tactile Mechanical Keyboard',
      width: 1000,
      height: 1000,
    },
    images: {
      nodes: [
        {
          url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80',
          altText: 'Tactile Mechanical Keyboard',
          width: 1000,
          height: 1000,
        },
      ],
    },
    priceRange: {
      minVariantPrice: { amount: '7999', currencyCode: 'INR' },
      maxVariantPrice: { amount: '8499', currencyCode: 'INR' },
    },
    options: [{ name: 'Switch Type', values: ['Tactile Brown', 'Linear Red'] }],
    variants: {
      nodes: [
        {
          id: 'gid://shopify/ProductVariant/fallback-4-v1',
          title: 'Tactile Brown',
          availableForSale: true,
          sku: 'KB-TAC-BRN',
          price: { amount: '7999', currencyCode: 'INR' },
          compareAtPrice: { amount: '9499', currencyCode: 'INR' },
          selectedOptions: [{ name: 'Switch Type', value: 'Tactile Brown' }],
          image: {
            url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=80',
            altText: 'Tactile Mechanical Keyboard Brown',
            width: 1000,
            height: 1000,
          },
        },
      ],
    },
    seo: {
      title: 'Tactile Mechanical Keyboard 75% | No-Nonsense Store',
      description: 'Hot-swappable 75% mechanical keyboard with CNC aluminum frame.',
    },
  },
];

export const FALLBACK_COLLECTIONS: ShopifyCollection[] = [
  {
    id: 'gid://shopify/Collection/fallback-c1',
    handle: 'featured-products',
    title: 'Featured Collection',
    description: 'Curated essentials hand-picked for quality, utility, and timeless design.',
    descriptionHtml: '<p>Curated essentials hand-picked for quality, utility, and timeless design.</p>',
    image: {
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      altText: 'Featured Collection',
      width: 1200,
      height: 800,
    },
    seo: {
      title: 'Featured Collection | No-Nonsense Store',
      description: 'Curated essentials hand-picked for quality and utility.',
    },
    products: {
      nodes: FALLBACK_PRODUCTS.slice(0, 4),
    },
  },
  {
    id: 'gid://shopify/Collection/fallback-c2',
    handle: 'workspace-essentials',
    title: 'Workspace Essentials',
    description: 'Elevate your desk setup with precision-engineered peripherals and leather goods.',
    descriptionHtml: '<p>Elevate your desk setup with precision-engineered peripherals and leather goods.</p>',
    image: {
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      altText: 'Workspace Essentials',
      width: 1200,
      height: 800,
    },
    seo: {
      title: 'Workspace Essentials | No-Nonsense Store',
      description: 'Tools and accessories designed for focused productivity.',
    },
    products: {
      nodes: [FALLBACK_PRODUCTS[1], FALLBACK_PRODUCTS[3]],
    },
  },
];
