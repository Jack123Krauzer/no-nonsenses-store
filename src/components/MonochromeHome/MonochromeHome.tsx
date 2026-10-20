"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import ProductArtwork from "./ProductArtwork";
import {
  CONCEPTS as products,
  type Concept,
  type Filter,
} from "@/lib/concept-products";
import "./monochrome-home.css";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All moods" },
  { id: "tees", label: "Graphic tees" },
  { id: "essentials", label: "The essentials" },
];

function ConceptCard({ product }: { product: Concept }) {
  return (
    <article className="product">
      <Link
        href={`/products/concept-${product.id}`}
        className="product-image"
        aria-label={`View ${product.name}`}
      >
        <span className="product-tag">{product.mood}</span>
        <ProductArtwork tone={product.tone} />
        <span className="quick-view">
          Explore this mood <b>↗</b>
        </span>
      </Link>
      <div className="product-info">
        <div>
          <Link href={`/products/concept-${product.id}`}>
            <h3>{product.name}</h3>
          </Link>
          <p>{product.subtitle}</p>
        </div>
        <span
          className={`swatch ${["black", "cream", "ash"][product.tone]}`}
          aria-label={product.colour}
        />
      </div>
    </article>
  );
}

export default function MonochromeHome({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const visibleProducts = products.filter(
    (product) => activeFilter === "all" || product.category === activeFilter,
  );
  return (
    <div className="monochrome-home">
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
            Wear your <span>inside voice.</span>
          </h1>
          <p>
            Everyday clothing for the things you think. And probably shouldn’t
            say.
          </p>
          <div className="hero-actions">
            <a className="button light" href="#collection">
              Find your kind of nonsense <span>↗</span>
            </a>
            <a className="button ghost-button" href="#manifesto">
              Meet the brand <span>↓</span>
            </a>
          </div>
        </div>
        <div className="hero-orbits" aria-hidden="true">
          <svg viewBox="0 0 1440 760" preserveAspectRatio="none">
            <path d="M0 180H200C275 180 290 105 370 105M1070 105C1150 105 1165 180 1240 180H1440M0 565H175C260 565 280 640 365 640M1075 640C1160 640 1180 565 1265 565H1440" />
          </svg>
          <i />
          <i />
          <i />
        </div>
        <div className="hero-emblem" aria-hidden="true">
          ✳
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
      <section className="campaign-section" aria-labelledby="campaign-heading">
        <div className="campaign-caption">
          <span className="kicker">COLLECTION 001 / THE INSIDE VOICE CLUB</span>
          <h2 id="campaign-heading">
            Attitude. <span>In black and white.</span>
          </h2>
        </div>
        <div className="campaign-art">
          <Image
            src="/images/monochrome-campaign.webp"
            alt="No Nonsenses concept tees in black, white, and ash grey"
            width={1536}
            height={1024}
            sizes="(max-width:760px) 100vw, 85vw"
          />
        </div>
        <a className="campaign-link" href="#collection">
          Explore the concepts <span>↗</span>
        </a>
      </section>
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
            <ConceptCard key={product.id} product={product} />
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
              Open any product details page to compare the size chart in
              centimetres or inches. The concept chart is illustrative; final
              garment measurements will be confirmed before sales open.
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
    </div>
  );
}
