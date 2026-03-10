create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references public.produtos(id),
  created_at timestamp with time zone default now()
);

create index if not exists idx_product_views_produto_id_created_at
  on public.product_views (produto_id, created_at desc);

update public.produtos
set mais_vendido = true
where id in (
  select produto_id
  from public.product_views
  where created_at > now() - interval '7 days'
    and produto_id is not null
  group by produto_id
  having count(*) > 20
);
