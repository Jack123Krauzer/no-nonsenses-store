import { NextRequest } from 'next/server';
import { adminGetCollections, adminCreateCollection, adminDeleteCollection } from '@/lib/shopify-admin';
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const collections = await adminGetCollections();
    return Response.json({ collections });
  } catch (err) {
    console.error('[Admin] GET collections error:', err);
    return Response.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const body = await request.json();
    const result = await adminCreateCollection(body);
    if (result.userErrors.length > 0) {
      return Response.json({ errors: result.userErrors }, { status: 422 });
    }
    return Response.json({ collection: result.collection }, { status: 201 });
  } catch (err) {
    console.error('[Admin] POST collections error:', err);
    return Response.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const { id } = await request.json();
    const gid = id.startsWith('gid://') ? id : `gid://shopify/Collection/${id}`;
    const result = await adminDeleteCollection(gid);
    if (result.userErrors.length > 0) {
      return Response.json({ errors: result.userErrors }, { status: 422 });
    }
    return Response.json({ deletedId: result.deletedCollectionId });
  } catch (err) {
    console.error('[Admin] DELETE collection error:', err);
    return Response.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
