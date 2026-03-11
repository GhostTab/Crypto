-- Run this in Supabase SQL Editor if watchlist INSERT fails (RLS).
-- Adds WITH CHECK so inserts are allowed for the user's own user_id.

drop policy if exists "Users can manage own watchlist" on public.watchlist;
create policy "Users can manage own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
