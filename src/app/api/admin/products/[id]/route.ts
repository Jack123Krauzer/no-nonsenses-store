import { NextRequest } from 'next/server';
import {
  adminGetProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '@/lib/shopify-admin';
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const { id } = await ctx.params;
    const gid = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;
    const product = await adminGetProduct(gid);
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json({ product });
  } catch (err) {
    console.error('[Admin] GET product error:', err);
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const { id } = await ctx.params;
    const gid = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;
    const body = await request.json();
    const result = await adminUpdateProduct(gid, body);

    if (result.userErrors.length > 0) {
      return Response.json({ errors: result.userErrors }, { status: 422 });
    }

    return Response.json({ product: result.product });
  } catch (err) {
    console.error('[Admin] PUT product error:', err);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const { id } = await ctx.params;
    const gid = id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`;
    const result = await adminDeleteProduct(gid);

    if (result.userErrors.length > 0) {
      return Response.json({ errors: result.userErrors }, { status: 422 });
    }

    return Response.json({ deletedId: result.deletedProductId });
  } catch (err) {
    console.error('[Admin] DELETE product error:', err);
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
