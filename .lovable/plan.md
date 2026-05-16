# Deploy CoachRony to Vercel

## Problem

The site at `coachronyacademy.vercel.app` returns `404: NOT_FOUND` on every path. Root cause:

- The project is **TanStack Start** (SSR framework) configured for **Cloudflare Workers** (`src/server.ts` + `wrangler.jsonc`).
- `vercel.json` tells Vercel to serve only the static `dist/client` folder with `framework: null`. There is no server runtime on Vercel, so every TanStack route 404s.
- The current Vite config uses `@lovable.dev/vite-tanstack-config`, which bundles the Cloudflare plugin and emits a Cloudflare Worker — not a Vercel-compatible output.

## Goal

Make `coachronyacademy.vercel.app` (and any custom domain on Vercel) serve the full SSR app, including `/`, `/student`, `/admin`, server functions, and API routes.

## Approach

Switch TanStack Start's build **target** from Cloudflare to Vercel so it emits a Vercel-compatible serverless function + static assets. Update `vercel.json` so Vercel picks up the generated build.

### Steps

1. **Replace the Vite config wrapper with a direct TanStack Start config.**
   - Stop using `@lovable.dev/vite-tanstack-config` (Cloudflare-locked).
   - Use the official `@tanstack/react-start/plugin/vite` with `target: 'vercel'`.
   - Keep `@tailwindcss/vite`, `vite-tsconfig-paths`, `@` alias.

2. **Remove Cloudflare-only files / settings** that don't apply to Vercel:
   - Delete or ignore `wrangler.jsonc` (keep file but it becomes unused).
   - `src/server.ts` (Cloudflare Worker entry wrapper) is no longer the build entry — TanStack's Vercel preset generates its own serverless entry. We keep the `error-capture` + `error-page` modules, but stop wiring `src/server.ts` as `tanstackStart.server.entry`.

3. **Rewrite `vercel.json`** to a minimal config that lets TanStack's Vercel preset take over (it writes to `.vercel/output` in the [Build Output API v3](https://vercel.com/docs/build-output-api/v3) format that Vercel auto-detects):
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "buildCommand": "npm run build",
     "installCommand": "npm install"
   }
   ```
   Remove `outputDirectory` and `framework: null` — those force static-only serving.

4. **Environment variables on Vercel** (user action, documented in chat):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - Any server-side secrets used by server functions (no `VITE_` prefix).
   These must be added in Vercel → Project → Settings → Environment Variables, then redeploy.

5. **Redeploy on Vercel** — push (or trigger redeploy). Verify `/`, `/login`, `/student`, and an admin route all render.

## Out of scope

- No changes to routes, UI, RLS, or business logic.
- Lovable's own published URL (`coachronyacademy.lovable.app`) keeps working alongside Vercel — they're independent.

## Risks / notes

- Cloudflare-specific runtime assumptions (e.g. `nodejs_compat`) don't matter on Vercel — Vercel functions run on Node.js, which is more permissive. No code change needed for that.
- If a custom domain is currently pointed at Vercel, no DNS change is required; the deploy itself just needs to succeed.
- After the switch, `wrangler deploy` will no longer work for this project unless the Cloudflare config is restored. We're committing to Vercel as the host.

## Files to change

- `vite.config.ts` — swap wrapper for direct TanStack Start plugin with `target: 'vercel'`.
- `vercel.json` — minimal config, remove `outputDirectory` + `framework: null`.
- `package.json` — ensure `@tanstack/react-start` plugin entry is available (already a dep); add `@vercel/...` only if required by the preset.
