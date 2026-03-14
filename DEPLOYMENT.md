# Deploy Platinum for free

This is a Vite + React app. Build with:

```bash
npm run build
```

The output goes to `dist/`. Deploy that folder (or connect your repo) to any of these **free** hosts.

## Recommended (easiest)

| Platform        | Free tier        | Notes |
|----------------|------------------|--------|
| **Vercel**     | Yes              | Connect GitHub repo → auto deploy on push. Set root to project folder if needed. |
| **Netlify**    | Yes              | Drag-and-drop `dist` or connect Git. Add build command `npm run build`, publish directory `dist`. |
| **Cloudflare Pages** | Yes   | Connect Git or upload `dist`. Build: `npm run build`, output: `dist`. |

## Steps (e.g. Vercel)

1. Push your code to **GitHub** (if not already).
2. Go to [vercel.com](https://vercel.com) → Sign in with GitHub.
3. **Add New Project** → Import your repo.
4. **Build settings:** Framework Preset: Vite. Build command: `npm run build`. Output: `dist`. Leave root as `.`
5. Add **Environment Variables** if you use any (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the project.
6. Deploy. You get a URL like `your-project.vercel.app`.

For **Netlify** or **Cloudflare Pages**, use the same build command and output directory; both support connecting the repo for automatic deploys on push.

## Other free options

- **GitHub Pages** – Use the `gh-pages` package or GitHub Actions to build and publish from `dist`. You’ll need to set `base` in `vite.config.js` to your repo path (e.g. `'/Crypto/'`).
- **Render** – Static Site → connect repo, build command `npm run build`, publish directory `dist`.

## Supabase

Your Supabase project is separate from the host. Keep the same env vars in the host’s dashboard so the deployed app talks to your existing database and auth.
