# Deploy Platinum

## 1. Build locally (optional check)

```bash
npm run build
```

Output is in `dist/`. The repo includes `vercel.json` and `netlify.toml` so Vercel/Netlify will use the right build settings when you connect the repo.

---

## 2. Push to GitHub

If the project isn’t on GitHub yet:

```bash
git add .
git commit -m "Prepare for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name. Create the repo on GitHub first (empty, no README).

---

## 3. Deploy on Vercel (recommended)

1. Go to **[vercel.com](https://vercel.com)** and sign in with **GitHub**.
2. Click **Add New…** → **Project**.
3. **Import** your `Crypto` (or repo) repository.
4. Vercel will read `vercel.json`; leave **Root Directory** as `.` and **Framework** as Vite.
5. **Environment variables** (required for Supabase):
   - **Name:** `VITE_SUPABASE_URL` → **Value:** your Supabase project URL (from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API).
   - **Name:** `VITE_SUPABASE_ANON_KEY` → **Value:** your Supabase anon/public key (same page).
6. Click **Deploy**. When it finishes, you’ll get a URL like `crypto-xxx.vercel.app`.

Do **not** commit your `.env` file (it’s in `.gitignore`).

---

## 4. Deploy on Netlify (alternative)

1. Go to **[netlify.com](https://netlify.com)** and sign in with **GitHub**.
2. **Add new site** → **Import an existing project** → choose **GitHub** and your repo.
3. Netlify will use `netlify.toml` (build: `npm run build`, publish: `dist`).
4. Under **Site settings** → **Environment variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL  
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key  
5. **Deploy**. Your site will be at `something.netlify.app`.

---

## 5. After deploy

- **Supabase:** In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**, add your production URL (e.g. `https://crypto-xxx.vercel.app`) to **Redirect URLs** (and **Site URL** if you use it) so sign-in and sign-out work.
- Every push to `main` will trigger a new deploy on Vercel or Netlify.
