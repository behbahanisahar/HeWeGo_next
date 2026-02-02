# Deploy HeWeGo (testing)

Your app is a Vite + React SPA. Push your code to GitHub, then use one of the options below. All support **free tiers** and **GitHub deploy**.

---

## Option 1: Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.
2. **Add New** → **Project** → import your repo `HeWeGo_next`.
3. Leave defaults:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Done.

Your app will be at `https://hewego-next-xxx.vercel.app` (or your custom name).  
SPA routing is handled by `vercel.json` in the repo.

---

## Option 2: Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with **GitHub**.
2. **Add new site** → **Import an existing project** → **GitHub** → choose `HeWeGo_next`.
3. Build settings (usually auto-filled from `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy site**.

Your app will be at `https://something.netlify.app`.  
SPA routing is handled by `netlify.toml` in the repo.

---

## Option 3: GitHub Pages

1. In **vite.config.ts** set `base: '/HeWeGo_next/'` (your repo name) for project pages.
2. Add a GitHub Action to build and push to the `gh-pages` branch (or use `peaceiris/actions-gh-pages`).
3. In repo **Settings** → **Pages** → Source: **GitHub Actions** (or `gh-pages` branch).

URL will be `https://<username>.github.io/HeWeGo_next/`.

---

## Option 4: Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select your repo and branch (`main`).
3. Build: **Framework preset** = None (or Vite), **Build command**: `npm run build`, **Build output**: `dist`.
4. Add a **Redirect rule** so `/*` → `/index.html` (Status 200) for SPA routing.

---

## Option 5: Azure Static Web Apps

See the workflow in `.github/workflows/azure-static-web-apps.yml`. Create a Static Web App in Azure, connect GitHub, and add the deployment token as repo secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.

---

**Note:** The frontend calls `https://hewego.azurewebsites.net` for the API. All of the above serve the same static files; only the host changes.
