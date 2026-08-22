create extension if not exists pgcrypto;
create table if not exists events(id uuid primary key default gen_random_uuid(),name text not null,start_at timestamptz,end_at timestamptz,created_at timestamptz default now());
create table if not exists passes(id uuid primary key default gen_random_uuid(),event_id uuid references events(id) on delete cascade,name text not null,price integer not null check(price>=0),duration_days integer,active boolean default true);
create table if not exists orders(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),email text not null,pass_id uuid references passes(id),amount integer not null,provider text,provider_order_id text unique,status text not null default 'pending' check(status in ('pending','paid','failed','expired')),created_at timestamptz default now(),paid_at timestamptz);
create table if not exists entitlements(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete cascade,pass_id uuid references passes(id),starts_at timestamptz not null default now(),expires_at timestamptz not null,unique(user_id,pass_id));
create table if not exists streams(id uuid primary key default gen_random_uuid(),event_id uuid references events(id) on delete cascade,title text not null,playback_id text,starts_at timestamptz,ends_at timestamptz,status text default 'scheduled' check(status in ('scheduled','live','ended')));
create index if not exists orders_user_idx on orders(user_id); create index if not exists entitlements_user_idx on entitlements(user_id);

alter table events enable row level security; alter table passes enable row level security; alter table orders enable row level security; alter table entitlements enable row level security; alter table streams enable row level security;
create policy "public can view active passes" on passes for select using (active=true);
create policy "users view own orders" on orders for select using (auth.uid()=user_id);
create policy "users view own entitlements" on entitlements for select using (auth.uid()=user_id);
create policy "public can view events" on events for select using (true);
create policy "public can view scheduled streams" on streams for select using (true);
