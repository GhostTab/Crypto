# Product suggestions – Crypto app

As a product manager, here are focused suggestions to make the project better for users and the business.

---

## 1. **Discovery & onboarding**

- **Hero CTA**: Add a secondary action next to “Search” (e.g. “Explore market” or “See top coins”) so new users have a clear next step.
- **Empty states**: When watchlist or alerts are empty, add one primary action (e.g. “Add your first coin” / “Create your first alert”) instead of only text.
- **First-time tooltips**: Optional short tooltip on first visit (e.g. “Search or tap a row to see details”) with a “Don’t show again” preference.

---

## 2. **Trust & clarity**

- **Data source**: Show “Data via CoinGecko” (or your provider) in the footer or near tables so users know where prices come from.
- **Last updated**: Display “Updated X min ago” for the list so users trust freshness and know when to refresh.
- **Error messages**: Replace generic “Sign in failed” / “Failed to add alert” with specific, actionable copy (e.g. “Wrong password” or “This coin ID isn’t supported”).

---

## 3. **Engagement & retention**

- **Portfolio snapshot**: On Home or a dedicated section, show “Your watchlist summary” (total value, 24h change) so returning users get immediate value.
- **Alert confirmation**: After creating an alert, show a small toast or inline message: “We’ll notify you when Bitcoin goes above $X.”
- **Re-engagement**: If a user hasn’t visited in a while, a lightweight banner or email: “Your watchlist moved X% this week.”

---

## 4. **Usability**

- **Keyboard & a11y**: Ensure tab order is logical (nav → search → table rows), support Enter on search and on table rows, and keep focus visible for keyboard users.
- **Loading states**: Use skeletons or row placeholders for the table instead of only “Loading...” so the layout doesn’t jump.
- **Mobile**: Confirm tap targets (buttons, table rows, stars) are at least ~44px and that the table scrolls horizontally or stacks on small screens if needed.

---

## 5. **Scope & prioritization**

| Priority | Suggestion                         | Why |
|----------|------------------------------------|-----|
| P1       | Data source + “Updated X ago”      | Trust and clarity with minimal effort |
| P1       | Clear error messages (auth, alerts)| Fewer support questions, better UX |
| P2       | Portfolio summary for watchlist    | Strong reason to return |
| P2       | Table loading skeletons            | Feels faster and more polished |
| P3       | Secondary hero CTA                | Better conversion for new users |
| P3       | Optional onboarding tooltip       | Helps new users without annoying power users |

---

## 6. **Metrics to consider**

- **Activation**: % of visitors who search or open at least one coin.
- **Engagement**: Watchlist size, alerts created, return visits per week.
- **Outcomes**: Sign-up rate, alert creation rate, retention (e.g. D7).

These suggestions keep the current scope and focus on clarity, trust, and small wins that improve both experience and product health.

---

## 7. **Features that would be useful to users**

Ideas that add clear value and are feasible with the current stack (CoinGecko, Supabase, React):

| Feature | What it does | Why it’s useful |
|--------|----------------|------------------|
| **Price history chart** | 7d / 30d / 90d chart on the coin detail page (e.g. CoinGecko `coins/{id}/market_chart`) | Users see trend at a glance instead of only current price and 24h %. |
| **Portfolio value over time** | Simple line chart of “total watchlist value” over last 7–30 days (using stored snapshots or historical API if available) | Gives a sense of performance and encourages return visits. |
| **Compare two coins** | Side‑by‑side: price, 24h %, market cap, maybe a small chart for two selected coins | Helps decide between similar assets without opening multiple tabs. |
| **Export** | Export watchlist or alerts to CSV | Backup, sharing, or use in spreadsheets. |
| **Browser push when alert triggers** | Backend (e.g. cron + Supabase) checks prices vs alerts and sends push/email when condition is met | Makes “price alerts” actually deliver; currently alerts are stored but no delivery is implied. |
| **Search/autocomplete in nav** | Global search that jumps to a coin (by name or symbol) | Faster than going to Market and scrolling. |
| **Default view (e.g. “Top 10”)** | Remember “show top 10” vs “show top 50” or “all” on Home/Market | Reduces scroll and fits different user habits. |
| **Coin news or links** | On coin page: “News” or “Community” links (CoinGecko or third‑party) | Context without leaving the app. |

**Suggested order to build:** (1) Price history chart on coin page, (2) backend + push/email for alert triggers, (3) Compare two coins, (4) Export CSV.
