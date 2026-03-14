-- SmartSched AI Supabase schema
-- Safe to paste into Supabase SQL editor

create extension if not exists "pgcrypto";

-- Enum types
create type if not exists public.machine_status as enum ('running','idle','maintenance','down');
create type if not exists public.work_order_status as enum ('scheduled','in-progress','delayed','complete','canceled');
create type if not exists public.work_order_priority as enum ('low','medium','high','critical');
create type if not exists public.task_status as enum ('planned','in-progress','blocked','complete','canceled');
create type if not exists public.alert_type as enum ('material','maintenance','delay','quality','safety');
create type if not exists public.alert_severity as enum ('low','medium','high');
create type if not exists public.alert_status as enum ('open','acknowledged','resolved');

-- Facilities
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  created_at timestamptz not null default now()
);

-- Production lines
create table if not exists public.production_lines (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  name text not null,
  throughput_per_hour integer,
  created_at timestamptz not null default now()
);

-- Machines
create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  production_line_id uuid not null references public.production_lines(id) on delete cascade,
  name text not null,
  status public.machine_status not null,
  utilization numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Workers
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  name text not null,
  skill text,
  availability numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  family text,
  lead_time_days integer,
  created_at timestamptz not null default now()
);

-- Work orders
create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  priority public.work_order_priority not null,
  due_date date not null,
  progress numeric(5,2) not null default 0,
  status public.work_order_status not null,
  assigned_line_id uuid references public.production_lines(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Scheduled tasks
create table if not exists public.scheduled_tasks (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  production_line_id uuid not null references public.production_lines(id) on delete cascade,
  machine_id uuid references public.machines(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.task_status not null,
  created_at timestamptz not null default now(),
  constraint scheduled_tasks_time_chk check (end_time > start_time)
);

-- Alerts
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  type public.alert_type not null,
  severity public.alert_severity not null,
  message text not null,
  status public.alert_status not null,
  related_work_order_id uuid references public.work_orders(id) on delete set null,
  related_line_id uuid references public.production_lines(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Scenarios
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  oee numeric(5,2) not null default 0,
  otif numeric(5,2) not null default 0,
  utilization numeric(5,2) not null default 0,
  setup_reduction numeric(5,2) not null default 0,
  summary text,
  created_at timestamptz not null default now()
);

-- Metric snapshots
create table if not exists public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  scenario_id uuid references public.scenarios(id) on delete set null,
  oee numeric(5,2) not null default 0,
  otif numeric(5,2) not null default 0,
  utilization numeric(5,2) not null default 0,
  setup_reduction numeric(5,2) not null default 0,
  captured_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_production_lines_facility_id on public.production_lines(facility_id);
create index if not exists idx_machines_line_id on public.machines(production_line_id);
create index if not exists idx_workers_facility_id on public.workers(facility_id);
create index if not exists idx_work_orders_facility_id on public.work_orders(facility_id);
create index if not exists idx_work_orders_assigned_line_id on public.work_orders(assigned_line_id);
create index if not exists idx_work_orders_due_date on public.work_orders(due_date);
create index if not exists idx_work_orders_status on public.work_orders(status);
create index if not exists idx_scheduled_tasks_work_order_id on public.scheduled_tasks(work_order_id);
create index if not exists idx_scheduled_tasks_line_id on public.scheduled_tasks(production_line_id);
create index if not exists idx_scheduled_tasks_machine_id on public.scheduled_tasks(machine_id);
create index if not exists idx_scheduled_tasks_start_time on public.scheduled_tasks(start_time);
create index if not exists idx_alerts_created_at on public.alerts(created_at);
create index if not exists idx_alerts_status on public.alerts(status);
create index if not exists idx_alerts_related_work_order_id on public.alerts(related_work_order_id);
create index if not exists idx_alerts_related_line_id on public.alerts(related_line_id);
create index if not exists idx_metric_snapshots_facility_id on public.metric_snapshots(facility_id);
create index if not exists idx_metric_snapshots_scenario_id on public.metric_snapshots(scenario_id);
create index if not exists idx_metric_snapshots_captured_at on public.metric_snapshots(captured_at);
