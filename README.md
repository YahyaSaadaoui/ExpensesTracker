# ExpensesTracker

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-ready-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

ExpensesTracker is a full-stack Next.js app for tracking expenses, consumptions, reports, snapshots, and import/export flows. It is built as a practical personal-finance dashboard and as a learning project for modern Next.js app-router patterns.

## Features

- Create, update, delete, import, and export expense records.
- Track consumptions separately from general expenses.
- Dashboard views for monthly summaries and reporting.
- API routes for expenses, consumptions, reports, snapshots, import, and export.
- Supabase server integration for persistence.
- Responsive UI using React, Tailwind CSS, Radix-style components, charts, tables, and icons.
- PDF and spreadsheet-oriented dependencies for reporting/export workflows.

## Tech Stack

| Area | Stack |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| Backend | Next.js API routes |
| Database | Supabase |
| UI | Tailwind CSS, Radix UI, Lucide, AG Grid, Recharts |
| Data/export | xlsx, pdf-lib |
| Auth/helpers | Supabase client, JWT, bcryptjs |

## Quick Start

### Prerequisites

- Node.js 20+
- npm, pnpm, or yarn
- Optional: Supabase project for persistent data

### Install

```bash
git clone https://github.com/YahyaSaadaoui/ExpensesTracker.git
cd ExpensesTracker
npm install
```

### Configure Environment

Create `.env.local` in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The server-side Supabase client reads these variables from `src/lib/supabaseServer.ts`.

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # start local development server
npm run build    # build production app
npm run start    # start production server
npm run lint     # run ESLint
```

## Project Layout

```text
src/
├── app/
│   ├── api/           # API routes for expenses, reports, auth, import/export
│   └── dashboard/     # dashboard pages and UI flows
├── components/        # reusable interface components
└── lib/               # auth, Supabase, money, date/period, and utility helpers

public/                # static assets
```

## Example User Flow

1. Configure Supabase environment variables.
2. Start the local app with `npm run dev`.
3. Add expenses or consumptions from the dashboard.
4. Review summaries and reports.
5. Export or import data for backups and migration.

## Good First Improvements

- Add validation around CSV/JSON import payloads.
- Add unit tests for helpers in `src/lib`.
- Add a yearly summary endpoint and chart.
- Add a screenshot section to this README.
- Add sample Supabase schema SQL.
- Improve empty, loading, and error states in dashboard tables.

## Deployment

The app can be deployed to Vercel or another Node-compatible host.

Before deploying, configure the required Supabase environment variables in the hosting provider:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
