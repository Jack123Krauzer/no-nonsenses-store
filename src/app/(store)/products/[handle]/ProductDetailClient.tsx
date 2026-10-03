'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyProduct, ShopifyVariant } from '@/lib/shopify-storefront';
import { formatPrice } from '@/lib/shopify-storefront';

interface CartItem {
  variantId: string;
  title: string;
  variantTitle: string;
  price: string;
  currencyCode: string;
  quantity: number;
  image?: string;
  handle: string;
}

interface Props {
  product: ShopifyProduct;
}

export default function ProductDetailClient({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(
    product.variants.nodes[0]
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        product.variants.nodes[0]?.selectedOptions.map((o) => [o.name, o.value]) ?? []
      )
  );
  const [selectedImage, setSelectedImage] = useState(
    product.featuredImage?.url ?? product.images.nodes[0]?.url ?? ''
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Find variant matching current options
  const findVariant = useCallback(
    (options: Record<string, string>): ShopifyVariant | undefined => {
      return product.variants.nodes.find((v) =>
        v.selectedOptions.every((o) => options[o.name] === o.value)
      );
    },
    [product.variants.nodes]
  );

  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    const variant = findVariant(newOptions);
    if (variant) {
      setSelectedVariant(variant);
      if (variant.image) setSelectedImage(variant.image.url);
    }
  };

  const handleAddToCart = () => {
    const cart: CartItem[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('nns_cart') ?? '[]');
      } catch {
        return [];
      }
    })();

    const existingIndex = cart.findIndex((i) => i.variantId === selectedVariant.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        variantId: selectedVariant.id,
        title: product.title,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price.amount,
        currencyCode: selectedVariant.price.currencyCode,
        quantity,
        image: selectedImage,
        handle: product.handle,
      });
    }

    localStorage.setItem('nns_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('nns:cart-updated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const allImages = [
    ...(product.featuredImage ? [product.featuredImage] : []),
    ...product.images.nodes.filter((img) => img.url !== product.featuredImage?.url),
  ];

  const hasMultipleVariants =
    product.options.length > 0 &&
    !(
      product.options.length === 1 &&
      product.options[0].values.length === 1 &&
      product.options[0].name === 'Title'
    );

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isAvailable = selectedVariant?.availableForSale ?? product.availableForSale;

  const discountPercent =
    compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount)
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100
        )
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-xs text-zinc-400">
          <li>
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-white transition-colors">
              Products
            </Link>
          </li>
          <li>/</li>
          <li className="text-zinc-200 font-semibold truncate max-w-xs" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Stage & Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4 sticky top-28">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#14141e] border border-white/10 shadow-2xl">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl text-zinc-600">
                📦
              </div>
            )}

            {/* Discount Badge */}
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xl">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails Strip */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img.url
                      ? 'border-violet-500 scale-95 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.title} view ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buy Box & Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                {product.vendor || 'Shopify Store'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span className="text-zinc-400 ml-1">5.0 (42 reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
                <span className="text-lg text-zinc-500 line-through">
                  {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">
                {isAvailable ? 'In Stock • Ready to ship via Express Delivery' : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="h-[1px] bg-white/[0.08]" />

          {/* Variants Selector */}
          {hasMultipleVariants && (
            <div className="flex flex-col gap-5">
              {product.options.map((option) => (
                <div key={option.name}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      {option.name}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {selectedOptions[option.name]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const isSelected = selectedOptions[option.name] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleOptionChange(option.name, val)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-102'
                              : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/10'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-xl px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-white font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : isAvailable
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added to Cart!
                  </>
                ) : isAvailable ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    Add to Cart
                  </>
                ) : (
                  'Sold Out'
                )}
              </button>
            </div>

            {/* Direct Checkout Link */}
            <Link
              href="/cart"
              className="w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-center text-xs font-bold text-zinc-300 uppercase tracking-wider transition-all"
            >
              Go to Cart & Razorpay Checkout →
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2.5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Direct fulfillment synced with Shopify catalog</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold">🔒</span>
              <span>100% Secure Razorpay checkout with UPI & Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">↩</span>
              <span>7-Day hassle-free return and exchange policy</span>
            </div>
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div className="mt-4 pt-6 border-t border-white/[0.08]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-3">
                Product Details
              </h2>
              <div
                className="text-sm text-zinc-300 leading-relaxed space-y-3 prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
