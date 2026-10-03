import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured } from '@/lib/razorpay';
import { getCheckoutVariants } from '@/lib/shopify-storefront';

export const runtime = 'nodejs';

interface CheckoutItem { variantId: string; quantity: number }

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 10_000) return Response.json({ error: 'Cart is too large.' }, { status: 400 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'Invalid checkout request.' }, { status: 400 });
  }

  const items = body && typeof body === 'object' && 'items' in body ? body.items : null;
  if (!Array.isArray(items) || items.length === 0 || items.length > 25 || items.some((item) =>
    !item || typeof item !== 'object' ||
    typeof item.variantId !== 'string' || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(item.variantId) ||
    !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10
  )) {
    return Response.json({ error: 'Choose 1–25 real products, with up to 10 of each. Demo items cannot be purchased.' }, { status: 400 });
  }

  const cart = items as CheckoutItem[];
  if (new Set(cart.map((item) => item.variantId)).size !== cart.length) {
    return Response.json({ error: 'Combine duplicate variants before checking out.' }, { status: 400 });
  }
  if (!isRazorpayConfigured()) {
    return Response.json({ error: 'Checkout is being set up. Please try again later.' }, { status: 503 });
  }

  try {
    const variants = await getCheckoutVariants(cart.map((item) => item.variantId));
    let subtotal = 0;
    for (const item of cart) {
      const variant = variants.find((entry) => entry?.id === item.variantId);
      if (!variant?.availableForSale || (variant.quantityAvailable !== null && variant.quantityAvailable < item.quantity)) {
        return Response.json({ error: 'An item is unavailable in the requested quantity. Please update your bag.' }, { status: 409 });
      }
      if (variant.product.requiresSellingPlan) {
        return Response.json({ error: 'Subscription products are not supported by this checkout.' }, { status: 400 });
      }
      if (variant.price.currencyCode !== 'INR') {
        return Response.json({ error: 'This checkout currently supports INR only.' }, { status: 400 });
      }
      // Shopify money is a decimal string. Convert exactly to paise, never trust a browser total.
      if (!/^\d+(?:\.\d{1,2})?$/.test(variant.price.amount)) {
        return Response.json({ error: 'Unable to confirm the current price. Please try again.' }, { status: 502 });
      }
      const [rupees, fraction = ''] = variant.price.amount.split('.');
      const price = Number(rupees) * 100 + Number(fraction.padEnd(2, '0'));
      subtotal += price * item.quantity;
    }
    const shipping = subtotal >= 199_900 ? 0 : 14_900;
    const amount = subtotal + shipping;
    if (!Number.isSafeInteger(amount) || amount < 100 || amount > 100_000_000) {
      return Response.json({ error: 'This order amount cannot be processed online.' }, { status: 400 });
    }

    const order = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `nns_${randomUUID().replaceAll('-', '')}`,
      notes: {
        source: 'no-nonsense-store',
        itemCount: String(cart.reduce((count, item) => count + item.quantity, 0)),
        shippingPaise: String(shipping),
      },
    });
    return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: getRazorpayKeyId() }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    console.error('[Razorpay] Could not confirm live prices or create an order.');
    return Response.json({ error: 'Checkout is temporarily unavailable. Please try again later.' }, { status: 503 });
  }
}
