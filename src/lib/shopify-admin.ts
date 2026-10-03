/**
 * Shopify Admin API client (server-only)
 * Used by the admin panel to create/read/update/delete products and manage inventory.
 * This module uses 'server-only' — it cannot be imported in Client Components.
 */
import "server-only";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-04";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
  console.warn(
    "[Shopify Admin] Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN environment variables."
  );
}

const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(ADMIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store", // Admin data must always be fresh
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API error: ${res.status} ${res.statusText}`);
  }

  const { data, errors } = await res.json();
  if (errors?.length) {
    throw new Error(
      `Shopify Admin GraphQL errors: ${errors.map((e: { message: string }) => e.message).join(", ")}`
    );
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProductInput {
  title: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  variants?: AdminVariantInput[];
  images?: { src: string; altText?: string }[];
  seo?: { title?: string; description?: string };
}

export interface AdminVariantInput {
  id?: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity?: number;
  title?: string;
  options?: string[];
  inventoryManagement?: string;
  inventoryPolicy?: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  productType: string;
  vendor: string;
  tags: string[];
  descriptionHtml: string;
  variants: { nodes: AdminVariant[] };
  featuredImage: { url: string; altText: string | null } | null;
  totalInventory: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  sku: string | null;
  inventoryQuantity: number;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  inventoryItem: { id: string };
}

export interface AdminCollection {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  productsCount: { count: number };
  image: { url: string; altText: string | null } | null;
  updatedAt: string;
}

export interface AdminLocation {
  id: string;
  name: string;
  isActive: boolean;
}

// ─── Product Queries ───────────────────────────────────────────────────────────

const ADMIN_PRODUCT_FRAGMENT = `
  fragment AdminProductFields on Product {
    id
    title
    handle
    status
    productType
    vendor
    tags
    descriptionHtml
    totalInventory
    createdAt
    updatedAt
    featuredImage { url altText }
    variants(first: 50) {
      nodes {
        id
        title
        price
        compareAtPrice
        sku
        inventoryQuantity
        availableForSale
        selectedOptions { name value }
        inventoryItem { id }
      }
    }
  }
`;

export async function adminGetProducts(first = 50): Promise<AdminProduct[]> {
  const query = `
    ${ADMIN_PRODUCT_FRAGMENT}
    query GetAdminProducts($first: Int!) {
      products(first: $first, sortKey: UPDATED_AT, reverse: true) {
        nodes { ...AdminProductFields }
      }
    }
  `;
  const data = await adminFetch<{ products: { nodes: AdminProduct[] } }>(query, {
    first,
  });
  return data.products.nodes;
}

export async function adminGetProduct(id: string): Promise<AdminProduct | null> {
  const query = `
    ${ADMIN_PRODUCT_FRAGMENT}
    query GetAdminProduct($id: ID!) {
      product(id: $id) { ...AdminProductFields }
    }
  `;
  const data = await adminFetch<{ product: AdminProduct | null }>(query, { id });
  return data.product;
}

export async function adminCreateProduct(
  input: AdminProductInput
): Promise<{ product: AdminProduct; userErrors: { field: string[]; message: string }[] }> {
  const mutation = `
    ${ADMIN_PRODUCT_FRAGMENT}
    mutation CreateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product { ...AdminProductFields }
        userErrors { field message }
      }
    }
  `;
  const data = await adminFetch<{
    productCreate: {
      product: AdminProduct;
      userErrors: { field: string[]; message: string }[];
    };
  }>(mutation, { input });
  return data.productCreate;
}

export async function adminUpdateProduct(
  id: string,
  input: Partial<AdminProductInput>
): Promise<{ product: AdminProduct; userErrors: { field: string[]; message: string }[] }> {
  const mutation = `
    ${ADMIN_PRODUCT_FRAGMENT}
    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product { ...AdminProductFields }
        userErrors { field message }
      }
    }
  `;
  const data = await adminFetch<{
    productUpdate: {
      product: AdminProduct;
      userErrors: { field: string[]; message: string }[];
    };
  }>(mutation, { input: { id, ...input } });
  return data.productUpdate;
}

export async function adminDeleteProduct(
  id: string
): Promise<{ deletedProductId: string | null; userErrors: { field: string[]; message: string }[] }> {
  const mutation = `
    mutation DeleteProduct($id: ID!) {
      productDelete(input: { id: $id }) {
        deletedProductId
        userErrors { field message }
      }
    }
  `;
  const data = await adminFetch<{
    productDelete: {
      deletedProductId: string | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(mutation, { id });
  return data.productDelete;
}

// ─── Inventory ─────────────────────────────────────────────────────────────────

export async function adminGetInventoryLevels(
  locationId: string,
  first = 50
): Promise<
  {
    inventoryItemId: string;
    sku: string | null;
    productTitle: string;
    variantTitle: string;
    available: number;
    updatedAt: string;
  }[]
> {
  // Get inventory levels for a specific location
  const query = `
    query GetInventoryLevels($locationId: ID!, $first: Int!) {
      location(id: $locationId) {
        inventoryLevels(first: $first) {
          nodes {
            available
            updatedAt
            item {
              id
              sku
              variant {
                title
                product { title }
              }
            }
          }
        }
      }
    }
  `;
  const data = await adminFetch<{
    location: {
      inventoryLevels: {
        nodes: {
          available: number;
          updatedAt: string;
          item: {
            id: string;
            sku: string | null;
            variant: { title: string; product: { title: string } };
          };
        }[];
      };
    } | null;
  }>(query, { locationId, first });

  return (
    data.location?.inventoryLevels.nodes.map((node) => ({
      inventoryItemId: node.item.id,
      sku: node.item.sku,
      productTitle: node.item.variant.product.title,
      variantTitle: node.item.variant.title,
      available: node.available,
      updatedAt: node.updatedAt,
    })) ?? []
  );
}

export async function adminGetLocations(): Promise<
  { id: string; name: string; isActive: boolean }[]
> {
  const query = `
    query GetLocations {
      locations(first: 20) {
        nodes { id name isActive }
      }
    }
  `;
  const data = await adminFetch<{
    locations: { nodes: { id: string; name: string; isActive: boolean }[] };
  }>(query);
  return data.locations.nodes;
}

export async function adminAdjustInventory(
  inventoryItemId: string,
  locationId: string,
  delta: number
): Promise<{ userErrors: { field: string[]; message: string }[] }> {
  const mutation = `
    mutation AdjustInventory($input: InventoryAdjustQuantitiesInput!) {
      inventoryAdjustQuantities(input: $input) {
        inventoryAdjustmentGroup {
          reason
        }
        userErrors { field message }
      }
    }
  `;
  const data = await adminFetch<{
    inventoryAdjustQuantities: {
      userErrors: { field: string[]; message: string }[];
    };
  }>(mutation, {
    input: {
      reason: "correction",
      name: "available",
      changes: [
        {
          inventoryItemId,
          locationId,
          delta,
        },
      ],
    },
  });
  return data.inventoryAdjustQuantities;
}

// ─── Collections ───────────────────────────────────────────────────────────────

export async function adminGetCollections(first = 20): Promise<AdminCollection[]> {
  const query = `
    query GetAdminCollections($first: Int!) {
      collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
        nodes {
          id
          title
          handle
          descriptionHtml
          updatedAt
          productsCount { count }
          image { url altText }
        }
      }
    }
  `;
  const data = await adminFetch<{ collections: { nodes: AdminCollection[] } }>(query, {
    first,
  });
  return data.collections.nodes;
}

export async function adminCreateCollection(input: {
  title: string;
  descriptionHtml?: string;
}): Promise<{ collection: AdminCollection; userErrors: { field: string[]; message: string }[] }> {
  const mutation = `
    mutation CreateCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id title handle descriptionHtml updatedAt
          productsCount { count }
          image { url altText }
        }
        userErrors { field message }
      }
    }
  `;
  const data = await adminFetch<{
    collectionCreate: {
      collection: AdminCollection;
      userErrors: { field: string[]; message: string }[];
    };
  }>(mutation, { input });
  return data.collectionCreate;
}

export async function adminDeleteCollection(
  id: string
): Promise<{ deletedCollectionId: string | null; userErrors: { field: string[]; message: string }[] }> {
  const mutation = `
    mutation DeleteCollection($input: CollectionDeleteInput!) {
      collectionDelete(input: $input) {
        deletedCollectionId
        userErrors { field message }
      }
    }
  `;
  const data = await adminFetch<{
    collectionDelete: {
      deletedCollectionId: string | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(mutation, { input: { id } });
  return data.collectionDelete;
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export async function adminGetDashboardStats(): Promise<{
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalCollections: number;
  outOfStock: number;
}> {
  const query = `
    query DashboardStats {
      allProducts: products(first: 1) { pageInfo { hasNextPage } }
      activeProducts: products(first: 1, query: "status:active") { pageInfo { hasNextPage } }
      draftProducts: products(first: 1, query: "status:draft") { pageInfo { hasNextPage } }
      outOfStock: products(first: 1, query: "inventory_total:0") { pageInfo { hasNextPage } }
      totalCollections: collections(first: 1) { pageInfo { hasNextPage } }
    }
  `;

  // For accurate counts we use the count query approach
  const countQuery = `
    query DashboardCounts {
      products: productsCount { count }
      activeProducts: productsCount(query: "status:active") { count }
      draftProducts: productsCount(query: "status:draft") { count }
      outOfStock: productsCount(query: "inventory_total:0") { count }
      collections: collectionsCount { count }
    }
  `;
  try {
    const data = await adminFetch<{
      products: { count: number };
      activeProducts: { count: number };
      draftProducts: { count: number };
      outOfStock: { count: number };
      collections: { count: number };
    }>(countQuery);
    return {
      totalProducts: data.products.count,
      activeProducts: data.activeProducts.count,
      draftProducts: data.draftProducts.count,
      totalCollections: data.collections.count,
      outOfStock: data.outOfStock.count,
    };
  } catch {
    // Fallback if count API not available
    void query; // suppress unused variable warning
    return { totalProducts: 0, activeProducts: 0, draftProducts: 0, totalCollections: 0, outOfStock: 0 };
  }
}
