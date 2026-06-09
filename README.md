# Taman Safari Indonesia — Annual Pass Frontend

Monorepo for the TSI Annual Pass Phase 1 frontend: a Member PWA and a Gate Validator scanner app.

See the strategy doc: `~/Downloads/TSI_AnnualPass_Design_and_Strategy_v0.2.md`.

## Apps

- **`apps/member`** — Member PWA. Enrolment, profile, pass status, rotating dynamic QR (offline-tolerant). Runs on `http://localhost:5173`.
- **`apps/validator`** — Gate Validator. Scans the QR, three-tier validation (online → cached/offline → manual), queues redemptions. Runs on `http://localhost:5174`.

## Shared packages

- `@tsi/ui` — shadcn primitives + branded variants
- `@tsi/api-client` — typed WIT API SDK (ky + zod + TanStack Query keys)
- `@tsi/tokens` — design tokens → Tailwind preset
- `@tsi/i18n` — shared locale keys
- `@tsi/qr-core` — framework-agnostic token-buffer + Ed25519 verify + jti replay
- `@tsi/offline-storage` — Dexie schemas
- `@tsi/platform-adapters` — Camera / Storage / Share / Lifecycle interfaces (Capacitor-ready)
- `@tsi/test-utils` — MSW handlers, RTL helpers, fixtures
- `@tsi/tsconfig` — shared TS configs

## Quickstart

```bash
nvm use            # picks up .nvmrc -> Node 20.x
corepack enable    # pnpm shipped with Node
pnpm install
pnpm dev           # runs both apps in parallel
```

- Member: <http://localhost:5173>
- Validator: <http://localhost:5174>

## Scripts

```bash
pnpm dev           # turbo run dev
pnpm build         # turbo run build
pnpm lint          # biome check
pnpm typecheck     # tsc --noEmit across the workspace
pnpm test          # vitest run
pnpm test:e2e      # playwright
```

## Stack

Vite 5 · React 18 · TypeScript 5.5 · Tailwind 3.4 · shadcn/ui · TanStack Query v5 · React Router v6 · Zustand · react-hook-form + zod · react-i18next (id-ID default) · Dexie · MSW · Vitest · Playwright · Biome.
