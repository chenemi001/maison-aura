-- =============================================================================
-- Maison Aura — initial schema
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  slug        text primary key,
  name        text not null,
  tagline     text not null default '',
  description text not null default '',
  image       text not null,
  position    int  not null default 0
);

create table if not exists public.products (
  id               text primary key,
  slug             text not null unique,
  name             text not null,
  category_slug    text not null references public.categories (slug),
  description      text not null default '',
  how_to_use       text not null default '',
  ingredients      text[] not null default '{}',
  skin_types       text[] not null default '{}',
  concerns         text[] not null default '{}',
  price_cents      int  not null check (price_cents > 0),
  compare_at_cents int  check (compare_at_cents is null or compare_at_cents > price_cents),
  rating           numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count     int  not null default 0 check (review_count >= 0),
  image            text not null,
  images           text[] not null default '{}',
  badge            text check (badge in ('New', 'Bestseller', 'Limited')),
  in_stock         boolean not null default true,
  popularity       int  not null default 0,
  variants         jsonb not null default '[]'::jsonb,
  search_terms     text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Full-text search vector, maintained by Postgres.
  search tsvector generated always as (
    to_tsvector('english'::regconfig, name || ' ' || category_slug || ' ' || search_terms)
  ) stored
);

-- Indexes chosen for the storefront's access patterns over 50k+ rows.
create index if not exists products_category_popularity_idx on public.products (category_slug, popularity desc, id);
create index if not exists products_popularity_idx on public.products (popularity desc, id);
create index if not exists products_created_at_idx on public.products (created_at desc, id);
create index if not exists products_price_idx on public.products (price_cents, id);
create index if not exists products_rating_idx on public.products (rating desc, review_count desc, id);
create index if not exists products_search_idx on public.products using gin (search);
create index if not exists products_skin_types_idx on public.products using gin (skin_types);
create index if not exists products_concerns_idx on public.products using gin (concerns);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users (id) on delete set null,
  email                     text not null,
  status                    text not null default 'pending'
                            check (status in ('pending', 'paid', 'fulfilled', 'failed', 'cancelled', 'refunded')),
  currency                  text not null default 'gbp',
  subtotal_cents            int  not null check (subtotal_cents >= 0),
  shipping_cents            int  not null check (shipping_cents >= 0),
  total_cents               int  not null check (total_cents >= 0),
  shipping_address          jsonb,
  stripe_session_id         text unique,
  stripe_payment_intent_id  text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id                bigint generated always as identity primary key,
  order_id          uuid not null references public.orders (id) on delete cascade,
  product_id        text not null,
  product_slug      text not null,
  name              text not null,
  variant_id        text not null,
  variant_label     text not null,
  image             text not null,
  unit_price_cents  int  not null check (unit_price_cents >= 0),
  quantity          int  not null check (quantity between 1 and 10)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  email       text primary key,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The browser only ever holds the publishable key, so RLS is the security
-- boundary. Catalogue data is public and read-only; customers can read only
-- their own orders. All writes go through trusted server code using the
-- secret key (which bypasses RLS) — there are deliberately no insert/update
-- policies for anonymous or authenticated users.
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select to anon, authenticated using (true);

drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select to anon, authenticated using (true);

drop policy if exists "Customers can read their own orders" on public.orders;
create policy "Customers can read their own orders"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can read items of their own orders" on public.order_items;
create policy "Customers can read items of their own orders"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));

-- newsletter_subscribers: no policies → only the server (secret key) can access it.
