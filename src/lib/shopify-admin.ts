/**
 * Shopify Admin API client (server-only)
 *
 * Used by the admin panel to:
 * - Create/read/update/delete products
 * - Manage product variants
 * - Manage product media
 * - Manage inventory
 * - Manage collections
 * - Fetch dashboard statistics
 *
 * This module uses "server-only" and therefore cannot
 * be imported inside Client Components.
 */

import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ?? "2025-04";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
  console.warn(
    "[Shopify Admin] Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN environment variables."
  );
}

const ADMIN_API_URL = SHOPIFY_STORE_DOMAIN
  ? `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
  : "";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminUserError {
  field: string[];
  message: string;
}

export type AdminProductStatus =
  | "ACTIVE"
  | "DRAFT"
  | "ARCHIVED";

export type AdminInventoryPolicy =
  | "DENY"
  | "CONTINUE";

export type AdminWeightUnit =
  | "GRAMS"
  | "KILOGRAMS"
  | "OUNCES"
  | "POUNDS";

export type AdminMediaType =
  | "IMAGE"
  | "VIDEO"
  | "EXTERNAL_VIDEO"
  | "MODEL_3D";

export interface AdminProductInput {
  // ─── Product ─────────────────────────────

  title: string;

  descriptionHtml?: string;

  status?: AdminProductStatus;

  handle?: string;

  // ─── Organization ────────────────────────

  categoryId?: string;

  productType?: string;

  vendor?: string;

  tags?: string[];

  collectionIds?: string[];

  // ─── Publishing ──────────────────────────

  publicationIds?: string[];

  // ─── Media ───────────────────────────────

  media?: AdminMediaInput[];

  /**
   * Backwards compatibility with your
   * current frontend.
   */
  images?: {
    src: string;
    altText?: string;
  }[];

  // ─── Product Options ─────────────────────

  options?: AdminProductOptionInput[];

  // ─── Variants ────────────────────────────

  variants?: AdminVariantInput[];

  // ─── SEO ─────────────────────────────────

  seo?: {
    title?: string;
    description?: string;
  };

  // ─── Metafields ──────────────────────────

  metafields?: AdminMetafieldInput[];
}

export interface AdminProductOptionInput {
  name: string;

  values: string[];
}

export interface AdminMediaInput {
  type: AdminMediaType;

  src: string;

  altText?: string;
}

export interface AdminVariantInput {
  id?: string;

  // Pricing
  price: string;

  compareAtPrice?: string;

  taxable?: boolean;

  // Inventory
  sku?: string;

  barcode?: string;

  tracked?: boolean;

  inventoryPolicy?: AdminInventoryPolicy;

  inventoryQuantities?: AdminInventoryQuantityInput[];

  /**
   * Keep this temporarily for your current UI.
   * Prefer inventoryQuantities going forward.
   */
  inventoryQuantity?: number;

  // Shipping
  requiresShipping?: boolean;

  weight?: number;

  weightUnit?: AdminWeightUnit;

  // Customs
  countryCodeOfOrigin?: string;

  harmonizedSystemCode?: string;

  // Cost
  cost?: string;

  // Variant options
  optionValues?: {
    optionName: string;
    value: string;
  }[];
}

export interface AdminInventoryQuantityInput {
  locationId: string;

  quantity: number;
}

export interface AdminMetafieldInput {
  namespace: string;

  key: string;

  type: string;

  value: string;
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

  totalInventory: number;

  createdAt: string;

  updatedAt: string;

  category?: {
    id: string;
    name: string;
    fullName?: string;
  } | null;

  seo?: {
    title: string | null;
    description: string | null;
  };

  featuredImage: {
    url: string;
    altText: string | null;
  } | null;

  media?: {
    nodes: {
      id: string;
      alt: string | null;
      mediaContentType: string;
    }[];
  };
  variants: {
    nodes: AdminVariant[];
  };
}

export interface AdminVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  sku: string | null;
  barcode?: string | null;
  inventoryQuantity: number;
  inventoryPolicy?: string;
  taxable?: boolean;
  availableForSale: boolean;

  selectedOptions: {
    name: string;
    value: string;
  }[];

  inventoryItem: {
    id: string;

    tracked?: boolean;

    unitCost?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
}

export interface AdminCollection {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;

  productsCount: {
    count: number;
  };

  image: {
    url: string;
    altText: string | null;
  } | null;

  updatedAt: string;
}

export interface AdminLocation {
  id: string;
  name: string;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL Client
// ─────────────────────────────────────────────────────────────────────────────

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN) {
    throw new Error(
      "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not configured."
    );
  }

  if (!SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error(
      "SHOPIFY_ADMIN_ACCESS_TOKEN is not configured."
    );
  }

  const res = await fetch(ADMIN_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token":
        SHOPIFY_ADMIN_ACCESS_TOKEN,
    },

    body: JSON.stringify({
      query,
      variables,
    }),

    cache: "no-store",
  });

  const raw = await res.text();

  if (!res.ok) {
    throw new Error(
      `Shopify Admin API error: ${res.status} ${res.statusText}. ${raw}`
    );
  }

  let json: {
    data?: T;
    errors?: {
      message: string;
    }[];
  };

  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(
      `Shopify Admin API returned invalid JSON: ${raw}`
    );
  }

  if (json.errors?.length) {
    throw new Error(
      `Shopify Admin GraphQL errors: ${json.errors
        .map((error) => error.message)
        .join(", ")}`
    );
  }

  if (!json.data) {
    throw new Error(
      "Shopify Admin API returned no data."
    );
  }

  return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Fragment
// ─────────────────────────────────────────────────────────────────────────────

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

    category {
      id
      name
      fullName
    }

    seo {
      title
      description
    }

    featuredImage {
      url
      altText
    }

    media(first: 50) {
      nodes {
        id
        alt
        mediaContentType
      }
    }

    variants(first: 100) {
      nodes {
        id
        title
        price
        compareAtPrice
        sku
        barcode
        inventoryQuantity
        inventoryPolicy
        taxable
        availableForSale

        selectedOptions {
          name
          value
        }

        inventoryItem {
          id
          tracked

          unitCost {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Product Queries
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetProducts(
  first = 50
): Promise<AdminProduct[]> {
  const query = `
    ${ADMIN_PRODUCT_FRAGMENT}

    query GetAdminProducts($first: Int!) {
      products(
        first: $first
        sortKey: UPDATED_AT
        reverse: true
      ) {
        nodes {
          ...AdminProductFields
        }
      }
    }
  `;

  const data = await adminFetch<{
    products: {
      nodes: AdminProduct[];
    };
  }>(query, {
    first,
  });

  return data.products.nodes;
}

export async function adminGetProduct(
  id: string
): Promise<AdminProduct | null> {
  const query = `
    ${ADMIN_PRODUCT_FRAGMENT}

    query GetAdminProduct($id: ID!) {
      product(id: $id) {
        ...AdminProductFields
      }
    }
  `;

  const data = await adminFetch<{
    product: AdminProduct | null;
  }>(query, {
    id,
  });

  return data.product;
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Product
// ─────────────────────────────────────────────────────────────────────────────

export async function adminCreateProduct(
  input: AdminProductInput
): Promise<{
  product: AdminProduct;
  userErrors: AdminUserError[];
}> {
  const {
    variants = [],
    images = [],
    media = [],
    publicationIds = [],
    options = [],
    ...productData
  } = input;

  // Convert old images[] format into media[]
  const normalizedMedia: AdminMediaInput[] = [
    ...media,

    ...images.map((image) => ({
      type: "IMAGE" as const,
      src: image.src,
      altText: image.altText,
    })),
  ];

  // Product fields only.
  // DO NOT put variants/images into ProductCreateInput.
  const productInput: Record<string, unknown> = {
    title: productData.title,

    ...(productData.descriptionHtml !== undefined && {
      descriptionHtml:
        productData.descriptionHtml,
    }),

    ...(productData.status && {
      status:
        productData.status,
    }),

    ...(productData.handle && {
      handle:
        productData.handle,
    }),

    ...(productData.productType && {
      productType:
        productData.productType,
    }),

    ...(productData.vendor && {
      vendor:
        productData.vendor,
    }),

    ...(productData.tags && {
      tags:
        productData.tags,
    }),

    ...(productData.categoryId && {
      category:
        productData.categoryId,
    }),

    ...(productData.collectionIds && {
      collectionsToJoin:
        productData.collectionIds,
    }),

    ...(productData.seo && {
      seo: {
        ...(productData.seo.title !== undefined && {
          title:
            productData.seo.title,
        }),

        ...(productData.seo.description !== undefined && {
          description:
            productData.seo.description,
        }),
      },
    }),

    ...(productData.metafields && {
      metafields:
        productData.metafields,
    }),

    ...(options.length > 0 && {
      productOptions:
        options.map((option) => ({
          name:
            option.name,

          values:
            option.values.map((value) => ({
              name:
                value,
            })),
        })),
    }),
  };

  const mediaInput = normalizeShopifyMedia(
    normalizedMedia
  );

  const mutation = `
    ${ADMIN_PRODUCT_FRAGMENT}

    mutation CreateProduct(
      $product: ProductCreateInput!
      $media: [CreateMediaInput!]
    ) {
      productCreate(
        product: $product
        media: $media
      ) {
        product {
          ...AdminProductFields
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    productCreate: {
      product: AdminProduct | null;
      userErrors: AdminUserError[];
    };
  }>(mutation, {
    product: productInput,
    media: mediaInput,
  });

  if (
    data.productCreate.userErrors.length >
    0
  ) {
    return {
      product:
        data.productCreate
          .product as AdminProduct,

      userErrors:
        data.productCreate.userErrors,
    };
  }

  if (!data.productCreate.product) {
    throw new Error(
      "Shopify created no product."
    );
  }

  let product =
    data.productCreate.product;

  // ─────────────────────────────────────────
  // Configure variants
  // ─────────────────────────────────────────

  if (variants.length > 0) {
    /*
     * ProductCreate creates an initial/default
     * variant.
     *
     * If we're dealing with a simple product,
     * update that variant.
     */

    if (
      variants.length === 1 &&
      options.length === 0
    ) {
      const defaultVariant =
        product.variants.nodes[0];

      if (defaultVariant) {
        const variantResult =
          await adminUpdateVariant(
            product.id,
            defaultVariant.id,
            variants[0]
          );

        if (
          variantResult.userErrors.length
        ) {
          return {
            product,
            userErrors:
              variantResult.userErrors,
          };
        }

        await applyVariantInventory(
          product.id,
          defaultVariant.id,
          variants[0]
        );
      }
    } else {
      /*
       * Products with Size/Color/etc need
       * actual Shopify variants.
       */

      const variantResult =
        await adminCreateVariants(
          product.id,
          variants
        );

      if (
        variantResult.userErrors.length
      ) {
        return {
          product,
          userErrors:
            variantResult.userErrors,
        };
      }

      product =
        (await adminGetProduct(
          product.id
        )) ?? product;

      for (
        let index = 0;
        index < variants.length;
        index++
      ) {
        const createdVariant =
          product.variants.nodes[index];

        if (!createdVariant) {
          continue;
        }

        await applyVariantInventory(
          product.id,
          createdVariant.id,
          variants[index]
        );
      }
    }
  }

  // ─────────────────────────────────────────
  // Publishing
  // ─────────────────────────────────────────

  if (publicationIds.length > 0) {
    const publishResult =
      await adminPublishProduct(
        product.id,
        publicationIds
      );

    if (
      publishResult.userErrors.length
    ) {
      return {
        product,
        userErrors:
          publishResult.userErrors,
      };
    }
  }

  const refreshed =
    await adminGetProduct(product.id);

  return {
    product:
      refreshed ?? product,

    userErrors: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Product
// ─────────────────────────────────────────────────────────────────────────────

export async function adminUpdateProduct(
  id: string,
  input: Partial<AdminProductInput>
): Promise<{
  product: AdminProduct;
  userErrors: AdminUserError[];
}> {
  const {
    variants,
    images,
    seo,
    ...productFields
  } = input;

  // ─────────────────────────────────────────────
  // Step 1: Update basic product information
  // ─────────────────────────────────────────────

  const mutation = `
    ${ADMIN_PRODUCT_FRAGMENT}

    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          ...AdminProductFields
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const productInput = {
    id,
    ...productFields,

    ...(seo &&
      (seo.title !== undefined ||
        seo.description !== undefined)
      ? {
        seo: {
          ...(seo.title !== undefined
            ? {
              title: seo.title,
            }
            : {}),

          ...(seo.description !== undefined
            ? {
              description:
                seo.description,
            }
            : {}),
        },
      }
      : {}),
  };

  const data = await adminFetch<{
    productUpdate: {
      product: AdminProduct | null;
      userErrors: AdminUserError[];
    };
  }>(mutation, {
    input: productInput,
  });

  const {
    product,
    userErrors,
  } = data.productUpdate;

  if (userErrors.length > 0) {
    return {
      product: product as AdminProduct,
      userErrors,
    };
  }

  if (!product) {
    throw new Error(
      "Shopify productUpdate completed without returning a product."
    );
  }

  // ─────────────────────────────────────────────
  // Step 2: Update variants
  // ─────────────────────────────────────────────

  if (variants?.length) {
    for (const variant of variants) {
      /*
       * Existing variant
       */
      if (variant.id) {
        const variantResult =
          await adminUpdateVariant(
            product.id,
            variant.id,
            variant
          );

        if (
          variantResult.userErrors.length >
          0
        ) {
          return {
            product,
            userErrors:
              variantResult.userErrors,
          };
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  // Step 3: Add new images
  // ─────────────────────────────────────────────

  if (images?.length) {
    const mediaResult =
      await adminAttachProductImages(
        product.id,
        images
      );

    if (
      mediaResult.userErrors.length > 0
    ) {
      return {
        product,
        userErrors:
          mediaResult.userErrors,
      };
    }
  }

  // ─────────────────────────────────────────────
  // Step 4: Return fresh product
  // ─────────────────────────────────────────────

  const refreshedProduct =
    await adminGetProduct(id);

  return {
    product:
      refreshedProduct ?? product,

    userErrors: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Product
// ─────────────────────────────────────────────────────────────────────────────

export async function adminDeleteProduct(
  id: string
): Promise<{
  deletedProductId: string | null;
  userErrors: AdminUserError[];
}> {
  const mutation = `
    mutation DeleteProduct($id: ID!) {
      productDelete(input: { id: $id }) {
        deletedProductId

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    productDelete: {
      deletedProductId:
      | string
      | null;

      userErrors:
      AdminUserError[];
    };
  }>(mutation, {
    id,
  });

  return data.productDelete;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Management
// ─────────────────────────────────────────────────────────────────────────────

async function adminUpdateVariant(
  productId: string,
  variantId: string,
  input: AdminVariantInput
): Promise<{
  userErrors: AdminUserError[];
}> {
  const mutation = `
    mutation UpdateProductVariants(
      $productId: ID!
      $variants: [ProductVariantsBulkInput!]!
    ) {
      productVariantsBulkUpdate(
        productId: $productId
        variants: $variants
      ) {
        productVariants {
          id
          title
          price
          compareAtPrice
          sku
          barcode
          inventoryQuantity
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const hasInventoryQuantity = input.inventoryQuantity !== undefined || 
  (input.inventoryQuantities?.length ?? 0) > 0;

  const shouldTrackInventory = input.tracked ?? hasInventoryQuantity;

  const variant = {
  id: variantId,

  price: input.price,

  ...(input.compareAtPrice !== undefined && {
    compareAtPrice:
      input.compareAtPrice || null,
  }),

  ...(input.barcode !== undefined && {
    barcode:
      input.barcode || null,
  }),

  ...(input.taxable !== undefined && {
    taxable:
      input.taxable,
  }),

  ...(input.inventoryPolicy && {
    inventoryPolicy:
      input.inventoryPolicy,
  }),

  inventoryItem: {
    ...(input.sku !== undefined && {
      sku:
        input.sku || null,
    }),

    tracked:
      shouldTrackInventory,

    ...(input.cost !== undefined && {
      cost:
        input.cost,
    }),

    ...(input.requiresShipping !== undefined && {
      requiresShipping:
        input.requiresShipping,
    }),

    ...(input.countryCodeOfOrigin && {
      countryCodeOfOrigin:
        input.countryCodeOfOrigin,
    }),

    ...(input.harmonizedSystemCode && {
      harmonizedSystemCode:
        input.harmonizedSystemCode,
    }),

    ...(input.weight !== undefined && {
      measurement: {
        weight: {
          value:
            input.weight,

          unit:
            input.weightUnit ??
            "KILOGRAMS",
        },
      },
    }),
  },
};

  const data = await adminFetch<{
    productVariantsBulkUpdate: {
      userErrors: AdminUserError[];
    };
  }>(mutation, {
    productId,

    variants: [
      variant,
    ],
  });

  return {
    userErrors:
      data.productVariantsBulkUpdate
        .userErrors,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Images / Media
// ─────────────────────────────────────────────────────────────────────────────

async function adminAttachProductImages(
  productId: string,
  images: {
    src: string;
    altText?: string;
  }[]
): Promise<{
  userErrors: AdminUserError[];
}> {
  if (images.length === 0) {
    return {
      userErrors: [],
    };
  }

  /*
   * Shopify cannot simply fetch a browser-generated
   * data:image/... Base64 URL as remote media.
   *
   * Base64 uploads need Shopify stagedUploadsCreate.
   */

  const base64Images =
    images.filter((image) =>
      image.src.startsWith("data:")
    );

  if (base64Images.length > 0) {
    return {
      userErrors: [
        {
          field: ["images"],
          message:
            "Base64 product images require Shopify staged uploads. Upload the image first or provide a publicly accessible HTTPS image URL.",
        },
      ],
    };
  }

  const invalidImages =
    images.filter(
      (image) =>
        !image.src.startsWith("https://")
    );

  if (invalidImages.length > 0) {
    return {
      userErrors: [
        {
          field: ["images"],
          message:
            "Product image URLs must use HTTPS.",
        },
      ],
    };
  }

  const mutation = `
    mutation CreateProductMedia(
      $productId: ID!
      $media: [CreateMediaInput!]!
    ) {
      productCreateMedia(
        productId: $productId
        media: $media
      ) {
        media {
          id
          alt

          mediaContentType
        }

        mediaUserErrors {
          field
          message
        }
      }
    }
  `;

  const media = images.map(
    (image) => ({
      originalSource: image.src,

      mediaContentType: "IMAGE",

      ...(image.altText
        ? {
          alt:
            image.altText,
        }
        : {}),
    })
  );

  const data = await adminFetch<{
    productCreateMedia: {
      media: {
        id: string;
        alt: string | null;
        mediaContentType: string;
      }[];

      mediaUserErrors: AdminUserError[];
    };
  }>(mutation, {
    productId,
    media,
  });

  return {
    userErrors:
      data.productCreateMedia
        .mediaUserErrors,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────────────────────────────────────

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
  const query = `
    query GetInventoryLevels(
      $locationId: ID!
      $first: Int!
    ) {
      location(id: $locationId) {
        inventoryLevels(
          first: $first
        ) {
          nodes {
            available
            updatedAt

            item {
              id
              sku

              variant {
                title

                product {
                  title
                }
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

            variant: {
              title: string;

              product: {
                title: string;
              };
            };
          };
        }[];
      };
    } | null;
  }>(query, {
    locationId,
    first,
  });

  return (
    data.location?.inventoryLevels.nodes.map(
      (node) => ({
        inventoryItemId:
          node.item.id,

        sku:
          node.item.sku,

        productTitle:
          node.item.variant.product
            .title,

        variantTitle:
          node.item.variant.title,

        available:
          node.available,

        updatedAt:
          node.updatedAt,
      })
    ) ?? []
  );
}

export async function adminGetLocations(): Promise<
  {
    id: string;
    name: string;
    isActive: boolean;
  }[]
> {
  const query = `
    query GetLocations {
      locations(first: 20) {
        nodes {
          id
          name
          isActive
        }
      }
    }
  `;

  const data = await adminFetch<{
    locations: {
      nodes: {
        id: string;
        name: string;
        isActive: boolean;
      }[];
    };
  }>(query);

  return data.locations.nodes;
}

export async function adminAdjustInventory(
  inventoryItemId: string,
  locationId: string,
  delta: number
): Promise<{
  userErrors: AdminUserError[];
}> {
  const mutation = `
    mutation AdjustInventory(
      $input: InventoryAdjustQuantitiesInput!
    ) {
      inventoryAdjustQuantities(
        input: $input
      ) {
        inventoryAdjustmentGroup {
          reason
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    inventoryAdjustQuantities: {
      userErrors:
      AdminUserError[];
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

// ─────────────────────────────────────────────────────────────────────────────
// Collections
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetCollections(
  first = 20
): Promise<AdminCollection[]> {
  const query = `
    query GetAdminCollections(
      $first: Int!
    ) {
      collections(
        first: $first
        sortKey: UPDATED_AT
        reverse: true
      ) {
        nodes {
          id
          title
          handle
          descriptionHtml
          updatedAt

          productsCount {
            count
          }

          image {
            url
            altText
          }
        }
      }
    }
  `;

  const data = await adminFetch<{
    collections: {
      nodes: AdminCollection[];
    };
  }>(query, {
    first,
  });

  return data.collections.nodes;
}

export async function adminCreateCollection(
  input: {
    title: string;
    descriptionHtml?: string;
  }
): Promise<{
  collection: AdminCollection;
  userErrors: AdminUserError[];
}> {
  const mutation = `
    mutation CreateCollection(
      $input: CollectionInput!
    ) {
      collectionCreate(
        input: $input
      ) {
        collection {
          id
          title
          handle
          descriptionHtml
          updatedAt

          productsCount {
            count
          }

          image {
            url
            altText
          }
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    collectionCreate: {
      collection:
      AdminCollection;

      userErrors:
      AdminUserError[];
    };
  }>(mutation, {
    input,
  });

  return data.collectionCreate;
}

export async function adminDeleteCollection(
  id: string
): Promise<{
  deletedCollectionId:
  | string
  | null;

  userErrors:
  AdminUserError[];
}> {
  const mutation = `
    mutation DeleteCollection(
      $input: CollectionDeleteInput!
    ) {
      collectionDelete(
        input: $input
      ) {
        deletedCollectionId

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    collectionDelete: {
      deletedCollectionId:
      | string
      | null;

      userErrors:
      AdminUserError[];
    };
  }>(mutation, {
    input: {
      id,
    },
  });

  return data.collectionDelete;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Statistics
// ─────────────────────────────────────────────────────────────────────────────

export async function adminGetDashboardStats(): Promise<{
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalCollections: number;
  outOfStock: number;
}> {
  const countQuery = `
    query DashboardCounts {
      products: productsCount {
        count
      }

      activeProducts: productsCount(
        query: "status:active"
      ) {
        count
      }

      draftProducts: productsCount(
        query: "status:draft"
      ) {
        count
      }

      outOfStock: productsCount(
        query: "inventory_total:0"
      ) {
        count
      }

      collections: collectionsCount {
        count
      }
    }
  `;

  try {
    const data = await adminFetch<{
      products: {
        count: number;
      };

      activeProducts: {
        count: number;
      };

      draftProducts: {
        count: number;
      };

      outOfStock: {
        count: number;
      };

      collections: {
        count: number;
      };
    }>(countQuery);

    return {
      totalProducts:
        data.products.count,

      activeProducts:
        data.activeProducts.count,

      draftProducts:
        data.draftProducts.count,

      totalCollections:
        data.collections.count,

      outOfStock:
        data.outOfStock.count,
    };
  } catch (error) {
    console.error(
      "[Shopify Admin] Failed to fetch dashboard counts:",
      error
    );

    return {
      totalProducts: 0,
      activeProducts: 0,
      draftProducts: 0,
      totalCollections: 0,
      outOfStock: 0,
    };
  }
}
async function applyVariantInventory(
  productId: string,
  variantId: string,
  variantInput: AdminVariantInput
): Promise<void> {
  const product =
    await adminGetProduct(productId);

  const variant =
    product?.variants.nodes.find(
      (item) =>
        item.id === variantId
    );

  if (!variant?.inventoryItem?.id) {
    throw new Error(
      `Inventory item not found for variant ${variantId}.`
    );
  }

  const inventoryItemId =
    variant.inventoryItem.id;

  // ─────────────────────────────────────────
  // Multi-location inventory
  // ─────────────────────────────────────────

  if (
    variantInput.inventoryQuantities?.length
  ) {
    for (
      const inventory of
      variantInput.inventoryQuantities
    ) {
      // 1. Activate inventory at location
      const activationResult =
        await adminActivateInventory(
          inventoryItemId,
          inventory.locationId
        );

      if (
        activationResult.userErrors.length
      ) {
        throw new Error(
          activationResult.userErrors
            .map(
              (error) =>
                error.message
            )
            .join(", ")
        );
      }

      // 2. Set quantity
      const inventoryResult =
        await adminSetInventoryQuantity(
          inventoryItemId,
          inventory.locationId,
          inventory.quantity
        );

      if (
        inventoryResult.userErrors.length
      ) {
        throw new Error(
          inventoryResult.userErrors
            .map(
              (error) =>
                error.message
            )
            .join(", ")
        );
      }
    }

    return;
  }

  // ─────────────────────────────────────────
  // Single-location compatibility
  // ─────────────────────────────────────────

  if (
    variantInput.inventoryQuantity !==
    undefined
  ) {
    const locations =
      await adminGetLocations();

    const location =
      locations.find(
        (item) =>
          item.isActive
      );

    if (!location) {
      throw new Error(
        "No active Shopify inventory location found."
      );
    }

    // 1. Activate inventory
    const activationResult =
      await adminActivateInventory(
        inventoryItemId,
        location.id
      );

    if (
      activationResult.userErrors.length
    ) {
      throw new Error(
        activationResult.userErrors
          .map(
            (error) =>
              error.message
          )
          .join(", ")
      );
    }

    // 2. Set quantity
    const inventoryResult =
      await adminSetInventoryQuantity(
        inventoryItemId,
        location.id,
        variantInput.inventoryQuantity
      );

    if (
      inventoryResult.userErrors.length
    ) {
      throw new Error(
        inventoryResult.userErrors
          .map(
            (error) =>
              error.message
          )
          .join(", ")
      );
    }
  }
}
async function adminCreateVariants(
  productId: string,
  variants: AdminVariantInput[]
): Promise<{
  userErrors: AdminUserError[];
}> {
  const mutation = `
    mutation CreateProductVariants(
      $productId: ID!
      $variants: [ProductVariantsBulkInput!]!
    ) {
      productVariantsBulkCreate(
        productId: $productId
        variants: $variants
      ) {
        productVariants {
          id
          title
          price
          sku
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const shopifyVariants =
    variants.map((variant) => ({
      price:
        variant.price,

      ...(variant.compareAtPrice && {
        compareAtPrice:
          variant.compareAtPrice,
      }),

      ...(variant.barcode && {
        barcode:
          variant.barcode,
      }),

      ...(variant.taxable !== undefined && {
        taxable:
          variant.taxable,
      }),

      ...(variant.inventoryPolicy && {
        inventoryPolicy:
          variant.inventoryPolicy,
      }),

      ...(variant.optionValues?.length && {
        optionValues:
          variant.optionValues.map(
            (option) => ({
              optionName:
                option.optionName,

              name:
                option.value,
            })
          ),
      }),

      inventoryItem: {
        ...(variant.sku && {
          sku:
            variant.sku,
        }),

        ...(variant.tracked !== undefined && {
          tracked:
            variant.tracked,
        }),

        ...(variant.cost && {
          cost:
            variant.cost,
        }),

        ...(variant.requiresShipping !==
          undefined && {
          requiresShipping:
            variant.requiresShipping,
        }),

        ...(variant.countryCodeOfOrigin && {
          countryCodeOfOrigin:
            variant.countryCodeOfOrigin,
        }),

        ...(variant.harmonizedSystemCode && {
          harmonizedSystemCode:
            variant.harmonizedSystemCode,
        }),
      },
    }));

  const data = await adminFetch<{
    productVariantsBulkCreate: {
      userErrors: AdminUserError[];
    };
  }>(mutation, {
    productId,
    variants:
      shopifyVariants,
  });

  return {
    userErrors:
      data.productVariantsBulkCreate
        .userErrors,
  };
}
function normalizeShopifyMedia(
  media: AdminMediaInput[]
) {
  return media
    .filter((item) => {
      if (
        item.src.startsWith("data:")
      ) {
        console.warn(
          "[Shopify Admin] Base64 media requires stagedUploadsCreate."
        );

        return false;
      }

      return true;
    })
    .map((item) => ({
      originalSource:
        item.src,

      mediaContentType:
        item.type,

      ...(item.altText && {
        alt:
          item.altText,
      }),
    }));
}
export async function adminPublishProduct(
  productId: string,
  publicationIds: string[]
): Promise<{
  userErrors: AdminUserError[];
}> {
  if (
    publicationIds.length === 0
  ) {
    return {
      userErrors: [],
    };
  }

  const mutation = `
    mutation PublishProduct(
      $id: ID!
      $input: [PublicationInput!]!
    ) {
      publishablePublish(
        id: $id
        input: $input
      ) {
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    publishablePublish: {
      userErrors:
      AdminUserError[];
    };
  }>(mutation, {
    id:
      productId,

    input:
      publicationIds.map(
        (publicationId) => ({
          publicationId,
        })
      ),
  });

  return {
    userErrors:
      data.publishablePublish
        .userErrors,
  };
}
export async function adminSetInventoryQuantity(
  inventoryItemId: string,
  locationId: string,
  quantity: number
): Promise<{
  userErrors: AdminUserError[];
}> {
  const mutation = `
    mutation SetInventory(
      $input: InventorySetQuantitiesInput!
      $idempotencyKey: String!
    ) {
      inventorySetQuantities(
        input: $input
      ) @idempotent(key: $idempotencyKey) {
        inventoryAdjustmentGroup {
          createdAt
          reason
          referenceDocumentUri

          changes {
            name
            delta
            quantityAfterChange
          }
        }

        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const idempotencyKey = crypto.randomUUID();

  const data = await adminFetch<{
    inventorySetQuantities: {
      inventoryAdjustmentGroup: {
        createdAt: string;
        reason: string;
        referenceDocumentUri: string | null;

        changes: {
          name: string;
          delta: number;
          quantityAfterChange: number;
        }[];
      } | null;

      userErrors: Array<
        AdminUserError & {
          code?: string;
        }
      >;
    };
  }>(mutation, {
    input: {
      name: "available",
      reason: "correction",

      referenceDocumentUri:
        `gid://no-nonsenses/InventoryUpdate/${idempotencyKey}`,

      quantities: [
        {
          inventoryItemId,
          locationId,

          // Absolute inventory we want
          quantity,

          // Required in 2026-10.
          // null = skip compare-and-swap check.
          changeFromQuantity: null,
        },
      ],
    },

    idempotencyKey,
  });

  return {
    userErrors:
      data.inventorySetQuantities.userErrors,
  };
}
export async function adminActivateInventory(
  inventoryItemId: string,
  locationId: string
): Promise<{
  userErrors: AdminUserError[];
}> {
  const idempotencyKey =
    crypto.randomUUID();

  const mutation = `
    mutation ActivateInventory(
      $inventoryItemId: ID!
      $locationId: ID!
      $idempotencyKey: String!
    ) {
      inventoryActivate(
        inventoryItemId: $inventoryItemId
        locationId: $locationId
      ) @idempotent(key: $idempotencyKey) {
        inventoryLevel {
          id
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminFetch<{
    inventoryActivate: {
      inventoryLevel: {
        id: string;
      } | null;

      userErrors: AdminUserError[];
    };
  }>(mutation, {
    inventoryItemId,
    locationId,
    idempotencyKey,
  });

  return {
    userErrors:
      data.inventoryActivate.userErrors,
  };
}