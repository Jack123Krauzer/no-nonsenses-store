import { NextRequest } from 'next/server';
import { isRazorpayConfigured, isRazorpayPaymentCaptured, verifyRazorpaySignature } from '@/lib/razorpay';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid verification request.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Missing payment details.' }, { status: 400 });
  }
  const { orderId, paymentId, signature } = body as Record<string, unknown>;
  if (typeof orderId !== 'string' || !/^order_[a-zA-Z0-9]{1,64}$/.test(orderId) ||
    typeof paymentId !== 'string' || !/^pay_[a-zA-Z0-9]{1,64}$/.test(paymentId) ||
    typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) {
    return Response.json({ error: 'Invalid payment details.' }, { status: 400 });
  }
  if (!isRazorpayConfigured()) {
    return Response.json({ error: 'Payment verification is unavailable.' }, { status: 503 });
  }
  if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
    return Response.json({ error: 'Invalid payment signature.' }, { status: 400 });
  }
  try {
    if (!await isRazorpayPaymentCaptured(orderId, paymentId)) {
      return Response.json({
        success: false,
        error: 'Your payment is not yet confirmed. Keep your payment reference and contact the store before retrying.',
      }, { status: 409 });
    }
    // This confirms payment only. Shopify order creation/fulfillment is a separate integration.
    return Response.json({ success: true, paymentId, orderId, message: 'Payment confirmed.' }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    console.error('[Razorpay] Payment status could not be confirmed.');
    return Response.json({
      error: 'Unable to confirm payment. Keep your payment reference and contact the store before retrying.',
    }, { status: 503 });
  }
}
