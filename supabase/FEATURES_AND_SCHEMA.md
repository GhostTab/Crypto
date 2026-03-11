# Logged-in user features & Supabase schema

## Features for logged-in users

| Feature | Description |
|--------|-------------|
| **Persistent currency** | Preferred currency (USD/EUR/PHP) saved and restored on login. |
| **Watchlist / Favorites** | Save coins to a personal watchlist and view them in one place. |
| **Price alerts** | “Notify me when Bitcoin goes above $X or below $Y.” Alerts can be email and/or in-app. |
| **In-app notifications** | Notification center for price alerts triggered, important updates, and (optional) product news. |
| **Portfolio (optional)** | **Track** holdings (amount + average buy price) for P&amp;L. Users **cannot buy or sell** coins in the app; they enter positions they hold elsewhere. |

---

## Supabase tables (summary)

| Table | Purpose |
|-------|---------|
| **profiles** | One row per user (id = `auth.users.id`). Stores `display_name`, `avatar_url`, `currency`, `email_notifications`. |
| **watchlist** | User’s favorite coins. Columns: `user_id`, `coin_id` (e.g. `bitcoin`), `created_at`. Unique on `(user_id, coin_id)`. |
| **price_alerts** | Price alert rules. Columns: `user_id`, `coin_id`, `condition` (above/below), `target_price`, `currency`, `is_active`, `triggered_at`. |
| **notifications** | In-app notification feed. Columns: `user_id`, `type` (price_alert/system/product), `title`, `body`, `read_at`, `data` (jsonb). |
| **portfolio** | Optional: **track** holdings only (no buy/sell). Columns: `user_id`, `coin_id`, `amount`, `buy_price_avg`, `notes`. User enters positions held elsewhere for P&amp;L. |

All tables use **Row Level Security (RLS)** so users only access their own rows. A trigger creates a **profile** row when a new user signs up.

---

## Database: Supabase (PostgreSQL)

Supabase already provides **`auth.users`**. The tables below live in the **`public`** schema and are meant to be used with **Row Level Security (RLS)** so each user only sees their own data.

Run the SQL in **`supabase/migrations/001_user_features.sql`** via the **Supabase Dashboard → SQL Editor** (run the whole file in order).

If you already ran an older version of `001_user_features.sql` and **adding to watchlist fails** (e.g. RLS error on insert), run **`supabase/migrations/002_watchlist_rls_with_check.sql`** in the SQL Editor to add `WITH CHECK` to the watchlist policy.
