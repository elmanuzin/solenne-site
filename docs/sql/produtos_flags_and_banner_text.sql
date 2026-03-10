alter table public.produtos
add column if not exists destaque boolean default false,
add column if not exists novidade boolean default false,
add column if not exists mais_vendido boolean default false;

alter table public.site_config
add column if not exists banner_title text,
add column if not exists banner_subtitle text;

update public.site_config
set
  banner_title = coalesce(nullif(trim(banner_title), ''), 'Nova coleção Solenne'),
  banner_subtitle = coalesce(nullif(trim(banner_subtitle), ''), 'Peças elegantes para todas as ocasiões');
