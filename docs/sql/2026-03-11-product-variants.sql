-- Solenne: suporte a múltiplas cores, múltiplas imagens e estoque por cor

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.produtos(id) on delete cascade,
  color text not null,
  stock integer not null default 0,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.variant_sizes (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  size text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.produtos(id) on delete cascade,
  variant_id uuid null references public.product_variants(id) on delete set null,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_variant_sizes_variant_id on public.variant_sizes(variant_id);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_variant_id on public.product_images(variant_id);
