import { NextRequest } from 'next/server';
import { adminGetLocations, adminGetInventoryLevels, adminAdjustInventory } from '@/lib/shopify-admin';
import { isAdminAuthenticated, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const url = new URL(request.url);
    const locationId = url.searchParams.get('locationId');

    if (!locationId) {
      // Return available locations
      const locations = await adminGetLocations();
      return Response.json({ locations });
    }

    const inventory = await adminGetInventoryLevels(locationId);
    return Response.json({ inventory });
  } catch (err) {
    console.error('[Admin] GET inventory error:', err);
    return Response.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorizedResponse();

  try {
    const { inventoryItemId, locationId, delta } = await request.json();

    if (!inventoryItemId || !locationId || typeof delta !== 'number') {
      return Response.json(
        { error: 'Missing required fields: inventoryItemId, locationId, delta' },
        { status: 400 }
      );
    }

    const result = await adminAdjustInventory(inventoryItemId, locationId, delta);
    if (result.userErrors.length > 0) {
      return Response.json({ errors: result.userErrors }, { status: 422 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('[Admin] POST inventory error:', err);
    return Response.json({ error: 'Failed to adjust inventory' }, { status: 500 });
  }
}
