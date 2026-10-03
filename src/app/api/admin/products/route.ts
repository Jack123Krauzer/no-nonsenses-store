import { NextRequest } from 'next/server';
import { adminGetProducts, adminCreateProduct } from '@/lib/shopify-admin';
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const url = new URL(request.url);
    const first = parseInt(url.searchParams.get('first') ?? '50', 10);
    const products = await adminGetProducts(first);
    return Response.json({ products });
  } catch (err) {
    console.error('[Admin] GET products error:', err);
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = await adminCreateProduct(body);

    if (result.userErrors.length > 0) {
      return Response.json({ errors: result.userErrors }, { status: 422 });
    }

    return Response.json({ product: result.product }, { status: 201 });
  }catch (error) {
  console.error("CREATE PRODUCT ERROR:", error);

  return Response.json(
    {
      error: "Failed to create product",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    },
    { status: 500 }
  );
}
}
