# SmartSched AI

SmartSched AI is a manufacturing production scheduling workspace that pairs real-time operational data with planning workflows. It ships with a dashboard, scheduler, and scenario comparison views backed by Supabase auth + Postgres.

## Features
- Plant dashboard with KPI cards and utilization trends
- Visual scheduler (Gantt-style) by production line
- Work order management view
- Resource utilization and machine status
- Alerts and exception management
- Scenario comparison (Base Plan, AI Optimized, Disruption Case)
- AI-assisted replanning demo button

## Tech Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS for styling and layout utilities
- Recharts for analytics and trend visualizations
- Supabase (Auth + Postgres) with `@supabase/supabase-js` clients
- Prisma schema kept in `prisma/` for reference

## Project Structure
- `app/` Next.js App Router pages, layouts, and API routes
- `components/` Shared UI components (top bar, cards, charts, etc.)
- `lib/` Data access, Supabase clients, and domain utilities
- `supabase/` SQL schema and seed script (`schema.sql`, `seed.ts`)
- `prisma/` Prisma schema (reference only)
- `public/` Static assets
- `doc/` Project docs and notes

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Set environment variables (already filled with the provided Supabase project keys)
```bash
cp .env.example .env.local
```

3. Run the dev server
```bash
npm run dev
```

Visit `http://localhost:3000`.

## Supabase schema + seed

1. In Supabase SQL Editor, paste and run `supabase/schema.sql`.
2. Seed data and demo auth user (`planner@smartsched.ai` / `demo1234`):
```bash
npm run seed
```
The seed uses the service role key from `.env.local` and is idempotent.

## Authentication
- Login page authenticates against Supabase email/password.
- Dashboard routes guard against missing sessions and redirect to `/login`.

## Routes
- `/login`
- `/(dashboard)/dashboard`
- `/scheduler`
- `/work-orders`
- `/resources`
- `/alerts`
- `/scenarios`

## Notes
- Key tables live in Supabase: facilities, production_lines, machines, workers, products, work_orders, scheduled_tasks, alerts, scenarios, metric_snapshots.
- The `Run AI Replan` button still returns demo data (non-persistent).
