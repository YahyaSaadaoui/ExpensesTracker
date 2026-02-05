# ExpensesTracker

ExpensesTracker is a small, open-source Next.js application to track personal or small-business expenses. It provides a modern UI (Next.js + React) and a set of API routes for CRUD operations, import/export, snapshots, summaries, and reports. The app is structured for easy local development and deployment and includes example server-side wiring for a Supabase backend.

This README explains what the project is, how to set it up, how to run it, and how you (or students) can use and extend it.

## Features

- Create, read, update and delete expenses and consumptions.
- Import/export expenses (CSV/JSON) and snapshots for backups.
- Monthly summaries and simple reporting endpoints.
- Authentication endpoints scaffolded (login/logout) — sample Supabase integration in `src/lib/supabaseServer.ts`.
- Responsive UI with components for desktop and mobile dashboards.

## Tech stack

- Next.js (app router)
- React + TypeScript
- Supabase (suggested; server integration present)
- Tailwind / PostCSS (project configuration files present)

## Who is this for?

- Anyone who wants an example full-stack Next.js app for tracking expenses.
- Teachers or students learning modern Next.js app-router patterns, API routes, and integrating a hosted DB (e.g., Supabase).

## Quick start (development)

Prerequisites:

- Node.js 18+ (or use the project's `use-node25.bat` if needed)
- npm, yarn, or pnpm
- (Optional) Supabase project if you want persistence across runs

1. Clone the repo

```bash
git clone https://github.com/YahyaSaadaoui/ExpensesTracker.git
cd ExpensesTracker
```

1. Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn
```


1. Environment variables

Create a `.env.local` file at the project root with the variables your setup requires. Example variables used by this project (adjust names to match the code in `src/lib` when necessary):

```env
# If you use Supabase for auth and DB
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key   # only for server-side operations if used

# Optional: NEXTAUTH_URL or other provider settings if you wire a provider
```

Notes:

The repo contains `src/lib/supabaseServer.ts` as an example; check that file for the exact env variable names the code expects and adjust `.env.local` accordingly.

1. Run the dev server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project layout (important files)

- `src/app/` — Next.js app router pages and API route placeholders.
  - `app/api/` — API route implementations (expenses, consumptions, import/export, reports, snapshots, etc.)
  - `app/dashboard/` — dashboard pages and React components
- `src/lib/` — helper libraries: `supabaseServer.ts`, `auth.ts`, `money.ts`, `period.ts`, and utility functions
- `public/` — static assets

Explore the `app/api` routes to see how server functions are structured in the app-router.

## How to use (end-user flow)

1. Sign in using the provided auth flow (if configured) or run locally with a mock user.
2. Use the dashboard to add expenses or consumptions via the `AddExpenseModal` or `AddConsumptionModal` components.
3. Browse, edit or delete entries in the `ExpensesTable` or use mobile views.
4. Export or import expenses from the `app/api/import/expenses` and `app/api/export/expenses` endpoints.

## Teaching notes / suggested exercises

These make good step-by-step learning tasks for students:

1. Wire a Supabase project: create a free Supabase instance and set the env vars. Verify the API routes persist data.
2. Add validation to the import endpoint to show how to validate CSV/JSON payloads.
3. Add unit tests for a small helper in `src/lib/money.ts` or `src/lib/period.ts`.
4. Create a new report endpoint (e.g., yearly summary) and add a small dashboard card to visualize it.

## Testing

This project does not include a test suite by default. To add tests, consider adding Jest or Vitest and write quick unit tests for `src/lib` helpers. Example quick setup with Vitest:

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom
# add a test script in package.json: "test": "vitest"
```

## Build & production

Build the project:

```bash
npm run build
npm start
```

Deploy to Vercel or other Node-compatible hosting. If you use Vercel, the `app` directory and Next.js settings should work out of the box. Ensure env vars are configured in the hosting provider.

## Contributing

Contributions are welcome. A simple workflow:

1. Fork the repo
2. Create a feature branch
3. Open a pull request describing the change and include screenshots or tests when appropriate

If you plan bigger changes (DB schema changes, auth changes), open an issue first to discuss the design.

## License

This project is licensed under the MIT License — see the `LICENSE` file for details. You are free to use, modify, and distribute this project for personal, educational, or commercial projects.

---

If you want, I can also:

- Add a small `LICENSE` file (MIT) at repository root (I will add it now).
- Add a small example `.env.example` with the minimal env vars needed.
- Add a tiny unit test for a helper in `src/lib`.

Tell me which of those you'd like next.
