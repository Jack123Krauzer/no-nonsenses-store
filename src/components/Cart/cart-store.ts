'use client';

import { useMemo, useSyncExternalStore } from 'react';

export interface CartItem {
  variantId: string;
  title: string;
  variantTitle?: string;
  price: string;
  currencyCode?: string;
  quantity: number;
  image?: string;
  handle?: string;
}

function snapshot() {
  try { return localStorage.getItem('nns_cart') ?? '[]'; } catch { return '[]'; }
}
function parseCart(value: string | null): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is CartItem => item && typeof item.variantId === 'string' && typeof item.title === 'string' && typeof item.price === 'string' && Number.isFinite(Number(item.price)) && Number(item.price) >= 0 && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
}
function subscribe(listener: () => void) {
  window.addEventListener('nns:cart-updated', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('nns:cart-updated', listener);
    window.removeEventListener('storage', listener);
  };
}
export function useCart() {
  const stored = useSyncExternalStore(subscribe, snapshot, () => null);
  const cart = useMemo(() => parseCart(stored), [stored]);
  return { cart, hydrated: stored !== null };
}
export function saveCart(cart: CartItem[]) {
  localStorage.setItem('nns_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('nns:cart-updated'));
}
export function addToCart(item: CartItem) {
  const cart = parseCart(snapshot());
  const existing = cart.find((entry) => entry.variantId === item.variantId);
  if (existing) existing.quantity += item.quantity;
  else cart.push(item);
  saveCart(cart);
}
