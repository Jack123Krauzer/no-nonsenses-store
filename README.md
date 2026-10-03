# No-Nonsense Store 🛒

A high-performance, SEO-friendly e-commerce web application with **direct Shopify synchronization**, a full-featured **Admin Panel**, and **Razorpay Payment Gateway** integration.

Built with **Next.js 16 (App Router + Turbopack)**, **Vanilla CSS Design System**, and **TypeScript**.

---

## ✨ Features

### 🛍️ Storefront
- **SEO-Optimized SSR & SSG**: Dynamic meta tags, OpenGraph tags, semantic HTML5, and automated JSON-LD breadcrumbs for search engines.
- **Product Listing & Filtering**: Browse all products with pricing, image zoom on hover, and badge highlights.
- **Product Categories & Collections**: Dedicated collection pages with custom hero banners and filtered product grids.
- **Product Detail Pages**: Multi-image interactive gallery, live variant selection (colors, sizes), stock status, and quantity counters.
- **Shopping Cart**: Client-side persistent cart state with instant quantity updates, free shipping progress indicators, and order summary.
- **Razorpay Checkout**: Seamless payment modal flow with server-side order generation and HMAC SHA256 signature verification.
- **Graceful Fallbacks**: Includes rich demonstration products and collections so the storefront is fully interactive even before linking your live Shopify credentials.

### ⚙️ Admin Panel
Directly reflected in your Shopify store via Shopify GraphQL Admin API:
- **Dashboard Overview**: Live store KPIs (total products, active products, draft products, collections count, out-of-stock count).
- **Product Management**: List all products with search, status filters (Active, Draft, Archived), and direct deletion.
- **Product Creator & Editor**: Create and update products, variants, pricing, compare-at pricing, inventory, images, and SEO metadata.
- **Collections Management**: View, create, and delete Shopify collections.
- **Inventory Management**: Multi-location stock inspection with single-click real-time quantity adjustments (`+1`, `-1`, `+5`, `-5`, custom delta).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your credentials:
```env
# Shopify Storefront API (Public, Read-Only)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token

# Shopify Admin API (Server-Only)
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_admin_access_token
SHOPIFY_API_VERSION=2025-04

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Admin Panel Token
ADMIN_SECRET_TOKEN=your_custom_admin_token
NEXT_PUBLIC_ADMIN_TOKEN=your_custom_admin_token

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note:** All sensitive tokens (`SHOPIFY_ADMIN_ACCESS_TOKEN`, `RAZORPAY_KEY_SECRET`, `ADMIN_SECRET_TOKEN`) are strictly read on the server side and never leaked to the client browser.

### 3. Run Development Server
```bash
npm run dev
```

Visit:
- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Obtaining API Keys

### Shopify Storefront & Admin APIs
1. Log into your [Shopify Partner / Merchant Dashboard](https://admin.shopify.com).
2. Go to **Settings > Apps and sales channels > Develop apps**.
3. Click **Create an app** (e.g. "No-Nonsense Storefront").
4. Under **Configuration**:
   - **Storefront API integration**: Select `read_products`, `read_product_listings`, `read_collections`.
   - **Admin API integration**: Select `read_products`, `write_products`, `read_inventory`, `write_inventory`, `read_locations`.
5. Under **API credentials**, install the app and copy your access tokens.

### Razorpay API Keys
1. Sign up / log into [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch to **Test Mode** (or Live Mode for production).
3. Navigate to **Account & Settings > API Keys > Generate Key**.
4. Copy the **Key ID** and **Key Secret**.

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── (store)/                     # Storefront routes
│   │   ├── page.tsx                 # Homepage with hero, featured products & collections
│   │   ├── products/
│   │   │   ├── page.tsx             # All products listing
│   │   │   └── [handle]/page.tsx    # Product detail page (SSR + SSG)
│   │   ├── collections/
│   │   │   ├── page.tsx             # All collections listing
│   │   │   └── [handle]/page.tsx    # Single collection detail
│   │   └── cart/
│   │       └── page.tsx             # Shopping cart & Razorpay checkout
│   ├── admin/                       # Admin Panel routes
│   │   ├── page.tsx                 # Admin dashboard overview
│   │   ├── products/
│   │   │   ├── page.tsx             # Products table & search
│   │   │   ├── new/page.tsx         # Add product form (syncs to Shopify)
│   │   │   └── [id]/page.tsx        # Edit product form (syncs to Shopify)
│   │   ├── collections/
│   │   │   └── page.tsx             # Collections management
│   │   └── inventory/
│   │       └── page.tsx             # Multi-location inventory manager
│   └── api/
│       ├── admin/
│       │   ├── products/            # Admin products API (GET, POST)
│       │   ├── products/[id]/       # Admin product CRUD (GET, PUT, DELETE)
│       │   ├── collections/         # Admin collections API (GET, POST, DELETE)
│       │   └── inventory/           # Admin inventory API (GET, POST)
│       └── razorpay/
│           ├── create-order/        # Server-side Razorpay order creation
│           └── verify/              # HMAC SHA256 payment verification
├── components/                      # Reusable UI components (Navbar, Footer, ProductCard)
└── lib/
    ├── admin-auth.ts                # Admin token security verification
    ├── razorpay.ts                  # Razorpay SDK initialization & signature verify
    ├── shopify-admin.ts             # Shopify GraphQL Admin API client
    ├── shopify-storefront.ts        # Shopify GraphQL Storefront API client
    └── fallback-data.ts             # Offline demo mock data
```

---

## 🔒 Security Best Practices
- **No Hardcoded Keys**: Every secret credential is strictly retrieved from environment variables.
- **Server Verification**: Razorpay checkout payments are validated via cryptographic HMAC-SHA256 signature verification before any order is marked as paid.
- **Admin Isolation**: Admin mutation endpoints require `x-admin-token` verification matching `ADMIN_SECRET_TOKEN`.
