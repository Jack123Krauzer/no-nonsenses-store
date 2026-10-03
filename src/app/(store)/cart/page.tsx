'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/shopify-storefront';

interface CartItem {
  variantId: string;
  title: string;
  variantTitle?: string;
  price: string;
  currencyCode?: string;
  quantity: number;
  image?: string;
  handle?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const FREE_SHIPPING_THRESHOLD = 1999;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  const syncCart = useCallback(() => {
    try {
      const stored = localStorage.getItem('nns_cart');
      setCart(stored ? JSON.parse(stored) : []);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    syncCart();
    setLoading(false);
    window.addEventListener('nns:cart-updated', syncCart);
    return () => window.removeEventListener('nns:cart-updated', syncCart);
  }, [syncCart]);

  const saveCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem('nns_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('nns:cart-updated'));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      saveCart(cart.filter((i) => i.variantId !== variantId));
    } else {
      saveCart(cart.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
    }
  };

  const removeItem = (variantId: string) => {
    saveCart(cart.filter((i) => i.variantId !== variantId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const currencyCode = cart[0]?.currencyCode ?? 'INR';
  const freeShippingMet = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingAmount = freeShippingMet || subtotal === 0 ? 0 : 149;
  const totalAmount = subtotal + shippingAmount;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window.Razorpay !== 'undefined') {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || paying) return;

    setPaying(true);
    setPaymentStatus('idle');

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Create order via API
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: currencyCode,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            itemCount: cart.length.toString(),
            items: cart.map((i) => `${i.title} (x${i.quantity})`).join(', ').slice(0, 100),
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create Razorpay order');
      }

      const orderData = await res.json();
      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TjPy2mTtEAa0IB';

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'No-Nonsense Store',
        description: `Order #${orderData.id}`,
        order_id: orderData.id,
        theme: { color: '#8b5cf6' },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              setPaymentStatus('success');
              setPaymentMessage(`Payment verified! ID: ${response.razorpay_payment_id}`);
              saveCart([]);
            } else {
              setPaymentStatus('error');
              setPaymentMessage('Payment signature verification failed. Please contact support.');
            }
          } catch {
            setPaymentStatus('error');
            setPaymentMessage('Error verifying payment.');
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentStatus('error');
      setPaymentMessage(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="skeleton h-12 w-48 mb-8" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-white/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          {cart.length} item{cart.length !== 1 ? 's' : ''} in your order
        </p>
      </div>

      {/* Payment Success Banner */}
      {paymentStatus === 'success' && (
        <div className="mb-10 p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl text-emerald-400 mb-1">
            ✓
          </div>
          <h2 className="text-2xl font-black text-white">Order Confirmed!</h2>
          <p className="text-sm text-zinc-300 max-w-md">{paymentMessage}</p>
          <Link
            href="/products"
            className="mt-3 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Payment Error Banner */}
      {paymentStatus === 'error' && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{paymentMessage}</span>
          <button
            onClick={() => setPaymentStatus('idle')}
            className="text-xs font-bold uppercase hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {cart.length === 0 && paymentStatus !== 'success' ? (
        <div className="text-center py-24 rounded-3xl bg-white/[0.02] border border-white/10">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Looks like you haven&apos;t added any items yet. Explore our curated collections.
          </p>
          <Link
            href="/products"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(139,92,246,0.35)]"
          >
            Start Shopping →
          </Link>
        </div>
      ) : cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Free shipping progress bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-zinc-300">
                  {freeShippingMet
                    ? '🎉 You unlocked Free Express Shipping!'
                    : `Add ₹${FREE_SHIPPING_THRESHOLD - subtotal} more for Free Shipping`}
                </span>
                <span className="text-violet-400 font-bold">
                  {Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div
                  key={item.variantId}
                  className="p-4 sm:p-5 rounded-2xl bg-[#12121a] border border-white/[0.06] flex items-center gap-4 sm:gap-6 shadow-md"
                >
                  {/* Thumb */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.handle ? `/products/${item.handle}` : '/products'}
                      className="font-bold text-white text-sm sm:text-base hover:text-violet-300 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    {item.variantTitle && item.variantTitle !== 'Default Title' && (
                      <p className="text-xs text-zinc-400 mt-0.5">{item.variantTitle}</p>
                    )}
                    <div className="text-sm font-bold text-violet-400 mt-2 sm:hidden">
                      {formatPrice(item.price, currencyCode)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-xl px-2 py-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-base font-bold text-white">
                      {formatPrice(
                        (parseFloat(item.price) * item.quantity).toString(),
                        currencyCode
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatPrice(item.price, currencyCode)} each
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 flex items-center justify-center transition-colors shrink-0"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#12121a] border border-white/10 shadow-2xl flex flex-col gap-6 sticky top-28">
            <h2 className="text-xl font-bold text-white tracking-tight">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  {formatPrice(subtotal.toString(), currencyCode)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Shipping</span>
                <span className="font-semibold text-white">
                  {freeShippingMet ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    formatPrice(shippingAmount.toString(), currencyCode)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between text-base sm:text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-violet-400">
                  {formatPrice(totalAmount.toString(), currencyCode)}
                </span>
              </div>
            </div>

            {/* Razorpay Checkout CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={paying}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.55)] hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting Razorpay…
                </>
              ) : (
                <>
                  Pay {formatPrice(totalAmount.toString(), currencyCode)} with Razorpay
                </>
              )}
            </button>

            {/* Payment security info */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span>🛡</span>
                <span>Secured by Razorpay 256-Bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Supports UPI (Google Pay, PhonePe, Paytm) & Cards</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
