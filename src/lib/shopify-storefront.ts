/**
 * Shopify Storefront API client
 * Uses GraphQL to read public store data (products, collections, cart).
 * All credentials come from environment variables — nothing is hardcoded.
 */

const SHOPIFY_STORE_DOMAIN = (
  process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? ""
).trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";

const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  fresh = false
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error("Shopify Storefront is not configured.");
  }
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(SHOPIFY_STORE_DOMAIN)) {
    throw new Error("Configure a valid myshopify.com store domain.");
  }
  const res = await fetch(STOREFRONT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
  }

  const { data, errors } = await res.json();
  if (errors?.length) {
    throw new Error(
      `Shopify Storefront GraphQL errors: ${errors.map((e: { message: string }) => e.message).join(", ")}`
    );
  }
  if (!data) throw new Error("Shopify returned no storefront data.");
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
  sku: string | null;
}

export interface ShopifyProduct {
  isDemo?: boolean;
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  options: { name: string; values: string[] }[];
  seo: { title: string | null; description: string | null };
  availableForSale: boolean;
}

export interface ShopifyCollection {
  isDemo?: boolean;
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: ShopifyImage | null;
  seo: { title: string | null; description: string | null };
  products: { nodes: ShopifyProduct[] };
}

// ─── Product Queries ───────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    featuredImage { url altText width height }
    images(first: 10) {
      nodes { url altText width height }
    }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        sku
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { url altText width height }
      }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    options { name values }
    seo { title description }
  }
`;

async function getDemoProducts(): Promise<ShopifyProduct[]> {
  const { FALLBACK_PRODUCTS } = await import('./fallback-data');
  return FALLBACK_PRODUCTS.map((product) => ({ ...product, isDemo: true }));
}

async function getDemoCollections(): Promise<ShopifyCollection[]> {
  const { FALLBACK_COLLECTIONS } = await import('./fallback-data');
  return FALLBACK_COLLECTIONS.map((collection) => ({
    ...collection,
    isDemo: true,
    products: { nodes: collection.products.nodes.map((product) => ({ ...product, isDemo: true })) },
  }));
}

export async function getAllProducts(first = 24): Promise<ShopifyProduct[]> {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const FALLBACK_PRODUCTS = await getDemoProducts();
      return FALLBACK_PRODUCTS.slice(0, first);
    }
    const query = `
      ${PRODUCT_FRAGMENT}
      query GetAllProducts($first: Int!) {
        products(first: $first, sortKey: BEST_SELLING) {
          nodes { ...ProductFields }
        }
      }
    `;
    const data = await storefrontFetch<{ products: { nodes: ShopifyProduct[] } }>(
      query,
      { first }
    );
    return data.products.nodes;
  } catch (err) {
    console.warn('[Shopify Storefront] Using demo products fallback:', (err as Error).message);
    const FALLBACK_PRODUCTS = await getDemoProducts();
    return FALLBACK_PRODUCTS.slice(0, first);
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const FALLBACK_PRODUCTS = await getDemoProducts();
      return FALLBACK_PRODUCTS.find((p) => p.handle === handle) ?? null;
    }
    const query = `
      ${PRODUCT_FRAGMENT}
      query GetProduct($handle: String!) {
        product(handle: $handle) { ...ProductFields }
      }
    `;
    const data = await storefrontFetch<{ product: ShopifyProduct | null }>(query, {
      handle,
    });
    return data.product;
  } catch {
    console.warn('[Shopify Storefront] Using demo product fallback for handle:', handle);
    const FALLBACK_PRODUCTS = await getDemoProducts();
    return FALLBACK_PRODUCTS.find((p) => p.handle === handle) ?? null;
  }
}

export async function getProductsByCollection(
  collectionHandle: string,
  first = 24
): Promise<ShopifyProduct[]> {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const FALLBACK_COLLECTIONS = await getDemoCollections();
      const c = FALLBACK_COLLECTIONS.find((col) => col.handle === collectionHandle);
      return c?.products.nodes.slice(0, first) ?? [];
    }
    const query = `
      ${PRODUCT_FRAGMENT}
      query GetCollectionProducts($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) {
            nodes { ...ProductFields }
          }
        }
      }
    `;
    const data = await storefrontFetch<{
      collection: { products: { nodes: ShopifyProduct[] } } | null;
    }>(query, { handle: collectionHandle, first });
    return data.collection?.products.nodes ?? [];
  } catch {
    console.warn('[Shopify Storefront] Using demo collection products fallback:', collectionHandle);
    const FALLBACK_COLLECTIONS = await getDemoCollections();
    const c = FALLBACK_COLLECTIONS.find((col) => col.handle === collectionHandle);
    return c?.products.nodes.slice(0, first) ?? [];
  }
}

export async function getFeaturedProducts(first = 8): Promise<ShopifyProduct[]> {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const FALLBACK_PRODUCTS = await getDemoProducts();
      return FALLBACK_PRODUCTS.slice(0, first);
    }
    const query = `
      ${PRODUCT_FRAGMENT}
      query GetFeaturedProducts($first: Int!) {
        products(first: $first, sortKey: BEST_SELLING) {
          nodes { ...ProductFields }
        }
      }
    `;
    const data = await storefrontFetch<{ products: { nodes: ShopifyProduct[] } }>(query, {
      first,
    });
    return data.products.nodes;
  } catch {
    console.warn('[Shopify Storefront] Using demo featured products fallback');
    const FALLBACK_PRODUCTS = await getDemoProducts();
    return FALLBACK_PRODUCTS.slice(0, first);
  }
}

// ─── Collection Queries ────────────────────────────────────────────────────────

export async function getAllCollections(): Promise<ShopifyCollection[]> {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const FALLBACK_COLLECTIONS = await getDemoCollections();
      return FALLBACK_COLLECTIONS;
    }
    const query = `
      ${PRODUCT_FRAGMENT}
      query GetAllCollections {
        collections(first: 20, sortKey: TITLE) {
          nodes {
            id
            handle
            title
            description
            descriptionHtml
            image { url altText width height }
            seo { title description }
            products(first: 4) { nodes { ...ProductFields } }
          }
        }
      }
    `;
    const data = await storefrontFetch<{ collections: { nodes: ShopifyCollection[] } }>(
      query
    );
    return data.collections.nodes;
  } catch {
    console.warn('[Shopify Storefront] Using demo collections fallback');
    const FALLBACK_COLLECTIONS = await getDemoCollections();
    return FALLBACK_COLLECTIONS;
  }
}

export async function getCollectionByHandle(
  handle: string
): Promise<ShopifyCollection | null> {
  try {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      const FALLBACK_COLLECTIONS = await getDemoCollections();
      return FALLBACK_COLLECTIONS.find((c) => c.handle === handle) ?? null;
    }
    const query = `
      ${PRODUCT_FRAGMENT}
      query GetCollection($handle: String!) {
        collection(handle: $handle) {
          id
          handle
          title
          description
          descriptionHtml
          image { url altText width height }
          seo { title description }
          products(first: 24) {
            nodes { ...ProductFields }
          }
        }
      }
    `;
    const data = await storefrontFetch<{
      collection: ShopifyCollection | null;
    }>(query, { handle });
    return data.collection;
  } catch {
    console.warn('[Shopify Storefront] Using demo collection fallback for handle:', handle);
    const FALLBACK_COLLECTIONS = await getDemoCollections();
    return FALLBACK_COLLECTIONS.find((c) => c.handle === handle) ?? null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Always read live prices for payment; demo/catalog fallbacks must never be charged. */
export async function getCheckoutVariants(ids: string[]): Promise<Array<{
  id: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: { amount: string; currencyCode: string };
  product: { requiresSellingPlan: boolean };
} | null>> {
  const data = await storefrontFetch<{ nodes: Array<{
    id: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    price: { amount: string; currencyCode: string };
    product: { requiresSellingPlan: boolean };
  } | null> }>(`
    query CheckoutVariants($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          availableForSale
          quantityAvailable
          price { amount currencyCode }
          product { requiresSellingPlan }
        }
      }
    }
  `, { ids }, true);
  return data.nodes;
}

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(parseFloat(amount));
}

export function formatPriceInPaise(amount: string): number {
  // Razorpay expects amount in smallest currency unit (paise for INR)
  return Math.round(parseFloat(amount) * 100);
}
