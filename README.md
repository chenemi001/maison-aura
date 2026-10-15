# Maison Aura

A production-grade luxury skincare storefront built with **Next.js 16 (App Router, Cache Components)**, **TypeScript**, **Tailwind CSS v4**, **Supabase** and **Stripe**.

It is designed for a catalogue of **50,000+ products**, with server rendering, incremental static regeneration, technical SEO, accessibility and Core Web Vitals treated as first-class requirements.

> Every integration is optional. With no environment variables the store runs on a built-in, deterministic 50,000-product catalogue. Checkout and accounts then show a clear "not enabled" notice. **The app never simulates a successful payment.**

---

## Features

| Area | What's included |
| --- | --- |
| **Design** | Editorial design (cream, sand and burgundy): full-bleed split hero with a transparent header, oversized thin-serif wordmark, category bento grid, burgundy "ritual" band, real product and editorial photography |
| **Motion** | Framer Motion (`motion`): masked headline reveals, a slow settle on the hero image, scroll-triggered reveals, an animated cart badge, a slide-over bag, gallery crossfades. Feature-lazy-loaded and honours "reduce motion" |
| **Market** | Built for Nigeria: prices in Naira (₦, stored in kobo), 7.5% VAT included, free nationwide delivery over ₦100,000 (otherwise ₦3,500), checkout with all 36 states plus the FCT and validated Nigerian phone numbers |
| **Storefront** | Homepage, full catalogue, 8 category pages, product detail pages with size variants, related products, search |
| **Discovery** | Faceted filters (category, skin type, concern, price band, stock), 5 sort orders, link-based pagination across 2,084 pages |
| **Cart** | Slide-over bag drawer and full bag page, "quick add" on product cards, persistent storage (localStorage, synced across tabs), quantity limits, free-delivery progress, server-side re-pricing |
| **Checkout** | Server-validated delivery form, Stripe-hosted payment page, signature-verified webhook, idempotent order state machine |
| **Accounts** | Supabase email/password auth, protected account area, order history and order detail (Row Level Security) |
| **SEO** | Per-page metadata, canonical URLs, Open Graph images, JSON-LD (Organization, WebSite + SearchAction, Product, BreadcrumbList, ItemList), sitemap index split into 10k-URL chunks, robots.txt, web manifest |
| **Performance** | Partial Prerendering, `"use cache"` data caching with tag revalidation, prerendered top products, preloaded LCP images, code-split client islands, self-hosted fonts |
| **Accessibility** | Semantic landmarks, skip link, keyboard-operable controls, native `<dialog>` menu, labelled forms with inline errors, live regions, reduced-motion support, AA colour contrast |
| **Resilience** | Route-level loading skeletons, error boundaries with retry, a global error boundary, not-found pages, forms that work without JavaScript |
| **Quality** | 85 unit/component tests (Vitest), 46 end-to-end checks on desktop and mobile (Playwright), GitHub Actions CI |

## Tech stack

- **Framework:** Next.js 16.4 (App Router, Turbopack, Cache Components, Partial Prefetching), React 19.3
- **Language / styling:** TypeScript (strict), Tailwind CSS v4 with design tokens
- **Animation:** Motion (Framer Motion) with `LazyMotion` + `m` components
- **Data / auth:** Supabase (Postgres, Auth, Row Level Security) via `@supabase/ssr`
- **Payments:** Stripe Checkout (hosted, PCI-DSS Level 1) and webhooks
- **Validation:** Zod on every server boundary
- **Testing:** Vitest and Testing Library (unit/component), Playwright (end-to-end)

---

## Getting started

### Prerequisites

- Node.js **22** (see `.nvmrc`; 20.9+ works)
- npm 10+

### Run locally (no accounts needed)

```bash
git clone <your-fork-url> maison-aura
cd maison-aura
npm install
cp .env.example .env.local     # optional; every value can stay empty
npm run dev                    # http://localhost:3000
```

This gives you the full browsing experience: catalogue, search, filters, product pages and bag. Checkout and accounts explain that they are not enabled until you add keys.

### Enable accounts and orders (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: paste [`supabase/migrations/20261015000000_initial_schema.sql`](supabase/migrations/20261015000000_initial_schema.sql) into the SQL editor and run it, or run `supabase db push` with the Supabase CLI.
3. In `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` (Project Settings → API).
4. Configure Auth (Authentication → URL Configuration):
   - **Site URL:** `http://localhost:3000` (your production URL when deployed)
   - **Redirect URLs:** add `http://localhost:3000/auth/confirm` and `https://<your-domain>/auth/confirm`
   - Optional: in the *Confirm signup* email template, use
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account`
5. *(Optional)* Serve the catalogue from Postgres instead of memory:
   ```bash
   npm run db:seed              # upserts 8 categories + 50,000 products in batches of 1,000
   ```
   Then set `CATALOG_SOURCE=supabase`.

### Enable payments (Stripe)

1. Copy your **test-mode** secret key (`sk_test_…`) into `STRIPE_SECRET_KEY`.
2. Forward webhooks locally with the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/payment
   ```
   Copy the printed `whsec_…` value into `STRIPE_WEBHOOK_SECRET`.
3. Restart the dev server. At checkout, pay with the test card `4242 4242 4242 4242`, any future expiry date and any CVC.

Checkout charges in **NGN**, which Stripe supports as a presentment currency. Stripe does not onboard merchant accounts registered in Nigeria, so a Nigerian business going live would usually swap in **Paystack** or **Flutterwave**. The payment layer is isolated in `src/app/lib/payment.ts` and `api/webhooks/payment`, so that swap does not touch the rest of the app.

Stripe processes test payments for real in test mode; nothing is mocked. An order is only marked as paid after Stripe confirms the payment.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next.js Core Web Vitals + TypeScript rules) |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:coverage` | Unit tests with V8 coverage |
| `npm run test:e2e` | Playwright end-to-end tests (builds and starts the app) |
| `npm run verify` | Lint, typecheck, test and build: everything CI runs |
| `npm run db:seed` | Seed Supabase with the demo catalogue |

Playwright can also run against a server that is already running: `PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e`. To include the Stripe redirect tests, set `E2E_STRIPE_ENABLED=1` against a server that has test keys.

---

## Architecture

```
src/
├── proxy.ts                  # Next.js Proxy (formerly middleware): Supabase session refresh + account guard
└── app/
    ├── components/           # All reusable UI
    │   ├── layout/           # Navbar, HeaderShell, Footer, MobileMenu, PolicyPage
    │   ├── motion/           # MotionProvider (LazyMotion), Reveal
    │   ├── home/             # Hero, Marquee, FeaturedProducts, EditorialSplit, CategoryShowcase, Newsletter
    │   ├── products/         # ProductCard, ProductGrid, ProductListing, ProductFilters, ProductSort, …
    │   ├── cart/             # AddToCartButton, QuickAddButton, CartDrawer, CartItem, CartSummary, CartBadge, CartView
    │   ├── checkout/         # CheckoutForm, ShippingForm, OrderSummary
    │   ├── account/          # LoginForm, RegisterForm, AccountMenu, OrderList, …
    │   └── ui/               # Button, Input, Skeleton, EmptyState, ErrorMessage, Pagination, …
    ├── (routes)              # products, categories, search, cart, checkout, account, policies
    ├── api/                  # checkout, webhooks/payment, revalidate
    ├── actions/              # Server Actions: cart, checkout, auth, newsletter
    ├── data/                 # Categories, photography map, deterministic 50k-product catalogue generator
    ├── lib/
    │   ├── catalog/          # CatalogRepository interface + demo and Supabase implementations
    │   ├── supabase/         # browser / server / admin clients
    │   ├── products.ts       # Cached catalogue facade ("use cache" + cacheTag)
    │   ├── checkout.ts       # Shared checkout pipeline
    │   ├── payment.ts        # Stripe integration
    │   ├── orders.ts         # Order reads (RLS) and trusted writes
    │   ├── seo.ts            # Metadata builder + JSON-LD
    │   └── query.ts, validations.ts, currency.ts, pricing.ts, …
    ├── hooks/ providers/ types/
    ├── cart-store.ts         # Pure cart reducer + external store
    ├── sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
    └── layout.tsx, page.tsx, loading.tsx, error.tsx, global-error.tsx, not-found.tsx
supabase/migrations/          # SQL schema, indexes and RLS policies
scripts/                      # Database seeder
public/images/                # Product & editorial photography (see CREDITS.md)
tests/unit, tests/e2e         # Vitest and Playwright suites
```

### Key decisions

**A catalogue that scales to 50,000+ products.** Pages depend only on a `CatalogRepository` interface. The demo implementation pre-computes one sorted index per sort order, so filtering a page is a single linear pass (a few milliseconds for 50k rows; covered by a unit test). The Supabase implementation uses composite B-tree indexes for every sort order, GIN indexes for array facets, and a generated `tsvector` column for full-text search. Pagination is link-based, so crawlers can reach every product. Deep offsets are capped to protect the database.

**Caching and ISR (Cache Components).** The catalogue facade wraps each query in `"use cache"` with `cacheLife("hours")` and a `products` / `product:<slug>` cache tag. The 48 most popular product pages and all category shells are prerendered at build time. The remaining ~50,000 product pages render on first request and are then cached and revalidated in the background. `POST /api/revalidate` (protected by a bearer secret) refreshes one product or the whole catalogue on demand, for example from a Supabase database webhook. Request-specific UI (filters from `searchParams`, sessions) streams behind `<Suspense>` boundaries, so the static shell (header, headings, skeletons) is served from the CDN straight away.

**Payment security.** The browser sends only product IDs, variant IDs and quantities. The server validates them with Zod, re-prices everything from the catalogue (never trusting client prices), creates a `pending` order and redirects the customer to Stripe Checkout. Orders move to `paid` only when Stripe confirms it, either through a signature-verified webhook or a server-side session lookup on the success page. Both paths are idempotent and guarded by an explicit state machine (`lib/order-status.ts`), so retries and reloads are safe. The success page cannot be spoofed by editing the URL.

**Auth and data security.** Sessions use `@supabase/ssr` cookies. The server identifies users with `getClaims()`, which verifies the JWT, rather than trusting `getSession()`. Row Level Security is the security boundary: catalogue tables are read-only to the public, and customers can read only their own orders. All writes go through server-only modules that import `server-only`, so the secret key cannot be bundled into client code. Redirect targets are allow-listed to prevent open redirects, the JSON checkout API rejects cross-origin requests, and security headers (HSTS, `X-Frame-Options`, `nosniff`, Referrer and Permissions policies) are set globally.

**Core Web Vitals.**
- *LCP:* above-the-fold images use `preload` and appear in the static shell.
- *CLS:* every image has a fixed aspect ratio, skeletons mirror the final layout, and fonts are self-hosted with `next/font`.
- *INP:* filters use transitions; no heavy library is loaded on first paint. The Supabase SDK is code-split and loaded only after hydration, Zod never reaches the browser, and Motion loads only its DOM animation features through `LazyMotion`.
- *Images:* photos are stored locally and served by `next/image` as AVIF/WebP at responsive sizes. The hero image animates scale only (never opacity), so it still counts as the LCP element straight away.

**Accessibility.**
- Semantic landmarks and a skip link.
- Labelled `fieldset`/`legend` filter groups.
- The mobile menu is a native `<dialog>`, which provides focus trapping and Escape-to-close.
- Ratings, prices and status updates have screen-reader text and live regions.
- Visible focus rings, reduced-motion support, and colour tokens checked against WCAG AA.
- Search, filters, sort and pagination all work without JavaScript.

### Deviations from the requested folder structure

- `src/proxy.ts` sits beside `app/` because Next.js requires the Proxy (formerly Middleware) file at that level.
- A few files were added where they made the code clearer:
  - `lib/catalog/*` for the repository pattern
  - `lib/query.ts`, a zod-free query parser that is safe to ship to the browser
  - `lib/checkout.ts`, the pipeline shared by the Server Action and the JSON API
  - `actions/auth.ts`
  - `api/revalidate` and `auth/confirm`
  - `supabase/` and `scripts/` at the project root

---

## Deploying to Vercel

1. Push the repository to GitHub and import it at [vercel.com/new](https://vercel.com/new). The framework is detected automatically, so no `vercel.json` is needed.
2. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**. Mark `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `REVALIDATE_SECRET` as **Sensitive**. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. In Stripe, add a webhook endpoint at `https://<your-domain>/api/webhooks/payment` that listens for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`. Use its signing secret for `STRIPE_WEBHOOK_SECRET`.
4. In Supabase Auth, add your production Site URL and the `/auth/confirm` redirect URL.
5. Deploy. Preview deployments automatically use their own URL for canonical links and Stripe redirects.

## Known limitations and trade-offs

- **Demo content.** Products are procedurally generated from a seeded PRNG. Photography comes from a curated pool of Unsplash images (free for commercial use; credits in [`public/images/CREDITS.md`](public/images/CREDITS.md)), so many products share photos. Editorial and model photography features Black women, reflecting the Nigerian customer base. Shots showing third-party brands were excluded. Ratings and review counts are illustrative.
- **Not-found status under Partial Prerendering.** Unknown products and out-of-range pages render a not-found page with `<meta name="robots" content="noindex">`. Because the static shell may already be streaming, the HTTP status can be `200` instead of `404`. Search engines honour the `noindex` directive. Unknown categories return a real `404`.
- **Orders need Supabase.** With Stripe configured but no Supabase secret key, payments still work, but orders are recorded only in Stripe.
- **Not yet included:** rate limiting on Server Actions (add one at the edge, e.g. Vercel Firewall or Upstash), Stripe Tax, inventory reservation, and transactional emails beyond Stripe receipts.
- `npm audit` reports advisories in `eslint-config-next`'s transitive dev dependencies. They do not ship to production.

## License

MIT. Built as a portfolio project.
