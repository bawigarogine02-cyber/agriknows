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

1. Create a MySQL database and run `database/migrations/001_planting_advisor.sql`, followed by `database/migrations/002_dashboard.sql`, `database/migrations/003_admin_access.sql`, and `database/migrations/004_site_settings.sql`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and a long random `SESSION_SECRET`.
3. Register or log in through `/register` or `/login`. Authentication uses the `users` table, hashed passwords, and an HTTP-only session cookie.
4. Add `GEMINI_API_KEY` to enable the constrained Gemini 3 Flash image observation step. Crop scoring remains deterministic and uses the structured requirements in the database.

The dashboard migration keeps the data relational: users own farms, farms contain fields, fields contain crop plantings, crops connect to knowledge articles and recommendations, and locations connect to weather snapshots. Reports and notifications are also scoped to users through foreign keys.

## Admin dashboard

The protected admin workspace is available at `/admin`. New registrations are always created as regular users. After registering the intended administrator, promote that account explicitly in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Admin APIs enforce the role server-side. The admin workspace currently provides database-backed overview metrics, user search/pagination/role/status management, relational entity views, and SEO settings that feed the root metadata, sitemap, and robots output.

The `/planting-advisor` page and `/api/planting-advisor` endpoints require the signed HTTP-only session cookie created by the login or registration routes. Analysis queries are scoped to that authenticated user. Open-Meteo and Gemini requests are made server-side; no API key is sent to the browser.

