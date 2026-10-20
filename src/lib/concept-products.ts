import type { ShopifyProduct } from "./shopify-storefront";
export type Filter = "all" | "tees" | "essentials";
export type Concept = {
  id: string;
  name: string;
  subtitle: string;
  colour: string;
  category: Filter;
  tone: number;
  mood: string;
  description: string;
};
export const CONCEPTS: Concept[] = [
  {
    id: "overthinking",
    name: "Probably Overthinking.",
    subtitle: "Graphic tee / Washed black",
    colour: "Washed black",
    category: "tees",
    tone: 0,
    mood: "FOR THE 2 AM THINKER",
    description:
      "For the mind with 37 tabs open. A washed-black graphic concept that says the quiet part out loud.",
  },
  {
    id: "battery",
    name: "Social Battery: 1%.",
    subtitle: "Graphic tee / Off-white",
    colour: "Off-white",
    category: "tees",
    tone: 1,
    mood: "FOR THE SELECTIVELY SOCIAL",
    description:
      "Available for meaningful conversations. Temporarily unavailable for everything else. A graphic concept for the selectively social.",
  },
  {
    id: "essential",
    name: "The Unbothered Essential.",
    subtitle: "Everyday tee / Ash grey",
    colour: "Ash grey",
    category: "essentials",
    tone: 2,
    mood: "FOR THE QUIETLY UNBOTHERED",
    description:
      "Minimal words. Maximum you. A quiet ash-grey concept for days when the brand name says enough.",
  },
];

export const CONCEPT_SIZES = ["S", "M", "L", "XL", "XXL"];
export function getConceptProduct(handle: string): ShopifyProduct | null {
  const concept = CONCEPTS.find((item) => `concept-${item.id}` === handle);
  if (!concept) return null;
  return {
    id: `concept:${concept.id}`,
    isDemo: true,
    handle,
    title: concept.name,
    description: concept.description,
    descriptionHtml: "",
    vendor: "No Nonsenses",
    productType: "Concept tee",
    tags: ["concept"],
    featuredImage: null,
    images: { nodes: [] },
    availableForSale: false,
    seo: { title: concept.name, description: concept.description },
    priceRange: {
      minVariantPrice: { amount: "0", currencyCode: "INR" },
      maxVariantPrice: { amount: "0", currencyCode: "INR" },
    },
    options: [{ name: "Size", values: CONCEPT_SIZES }],
    variants: {
      nodes: CONCEPT_SIZES.map((size) => ({
        id: `concept:${concept.id}:${size}`,
        title: size,
        price: { amount: "0", currencyCode: "INR" },
        compareAtPrice: null,
        availableForSale: false,
        selectedOptions: [{ name: "Size", value: size }],
        image: null,
        sku: null,
      })),
    },
  };
}
