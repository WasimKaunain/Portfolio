Developer Control Center — Portfolio

Overview

This project is a production-grade developer portfolio built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Prisma ORM v5 ("normal" Prisma) and Postgres. It is designed as a “Developer Control Center” — a personal OS-like experience with an owner-only admin.

Features implemented

Public
- Animated hero (Framer Motion)
- Interactive terminal UI with command parsing + history
- Projects showcase + public endpoint `GET /api/projects` (Prisma-backed; optional rate-limit)
- Theme toggling (terminal `theme` command)

Private admin
- Admin route: `/private-admin`
- Owner-only auth via NextAuth (GitHub OAuth) with email allowlist (`OWNER_EMAIL`)
- Server-side session validation (`getServerSession`) + noindex headers
- Admin APIs (owner-only):
  - `GET/POST /api/admin/projects`
  - `GET/PATCH/DELETE /api/admin/projects/[id]`
  - `GET /api/admin/logs`
  - `GET /api/admin/billing`

Security foundations
- Owner allowlist enforced server-side

---

Database setup (required)

This app expects Postgres.

Recommended (easy + free-ish):
- Neon (serverless Postgres)
- Supabase (Postgres + dashboard)

Steps:
1) Create a Postgres database in Neon/Supabase.
2) Copy the connection string into `DATABASE_URL`.
3) Create `.env` by copying `.env.example`.
4) Run Prisma:
   - npx prisma generate
   - npx prisma migrate dev --name init
   - (optional) npx prisma db seed

Note: Prisma v5 uses the datasource URL from `prisma/schema.prisma`:

- `datasource db { url = env("DATABASE_URL") }`

`prisma.config.ts` is intentionally a stub to avoid typecheck failures.

---

Quick start

1) Install dependencies

- npm install

2) Create `.env`

Start by copying:
- cp .env.example .env

Then fill in:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GITHUB_ID / GITHUB_SECRET

Owner allowlist (must match GitHub OAuth email):
- OWNER_EMAIL=ansariw580@gmail.com

Optional (rate limiting):
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

3) Prisma (v5)

- npx prisma generate
- npx prisma migrate dev --name init
- (optional) npx prisma db seed

4) Run

- npm run dev

---

Project structure

- `src/app` — public routes + private admin routes
- `src/components` — UI building blocks
- `src/components/admin` — admin UI shell + client-side admin fetch components
- `src/pages/api` — API routes (NextAuth + data endpoints)
- `src/pages/api/admin` — owner-only admin CRUD APIs
- `src/lib/env.ts` — typed env validation (server-only)
- `src/lib/adminAuth.ts` — owner guard for admin pages
- `src/lib/rateLimit.ts` — Upstash rate limiter (optional)

---

Admin auth implementation

- NextAuth route: `src/pages/api/auth/[...nextauth].ts`
- Owner allowlist: set `OWNER_EMAIL` in `.env`
- Admin page protection: `requireOwner()` in `src/lib/adminAuth.ts`

Deployment notes (Vercel)

- Set all env vars in Vercel Project Settings
- Use a managed Postgres (Supabase/Neon/etc)
- Run migrations via CI or `prisma migrate deploy` on build pipeline

Next steps (optional)

- Add export/clear actions for logs
- Add alerts/webhooks for billing thresholds
- Add 2FA: owner-only TOTP or passkeys for `/private-admin`
