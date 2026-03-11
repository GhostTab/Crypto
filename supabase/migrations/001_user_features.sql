-- =============================================================================
-- Crypto app – Supabase schema for logged-in user features
-- Run in Supabase SQL Editor (in order).
-- =============================================================================

-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. PROFILES (1:1 with auth.users – preferences & display info)
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  currency text not null default 'usd' check (currency in ('usd', 'eur', 'php')),
  email_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile and preferences; id = auth.users.id';

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- =============================================================================
-- 2. WATCHLIST (favorite coins)
-- =============================================================================
create table if not exists public.watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  coin_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, coin_id)
);

create index if not exists watchlist_user_id_idx on public.watchlist (user_id);
create index if not exists watchlist_coin_id_idx on public.watchlist (coin_id);

comment on table public.watchlist is 'Coins the user has added to their watchlist (e.g. bitcoin, ethereum).';

alter table public.watchlist enable row level security;

drop policy if exists "Users can manage own watchlist" on public.watchlist;
create policy "Users can manage own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- 3. PRICE ALERTS (notify when price crosses a target)
-- =============================================================================
create table if not exists public.price_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  coin_id text not null,
  condition text not null check (condition in ('above', 'below')),
  target_price numeric not null check (target_price > 0),
  currency text not null default 'usd' check (currency in ('usd', 'eur', 'php')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  triggered_at timestamptz
);

create index if not exists price_alerts_user_id_idx on public.price_alerts (user_id);
create index if not exists price_alerts_coin_active_idx on public.price_alerts (coin_id, is_active) where is_active = true;

comment on table public.price_alerts is 'User-defined price alerts; set triggered_at when fired and optionally is_active = false.';

alter table public.price_alerts enable row level security;

drop policy if exists "Users can manage own price alerts" on public.price_alerts;
create policy "Users can manage own price alerts"
  on public.price_alerts for all
  using (auth.uid() = user_id);

-- =============================================================================
-- 4. NOTIFICATIONS (in-app notification feed)
-- =============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('price_alert', 'system', 'product')),
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  data jsonb default '{}'
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_read_at_idx on public.notifications (user_id, read_at);

comment on table public.notifications is 'In-app notification history; data can store coin_id, alert_id, link, etc.';

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications (e.g. mark read)" on public.notifications;
create policy "Users can update own notifications (e.g. mark read)"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Only the app (or triggers) insert; users don't insert their own notification rows
drop policy if exists "Service role or triggers insert notifications" on public.notifications;
create policy "Service role or triggers insert notifications"
  on public.notifications for insert
  with check (auth.uid() = user_id);

-- =============================================================================
-- 5. PORTFOLIO (optional – track holdings only; no buying/selling in this app)
-- =============================================================================
create table if not exists public.portfolio (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  coin_id text not null,
  amount numeric not null check (amount >= 0),
  buy_price_avg numeric check (buy_price_avg >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_user_id_idx on public.portfolio (user_id);

comment on table public.portfolio is 'User holdings per coin (tracking only). No buy/sell in-app – user enters positions held elsewhere; buy_price_avg used for P&L.';

alter table public.portfolio enable row level security;

drop policy if exists "Users can manage own portfolio" on public.portfolio;
create policy "Users can manage own portfolio"
  on public.portfolio for all
  using (auth.uid() = user_id);

drop trigger if exists portfolio_updated_at on public.portfolio;
create trigger portfolio_updated_at
  before update on public.portfolio
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Optional: function to create a notification when an alert is triggered
-- (Call this from your backend/cron when you detect price crossed target.)
-- =============================================================================
-- create or replace function public.notify_price_alert_triggered(
--   p_alert_id uuid,
--   p_user_id uuid,
--   p_coin_id text,
--   p_title text,
--   p_body text
-- )
-- returns uuid as $$
-- declare
--   v_id uuid;
-- begin
--   insert into public.notifications (user_id, type, title, body, data)
--   values (p_user_id, 'price_alert', p_title, p_body, jsonb_build_object('alert_id', p_alert_id, 'coin_id', p_coin_id))
--   returning id into v_id;
--   update public.price_alerts set triggered_at = now(), is_active = false where id = p_alert_id;
--   return v_id;
-- end;
-- $$ language plpgsql security definer;
