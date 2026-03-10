create table if not exists public.site_config (
  id uuid primary key default gen_random_uuid(),
  banner_url text,
  created_at timestamp with time zone not null default now()
);

insert into public.site_config (banner_url)
select '/bannersolenesite.jpeg'
where not exists (select 1 from public.site_config);
