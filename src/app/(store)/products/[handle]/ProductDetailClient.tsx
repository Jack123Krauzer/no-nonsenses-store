"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { formatPrice } from "@/lib/shopify-storefront";
import { addToCart } from "@/components/Cart/cart-store";
import { CONCEPTS } from "@/lib/concept-products";
import ProductArtwork from "@/components/MonochromeHome/ProductArtwork";
import SizeChart from "@/components/SizeChart/SizeChart";
import Icon from "@/components/Icon";
import styles from "./ProductDetail.module.css";

export default function ProductDetailClient({
  product,
}: {
  product: ShopifyProduct;
}) {
  const initialVariant =
    product.variants.nodes.find((variant) => variant.availableForSale) ??
    product.variants.nodes[0];
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      initialVariant?.selectedOptions.map((option) => [
        option.name,
        option.value,
      ]) ?? [],
    ),
  );
  const [selectedImage, setSelectedImage] = useState(
    initialVariant?.image?.url ??
      product.featuredImage?.url ??
      product.images.nodes[0]?.url ??
      "",
  );
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle");
  const [imageFailed, setImageFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const concept = CONCEPTS.find((item) => product.id === `concept:${item.id}`);
  const demo = !!product.isDemo || product.id.includes("fallback-");
  const variant = product.variants.nodes.find((item) =>
    item.selectedOptions.every(
      (option) => selectedOptions[option.name] === option.value,
    ),
  );
  const canPurchase =
    !demo && !!variant?.availableForSale && product.availableForSale;
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const comparison = variant?.compareAtPrice;
  const showComparison =
    comparison && Number(comparison.amount) > Number(price.amount);
  const options = product.options.filter(
    (option) =>
      !(
        option.name === "Title" &&
        option.values.length === 1 &&
        option.values[0] === "Default Title"
      ),
  );
  const sizeName = options.find((option) => /size/i.test(option.name))?.name;
  const hasSizeChart =
    !!sizeName ||
    /shirt|tee|hoodie|sweat|apparel|clothing/i.test(product.productType);
  const images = [
    ...(product.featuredImage ? [product.featuredImage] : []),
    ...product.images.nodes,
  ].filter(
    (image, index, list) =>
      list.findIndex((item) => item.url === image.url) === index,
  );
  function chooseOption(name: string, value: string) {
    const next = { ...selectedOptions, [name]: value };
    setSelectedOptions(next);
    setStatus("idle");
    const matching = product.variants.nodes.find((item) =>
      item.selectedOptions.every(
        (option) => next[option.name] === option.value,
      ),
    );
    if (matching?.image) {
      setSelectedImage(matching.image.url);
      setImageFailed(false);
    }
  }
  function add() {
    if (!canPurchase || !variant) return;
    try {
      addToCart({
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
        quantity,
        image: selectedImage || undefined,
        handle: product.handle,
      });
      setStatus("added");
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message.includes("up to 10")
          ? error.message
          : "Your bag could not be saved. Check browser storage and try again.",
      );
      setStatus("error");
    }
  }
  return (
    <div className={`container ${styles.page}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={concept ? "/#collection" : "/products"}>
          {concept ? "Collection preview" : "Products"}
        </Link>
        <span>/</span>
        <span aria-current="page">{product.title}</span>
      </nav>
      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {concept ? (
              <div className={`monochrome-home ${styles.art}`}>
                <ProductArtwork tone={concept.tone} />
              </div>
            ) : selectedImage && !imageFailed ? (
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width:900px) 100vw, 50vw"
                onError={() => setImageFailed(true)}
                className={styles.photo}
              />
            ) : (
              <div className={styles.placeholder}>
                <Icon name="box" size={70} />
                <span>Image unavailable</span>
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <div className={styles.thumbnails} aria-label="Product images">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image.url}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={selectedImage === image.url}
                  onClick={() => {
                    setSelectedImage(image.url);
                    setImageFailed(false);
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.altText ?? `${product.title}, view ${index + 1}`}
                    fill
                    sizes="72px"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles.info}>
          <span className="eyebrow">
            {concept
              ? "COLLECTION 001 / CONCEPT PREVIEW"
              : product.vendor || "NO NONSENSES"}
          </span>
          <h1>{product.title}</h1>
          {concept ? (
            <p className={styles.priceNote}>
              Concept preview · Pricing at launch
            </p>
          ) : (
            <div className={styles.pricing}>
              <span>{formatPrice(price.amount, price.currencyCode)}</span>
              {showComparison ? (
                <del>
                  {formatPrice(comparison.amount, comparison.currencyCode)}
                </del>
              ) : null}
            </div>
          )}
          <p className={styles.description}>{product.description}</p>
          <div className={styles.availability} role="status">
            {concept
              ? "This design is not yet for sale."
              : demo
                ? "Sample catalog item — purchases unavailable."
                : !variant
                  ? "This option combination is unavailable."
                  : canPurchase
                    ? "Available"
                    : "Sold out"}
          </div>
          {concept ? (
            <p className={styles.colour}>Colour: {concept.colour}</p>
          ) : null}
          {options.map((option) => (
            <fieldset key={option.name} className={styles.option}>
              <legend>
                {option.name}:{" "}
                <strong>{selectedOptions[option.name] ?? "Select"}</strong>
              </legend>
              <div>
                {option.values.map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={selectedOptions[option.name] === value}
                    onClick={() => chooseOption(option.name, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          {hasSizeChart ? (
            <a className={styles.sizeLink} href="#size-chart-title">
              Compare sizes & measurements ↓
            </a>
          ) : null}
          {!concept ? (
            <>
              <div className={styles.purchase}>
                <div className={styles.quantity}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => {
                      setQuantity((value) => Math.max(1, value - 1));
                      setStatus("idle");
                    }}
                  >
                    −
                  </button>
                  <label className="sr-only" htmlFor="product-quantity">
                    Quantity
                  </label>
                  <input
                    id="product-quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(event) => {
                      setQuantity(
                        Math.min(
                          10,
                          Math.max(
                            1,
                            Math.trunc(Number(event.target.value)) || 1,
                          ),
                        ),
                      );
                      setStatus("idle");
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= 10}
                    onClick={() => {
                      setQuantity((value) => Math.min(10, value + 1));
                      setStatus("idle");
                    }}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={add}
                  disabled={!canPurchase}
                >
                  {status === "added"
                    ? "Added to bag"
                    : demo
                      ? "Sample item"
                      : !variant
                        ? "Unavailable combination"
                        : canPurchase
                          ? "Add to bag"
                          : "Sold out"}
                </button>
              </div>
              <p className={styles.feedback} role="status">
                {status === "error"
                  ? errorMessage
                  : status === "added"
                    ? `${quantity} ${quantity === 1 ? "item" : "items"} added to your bag.`
                    : ""}
              </p>
              <Link className="btn btn-secondary" href="/cart">
                View shopping bag <Icon name="arrow" size={16} />
              </Link>
            </>
          ) : (
            <p className={styles.previewNote}>
              Preview sizes below to compare the illustrative measurements.
              Final fits, fabrics, pricing and ordering will be confirmed before
              launch.
            </p>
          )}
        </div>
      </div>
      {hasSizeChart ? (
        <SizeChart
          selectedSize={sizeName ? selectedOptions[sizeName] : undefined}
          concept={!!concept}
        />
      ) : null}
      <div className={styles.back}>
        <Link href={concept ? "/#collection" : "/products"}>
          ← {concept ? "Back to the collection" : "Continue browsing"}
        </Link>
      </div>
    </div>
  );
}
