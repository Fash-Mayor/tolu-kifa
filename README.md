# TÓLÚ KÍFÀ — Web App

Next.js (App Router) + Prisma/Postgres app for the TÓLÚ KÍFÀ fashion studio:
landing page, shop, gallery ("Archive"), consultation requests, and a
founder-facing admin panel. See `../README.md` (one folder up) for the full
project plan/brief this was built from.

**New to this codebase?** Almost every file has comments explaining not
just *what* it does but *why* — especially anywhere this project uses a
Next.js/React feature (Server Actions, route groups, async `params`, etc.)
that might be new to you. Start at `src/app/layout.tsx` and follow the
imports from there, or jump straight to the section you need below.

## Running it locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up a Postgres database.** Easiest options:
   - A free hosted database: [neon.com](https://neon.com) or [railway.app](https://railway.app) — create a project, copy the connection string.
   - Or run one locally with Docker: `docker run --name tolu-kifa-db -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=tolukifa -p 5432:5432 -d postgres:16`

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   - `DATABASE_URL` — your Postgres connection string from step 2.
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — the founder's first admin login.

4. **Create the database tables, then fill them with starter data**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   `db:seed` creates the admin login, the digitized size charts, and a
   handful of sample products/gallery photos using placeholder images —
   see `prisma/seed.ts`. It's safe to run again later (e.g. after changing
   `SEED_ADMIN_PASSWORD`).

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 for the public site, and
   http://localhost:3000/admin/login to sign in to the admin panel.

## Project structure

```
prisma/schema.prisma      All database tables — read this first to understand the data model
prisma/seed.ts            Fills a fresh database with starter data

src/lib/                  Shared logic with no UI: database client, auth, image
                           storage, currency formatting, validation schemas
src/components/site/      Shared public-site UI (nav, cart, product card, ...)
src/components/admin/     Shared admin-only UI

src/proxy.ts              Redirects signed-out visitors away from /admin (see its comments)

src/app/(site)/           Public pages: landing, shop, gallery, consult, cart, checkout, order lookup
                           ("(site)" is a route group — see the comment in its layout.tsx)
src/app/admin/login/      Admin sign-in (reachable while signed out)
src/app/admin/(protected)/  Everything else in the admin panel (requires sign-in)
```

Each feature area (e.g. `checkout/`) keeps its Server Action(s) in a
colocated `actions.ts` — that's where the actual database writes for that
feature happen. Pages themselves mostly just read data and render it.

## Things to know before going live

- **Images are stored on local disk** (`public/uploads/`, via
  `src/lib/storage.ts`) for now. This works for local dev and for hosting on
  an always-on server, but **not** on a serverless platform like Vercel —
  see the comment at the top of that file for what to switch to (Cloudinary
  or S3 are both a small change, isolated to that one file).
- **No online payment.** Checkout submits an order *request*; the founder
  follows up manually. See `src/app/(site)/checkout/actions.ts`.
- **Currency**: change the symbol in `src/lib/currency.ts` if this ever
  needs to support a different currency. Always render prices through the
  `<Price>` component (`src/components/site/Price.tsx`), not as a plain
  string — see the comment there for why.
- **Admin auth** is a small hand-rolled session system (no third-party
  auth library) — see `src/lib/auth.ts`. There's only ever one admin
  account, created by the seed script.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the codebase |
| `npm run db:migrate` | Apply schema changes to the database |
| `npm run db:seed` | (Re-)populate starter data |
| `npm run db:studio` | Opens Prisma Studio — a GUI for browsing/editing the database directly |
