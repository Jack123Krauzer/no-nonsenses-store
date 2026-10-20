"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import "./green-home.css";

type Filter = "all" | "tees" | "essentials";
type Concept = {
  id: string;
  name: string;
  subtitle: string;
  colour: string;
  category: Filter;
  tone: number;
  mood: string;
  description: string;
};
const products: Concept[] = [
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
    subtitle: "Everyday tee / Sage",
    colour: "Sage",
    category: "essentials",
    tone: 2,
    mood: "FOR THE QUIETLY UNBOTHERED",
    description:
      "Minimal words. Maximum you. A quiet sage concept for days when the brand name says enough.",
  },
];
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All moods" },
  { id: "tees", label: "Graphic tees" },
  { id: "essentials", label: "The essentials" },
];
const sizes = ["S", "M", "L", "XL", "XXL"];

function ProductArtwork({ tone }: { tone: number }) {
  const id = useId();
  if (tone === 0)
    return (
      <div className="tee-scene black-tee">
        <svg
          className="shirt"
          viewBox="0 0 400 440"
          role="img"
          aria-label="Black graphic tee reading Probably Overthinking"
        >
          <defs>
            <linearGradient id={`${id}-black`} x1="0" x2="1">
              <stop stopColor="#181b1a" />
              <stop offset=".3" stopColor="#363b37" />
              <stop offset=".55" stopColor="#242925" />
              <stop offset=".8" stopColor="#323732" />
              <stop offset="1" stopColor="#151916" />
            </linearGradient>
            <filter id={`${id}-shadow`}>
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="12"
                floodOpacity=".45"
              />
            </filter>
          </defs>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M137 49 99 62 30 135 80 189 110 165 98 384Q200 402 302 384L290 165 320 189 370 135 301 62 263 49Q200 84 137 49Z"
              fill={`url(#${id}-black)`}
              stroke="#484e47"
              strokeWidth="1.4"
            />
            <path
              d="M137 49Q145 111 200 111T263 49Q200 80 137 49"
              fill="#121613"
              stroke="#4a5048"
              strokeWidth="3"
            />
            <path
              d="M111 165 120 112M290 165 280 112M111 374Q200 389 291 374"
              fill="none"
              stroke="#53594f"
              opacity=".4"
            />
            <path
              d="M132 198q-9 72 0 152M269 206q12 69 0 144"
              fill="none"
              stroke="#555e52"
              opacity=".2"
              strokeWidth="4"
            />
          </g>
          <text
            x="200"
            y="191"
            textAnchor="middle"
            fill="#ecebdc"
            fontFamily="Arial,sans-serif"
            fontWeight="800"
            fontSize="19"
            letterSpacing="-1"
          >
            PROBABLY
          </text>
          <text
            x="200"
            y="214"
            textAnchor="middle"
            fill="#ecebdc"
            fontFamily="Arial,sans-serif"
            fontWeight="800"
            fontSize="19"
            letterSpacing="-1"
          >
            OVERTHINKING.
          </text>
          <text
            x="200"
            y="235"
            textAnchor="middle"
            fill="#b0b4a8"
            fontFamily="Arial"
            fontSize="5"
            letterSpacing="2"
          >
            NO NONSENSES · INSIDE VOICE CLUB
          </text>
        </svg>
      </div>
    );
  if (tone === 1)
    return (
      <div className="tee-scene white-tee">
        <svg
          className="shirt"
          viewBox="0 0 400 440"
          role="img"
          aria-label="Off-white graphic tee reading social battery 1 percent"
        >
          <defs>
            <filter id={`${id}-shadow`}>
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="12"
                floodOpacity=".45"
              />
            </filter>
            <linearGradient id={`${id}-cream`} x1="0" x2="1">
              <stop stopColor="#a4a498" />
              <stop offset=".3" stopColor="#dedfd1" />
              <stop offset=".55" stopColor="#c8cbbd" />
              <stop offset=".8" stopColor="#e4e4d7" />
              <stop offset="1" stopColor="#929b8c" />
            </linearGradient>
          </defs>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M137 49 99 62 30 135 80 189 110 165 98 384Q200 402 302 384L290 165 320 189 370 135 301 62 263 49Q200 84 137 49Z"
              fill={`url(#${id}-cream)`}
              stroke="#d0d3c5"
              strokeWidth="1.4"
            />
            <path
              d="M137 49Q145 111 200 111T263 49Q200 80 137 49"
              fill="#7e8878"
              stroke="#b8bfae"
              strokeWidth="3"
            />
            <path
              d="M111 165 120 112M290 165 280 112M111 374Q200 389 291 374"
              fill="none"
              stroke="#7a8473"
              opacity=".5"
            />
            <path
              d="M132 198q-9 72 0 152M269 206q12 69 0 144"
              fill="none"
              stroke="#7a8473"
              opacity=".15"
              strokeWidth="4"
            />
          </g>
          <text
            x="200"
            y="190"
            textAnchor="middle"
            fill="#2d352c"
            fontFamily="Arial,sans-serif"
            fontWeight="700"
            fontSize="21"
            letterSpacing="-1"
          >
            social battery
          </text>
          <rect
            x="170"
            y="204"
            width="58"
            height="24"
            rx="4"
            fill="none"
            stroke="#35402f"
            strokeWidth="2"
          />
          <rect x="229" y="211" width="4" height="10" rx="1" fill="#35402f" />
          <rect x="174" y="208" width="5" height="16" rx="1" fill="#35402f" />
          <text
            x="202"
            y="221"
            textAnchor="middle"
            fill="#35402f"
            fontFamily="Arial"
            fontSize="12"
          >
            1%
          </text>
          <text
            x="200"
            y="248"
            textAnchor="middle"
            fill="#5f6956"
            fontFamily="Arial"
            fontSize="5"
            letterSpacing="2"
          >
            NO NONSENSES · RECHARGING
          </text>
        </svg>
      </div>
    );
  if (tone === 2)
    return (
      <div className="tee-scene green-tee">
        <svg
          className="shirt"
          viewBox="0 0 400 440"
          role="img"
          aria-label="Sage essential tee with No Nonsenses print"
        >
          <defs>
            <filter id={`${id}-shadow`}>
              <feDropShadow
                dx="0"
                dy="20"
                stdDeviation="12"
                floodOpacity=".45"
              />
            </filter>
            <linearGradient id={`${id}-sage`} x1="0" x2="1">
              <stop stopColor="#576250" />
              <stop offset=".3" stopColor="#93a28a" />
              <stop offset=".55" stopColor="#788b70" />
              <stop offset=".8" stopColor="#9ba992" />
              <stop offset="1" stopColor="#52634b" />
            </linearGradient>
          </defs>
          <g filter={`url(#${id}-shadow)`}>
            <path
              d="M137 49 99 62 30 135 80 189 110 165 98 384Q200 402 302 384L290 165 320 189 370 135 301 62 263 49Q200 84 137 49Z"
              fill={`url(#${id}-sage)`}
              stroke="#a3b399"
              strokeWidth="1.4"
            />
            <path
              d="M137 49Q145 111 200 111T263 49Q200 80 137 49"
              fill="#354831"
              stroke="#829478"
              strokeWidth="3"
            />
            <path
              d="M111 165 120 112M290 165 280 112M111 374Q200 389 291 374"
              fill="none"
              stroke="#4b6243"
              opacity=".65"
            />
            <path
              d="M132 198q-9 72 0 152M269 206q12 69 0 144"
              fill="none"
              stroke="#344c2c"
              opacity=".15"
              strokeWidth="4"
            />
          </g>
          <text
            x="200"
            y="200"
            textAnchor="middle"
            fill="#24321f"
            fontFamily="Arial,sans-serif"
            fontWeight="800"
            fontSize="18"
            letterSpacing="-1"
          >
            NO NONSENSES
          </text>
          <text
            x="200"
            y="217"
            textAnchor="middle"
            fill="#34482d"
            fontFamily="Arial"
            fontSize="5"
            letterSpacing="3"
          >
            LESS PRETENDING. MORE YOU.
          </text>
        </svg>
      </div>
    );
  return null;
}

function ConceptCard({
  product,
  onOpen,
}: {
  product: Concept;
  onOpen: () => void;
}) {
  return (
    <article className="product">
      <button
        type="button"
        className="product-image"
        onClick={onOpen}
        aria-label={`View ${product.name}`}
      >
        <span className="product-tag">{product.mood}</span>
        <ProductArtwork tone={product.tone} />
        <span className="quick-view">
          Explore this mood <b>↗</b>
        </span>
      </button>
      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.subtitle}</p>
        </div>
        <span
          className={`swatch ${["black", "cream", "sage"][product.tone]}`}
          aria-label={product.colour}
        />
      </div>
    </article>
  );
}

export default function GreenHome({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [activeProduct, setActiveProduct] = useState<Concept | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const dialog = useRef<HTMLDialogElement>(null);
  const visibleProducts = products.filter(
    (product) => activeFilter === "all" || product.category === activeFilter,
  );
  useEffect(() => {
    if (!activeProduct) return;
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProduct]);
  function closeProduct() {
    setActiveProduct(null);
    setSelectedSize("M");
  }
  return (
    <div className="green-home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-glow"></div>
        <div className="hero-grid"></div>
        <div className="hero-topline">
          <span>
            <i className="status-dot"></i> INDEPENDENT MINDS. EVERYDAY UNIFORMS.
          </span>
          <span>EST. 2026 / INDIA</span>
        </div>
        <div className="hero-copy">
          <a className="eyebrow-pill" href="#collection">
            <span className="tiny-mark">✳</span> A little attitude. A lot of
            you. <span>↗</span>
          </a>
          <h1 id="hero-title">
            Wear your
            <br />
            <span>inside voice.</span>
          </h1>
          <p>
            For the things you think. And probably shouldn't say.
            <br />
            Everyday clothing with an unapologetic sense of humour.
          </p>
          <div className="hero-actions">
            <a className="button light" href="#collection">
              Find your kind of nonsense <span>↗</span>
            </a>
            <a className="text-button" href="#manifesto">
              Meet the brand <span>↓</span>
            </a>
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="/images/green-campaign.webp"
            alt="No Nonsenses concept tees in washed black, off-white, and sage, with witty graphic prints"
            width="1536"
            height="1024"
            priority
          />
        </div>
        <div className="orbit-label label-left">
          <span className="circle-icon">✳</span>
          <span>
            Low social battery.<small>High outfit potential.</small>
          </span>
        </div>
        <div className="orbit-label label-right">
          <span className="circle-icon">↗</span>
          <span>
            Zero filter.<small>Full personality.</small>
          </span>
        </div>
        <div className="hero-bottom">
          <a href="#collection" className="scroll-link">
            <span>↓</span> Scroll into the nonsense
          </a>
          <div className="edition">
            <span>THE FIRST CHAPTER</span>
            <b>Collection 001</b>
            <i></i>
          </div>
        </div>
      </section>
      <div className="principles" aria-label="Brand principles">
        <span>LESS PRETENDING</span>
        <i>✳</i>
        <span>MORE PERSONALITY</span>
        <i>✳</i>
        <span>WEAR WHAT YOU THINK</span>
        <i>✳</i>
        <span>NO NONSENSES</span>
      </div>
      <section id="collection" className="section collection">
        <div className="section-top">
          <div>
            <span className="kicker">01 / THE COLLECTION PREVIEW</span>
            <h2>
              Good clothes.
              <br />
              <span>Questionable thoughts.</span>
            </h2>
          </div>
          <p>
            A first look at our kind of everyday essentials.
            <br />
            Pick a mood. Find your people.
          </p>
        </div>
        <div className="collection-toolbar">
          <div className="filters" role="group" aria-label="Filter collection">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={activeFilter === filter.id ? "selected" : undefined}
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                {filter.id === "all" ? <span>03</span> : null}
              </button>
            ))}
          </div>
          <span className="preview-label">
            <i className="status-dot"></i> CONCEPT DROP · NOT YET FOR SALE
          </span>
        </div>
        <div className="product-grid" id="products">
          {visibleProducts.map((product) => (
            <ConceptCard
              key={product.id}
              product={product}
              onOpen={() => setActiveProduct(product)}
            />
          ))}
        </div>
        <div className="collection-note">
          <span>01 — 03 / COLLECTION 001</span>
          <p>
            Original design concepts. Final fits, fabrics, and pricing will be
            shared at launch.
          </p>
        </div>
      </section>
      <section id="manifesto" className="manifesto">
        <div className="manifesto-art" aria-hidden="true">
          <div className="big-orbit"></div>
          <span className="orbital o1">overthinking</span>
          <span className="orbital o2">unbothered</span>
          <span className="orbital o3">not today</span>
          <div className="manifesto-mark">
            nn<span>™</span>
          </div>
          <span className="orbit-caption">
            A LABEL. NOT A PERSONALITY TEST.
          </span>
        </div>
        <div className="manifesto-copy">
          <span className="kicker">02 / OUR KIND OF NONSENSE</span>
          <h2>
            Life is serious.
            <br />
            <span>
              Your tee
              <br />
              doesn't have to be.
            </span>
          </h2>
          <p>
            Some days you're the main character. Some days you're just trying to
            answer one email. We make room for both.
          </p>
          <p>
            No Nonsenses is a clothing idea for people with a sense of humour
            and very little interest in pretending. Familiar thoughts.
            Unexpected punchlines. Something that feels like you.
          </p>
          <a className="text-button" href="#collection">
            Find your inside voice <span>↗</span>
          </a>
        </div>
      </section>
      <section className="section details-section">
        <div className="section-top">
          <div>
            <span className="kicker">03 / THE DESIGN LANGUAGE</span>
            <h2>
              Less noise.
              <br />
              <span>More personality.</span>
            </h2>
          </div>
          <p>
            The idea behind every piece.
            <br />
            Nothing complicated about it.
          </p>
        </div>
        <div className="bento">
          <article className="bento-large">
            <span className="kicker">01 — THE WORDS</span>
            <div className="word-stack">
              <span>“I'm fine.”</span>
              <span>“Define fine.”</span>
              <span>
                “Exactly.” <i>↗</i>
              </span>
            </div>
            <h3>A conversation, without the small talk.</h3>
            <p>Relatable thoughts turned into wearable punchlines.</p>
          </article>
          <article className="bento-small">
            <span className="kicker">02 — THE PALETTE</span>
            <div className="palette">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>
            <h3>
              Calm colours.
              <br />
              Loud personality.
            </h3>
            <p>Grounded shades that let the words do the talking.</p>
          </article>
          <article className="bento-wide">
            <div>
              <span className="kicker">03 — THE ATTITUDE</span>
              <h3>
                Very wearable.
                <br />
                Slightly unhinged.
              </h3>
              <p>A little self-awareness looks good on everyone.</p>
            </div>
            <div className="attitude-stamp">
              <span>OFFICIALLY</span>
              <b>
                not
                <br />
                for everyone.
              </b>
              <span>AND THAT'S THE POINT</span>
            </div>
          </article>
        </div>
      </section>
      {children}
      <section id="questions" className="section faq">
        <div>
          <span className="kicker">04 / STRAIGHT ANSWERS</span>
          <h2>
            Fair questions.
            <br />
            <span>No nonsense.</span>
          </h2>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              Can I order these pieces yet?<span>+</span>
            </summary>
            <p>
              Not yet. This is a preview of our first collection and the
              direction of the brand. Ordering will open once final products,
              prices, and delivery details are ready.
            </p>
          </details>
          <details>
            <summary>
              Are these the final product designs?<span>+</span>
            </summary>
            <p>
              These are original concept mockups. Graphics, colours, fabrics,
              and fits may change as the collection develops. Final product
              photography and specifications will be published before sales
              open.
            </p>
          </details>
          <details>
            <summary>
              How do I choose my size?<span>+</span>
            </summary>
            <p>
              Open any collection card to explore the design and see the fit
              guide. The final garment measurements and size chart will be
              available at launch, so you can compare them with a tee you
              already love.
            </p>
          </details>
          <details>
            <summary>
              What about shipping and returns?<span>+</span>
            </summary>
            <p>
              Shipping regions, delivery times, and the returns policy are being
              finalized. These details will be available before checkout opens.
              There are no orders or payments being taken on this preview.
            </p>
          </details>
        </div>
      </section>
      <section className="closing">
        <span className="eyebrow-pill">
          <span className="tiny-mark">✳</span> NO NONSENSES. JUST YOU.
        </span>
        <h2>
          Your next favourite tee
          <br />
          has <span>something to say.</span>
        </h2>
        <a className="button light" href="#collection">
          Explore Collection 001 <span>↗</span>
        </a>
        <span className="closing-fine">
          A first look. A little attitude. A whole lot to come.
        </span>
      </section>

      <dialog
        ref={dialog}
        aria-labelledby="concept-title"
        onCancel={closeProduct}
        onClose={() => {
          if (activeProduct) closeProduct();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            closeProduct();
        }}
      >
        <button
          type="button"
          className="dialog-close"
          aria-label="Close product details"
          onClick={closeProduct}
        >
          ×
        </button>
        {activeProduct ? (
          <div className="dialog-grid">
            <div id="dialog-art">
              <ProductArtwork tone={activeProduct.tone} />
            </div>
            <div className="dialog-copy">
              <span className="kicker">COLLECTION 001 / CONCEPT PREVIEW</span>
              <h2 id="concept-title">{activeProduct.name}</h2>
              <p>{activeProduct.description}</p>
              <span className="detail-label">COLOUR</span>
              <p>{activeProduct.colour}</p>
              <span className="detail-label">EXPLORE THE FIT</span>
              <div className="sizes" role="group" aria-label="Explore a size">
                {sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={selectedSize === size ? "selected" : undefined}
                    aria-pressed={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p id="size-feedback" aria-live="polite">
                {selectedSize} selected. Final measurements coming at launch.
              </p>
              <details className="fit-guide">
                <summary>
                  How to find your fit <span>+</span>
                </summary>
                <p>
                  Lay a favourite tee flat. Measure across the chest and from
                  shoulder to hem. Compare with the final garment measurements
                  when the collection launches.
                </p>
              </details>
              <div className="launch-note">
                <i className="status-dot" />
                <div>
                  <b>In the works.</b>
                  <p>
                    This design is a preview. Pricing and ordering will be
                    announced at launch. You can browse currently available
                    products in the store below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
