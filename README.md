# Taman Safari Indonesia — Annual Pass Frontend

Monorepo for TSI's Annual Pass Phase 1 frontend — three surfaces backed by MSW so the whole thing runs end-to-end with no backend.

See the strategy doc: `~/Downloads/TSI_AnnualPass_Design_and_Strategy_v0.2.md`.

## Apps

- **`apps/member`** — Member PWA. Enrolment, profile, pass status, rotating dynamic QR (offline-tolerant), perks, events, promotions, notifications. Dev: <http://localhost:5173>.
- **`apps/validator`** — Gate Validator. Scans the QR, three-tier validation (online → cached/offline → manual), batch-processing offline queue, reports, attendance. Dev: <http://localhost:5174>.
- **`apps/admin`** — Admin Console. Semi-ERP — members/passes/redemptions, staff/shifts/bookings, animals/safety/compliance, finance/inventory/vendors/marketing, gate map, audit/SLA/reconciliation, Member-app CMS, extended master data. Dev: <http://localhost:5175>.

## Shared packages

- `@tsi/ui` — shadcn primitives + branded variants + AppSwitcher
- `@tsi/api-client` — typed WIT API SDK (ky + zod + TanStack Query keys)
- `@tsi/tokens` — design tokens → Tailwind preset
- `@tsi/i18n` — shared locale keys (id-ID default, en-US fallback)
- `@tsi/qr-core` — framework-agnostic token-buffer + Ed25519 verify + jti replay
- `@tsi/offline-storage` — Dexie schemas
- `@tsi/platform-adapters` — Camera / Storage / Share / Lifecycle interfaces (Capacitor-ready)
- `@tsi/test-utils` — MSW handlers, RTL helpers, fixtures

## Quickstart

```bash
nvm use            # picks up .nvmrc -> Node 20.x
corepack enable    # pnpm shipped with Node
pnpm install
pnpm dev           # runs all three apps in parallel
```

- Member: <http://localhost:5173>
- Validator: <http://localhost:5174>
- Admin: <http://localhost:5175>

Each app's TopBar has an "Apps" switcher and each login screen has an inline 3-card picker.

## Scripts

```bash
pnpm dev           # turbo run dev — all three apps
pnpm build         # turbo run build — emits dist/{member,validator,admin}
pnpm lint          # biome check
pnpm typecheck     # tsc --noEmit across the workspace
pnpm test          # vitest run
pnpm test:e2e      # playwright
```

## Deploying to Vercel — single root, three apps under one domain

The repo is configured to deploy as **one** Vercel project. Three apps land under path prefixes on the same origin:

```
your-app.vercel.app/              → landing page (3 cards)
your-app.vercel.app/member/       → Member PWA
your-app.vercel.app/validator/    → Gate Validator
your-app.vercel.app/admin/        → Admin Console
```

**Setup**
1. New Vercel project → Import this Git repo.
2. Leave Framework Preset as **Other** (vercel.json sets everything).
3. Root Directory: leave at repo root.
4. No environment variables required — MSW is enabled by default until a real backend is wired (set `VITE_USE_MOCKS=false` per app then to opt out).
5. Deploy.

**What the root `vercel.json` does**
- `buildCommand: pnpm turbo run build && cp tools/landing/index.html dist/index.html` — builds all three apps and drops in the landing page.
- `installCommand: pnpm install --frozen-lockfile` — Vercel auto-detects pnpm from `packageManager` in `package.json`.
- `outputDirectory: dist` — Vite is configured (per app) to emit `dist/<app>` at the repo root in production.
- `rewrites` — each `/<app>/(.*)` → `/<app>/index.html` for SPA deep-linking.
- `headers` — sets `Service-Worker-Allowed: /` on each MSW worker so it can claim its prefix.

**How each app is wired for the prefix** (only kicks in when `NODE_ENV=production`):
- `vite.config.ts`: `base: '/<app>/'`, `build.outDir: '../../dist/<app>'`.
- `src/router.tsx`: reads `import.meta.env.BASE_URL` as the React Router `basename`.
- `src/main.tsx`: registers the MSW worker at `BASE_URL + 'mockServiceWorker.js'` so its default scope matches the prefix.
- `.env.production`: `VITE_API_BASE_URL=/<app>/api/v1` so API calls fall under the worker's scope.

Dev mode (per-app on its own port) is unchanged — the prefix logic only flips on prod builds.

## Stack

Vite 5 · React 18 · TypeScript 5.5 · Tailwind 3.4 · shadcn/ui · TanStack Query v5 · React Router v6 · Zustand · react-hook-form + zod · react-i18next (id-ID default) · Dexie · MSW · Vitest · Playwright · Biome · Turborepo · pnpm workspaces.
