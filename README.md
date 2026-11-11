# Agriculture App

This project follows the official Next.js App Router conventions and uses route groups to organize public, auth, and dashboard sections without changing the route URLs.

## Top-level structure

```text
project-name/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   └── users/
│   │       └── route.ts
│   ├── components/
│   ├── lib/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── public/
├── database/
├── tests/
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── next-env.d.ts
└── README.md
```

## URL behavior

- `app/(public)/page.tsx` maps to `/`
- `app/(public)/about/page.tsx` maps to `/about`
- `app/(auth)/login/page.tsx` maps to `/login`
- `app/(dashboard)/dashboard/page.tsx` maps to `/dashboard`

The parentheses are route-group markers and do not appear in the final URL.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Planting Advisor setup

1. Create a MySQL database with the base `users`, `locations`, and `crops` tables, then apply the available schema migrations in order through `database/migrations/015_knowledge_content_approval.sql`. Migration 001 is not included in this checkout, so verify the base tables exist before applying migration 002. Migrations 009–011 add profile/catalog/preferences fields; migration 012 adds pending and rejected user-account approval states; migration 013 allows custom pest and disease classifications; migration 014 requires admin approval before research papers are visible to farmers; migration 015 applies the same approval requirement to researcher-submitted pests, diseases, guides, and articles.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and a long random `SESSION_SECRET`.
3. Register or log in through `/register` or `/login`. Authentication uses the `users` table, hashed passwords, and an HTTP-only session cookie.
4. Add `GEMINI_API_KEY` to enable the constrained Gemini image observation step, grounded Google Search crop discovery, and the admin Knowledge Articles "Compose with Gemini" action. AI-composed articles are drafts for human review; verify claims and add authoritative sources before publishing. Crop Advisor combines crop-catalog entries with additional web-discovered candidates, then screens them against image observations and available weather. Its heuristic score is not a measured suitability or probability; verify growing requirements with cited sources, soil testing, and local agricultural guidance. The app searches Crossref's public API for crop-related article citations; no additional API key is required.

The dashboard migration keeps the data relational: users own farms, farms contain fields, fields contain crop plantings, crops connect to knowledge articles and recommendations, and locations connect to weather snapshots. Reports and notifications are also scoped to users through foreign keys.

## Admin dashboard

The protected admin workspace is available at `/admin`. Farmer and agricultural researcher registrations are created as pending accounts and require admin approval. Provision the initial administrator by promoting that account explicitly in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

The optional `scripts/seed.js` utility can initialize the crop catalog, but it does not create default user accounts or passwords. It accepts `DATABASE_URL` or the individual `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT` settings.

Admin APIs enforce the role server-side. The admin workspace provides database-backed overview metrics, user search/pagination/role/status management, relational entity views, and SEO settings that feed the root metadata, sitemap, and robots output. Audit activity is recorded for farm and field changes, recommendations, consultations, publications, crop catalog changes, and account administration; the audit feed refreshes every 30 seconds.

Researchers can add crop catalog entries and publish agricultural research. Crop deletion is admin-only. New field entries require the farmer to enter soil pH, organic matter, and water source rather than saving assumed agronomic values. Decision-support output uses saved field and crop data, recent rainfall, and crop stage; it is guidance rather than a substitute for soil testing or local extension recommendations. CSV exports apply the selected report filters and quote/escape cell content.

Farmers can update their profile and password, edit farm and field details, or delete their own farm/field records. Field areas are constrained by their farm's recorded total area. Authenticated requests re-check the account's current active status and role against the database, so suspending or deleting an account invalidates its existing session. The admin reports page summarizes stored account, farm, field, crop, knowledge, consultation, recommendation, analysis, publication, and audit-log totals; audit events cover important authentication, profile, settings, farm/field, consultation, recommendation, research, and admin-account changes.

The `/crop-advisor` and `/api/crop-advisor` endpoints require the signed HTTP-only session cookie created by the login or registration routes. Analysis queries are scoped to that authenticated user. Open-Meteo and Gemini requests are made server-side; no API key is sent to the browser.
