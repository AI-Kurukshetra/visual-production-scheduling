create extension if not exists "pgcrypto";

-- Enums
do $$ begin
    create type work_order_status as enum ('planned','in_progress','completed','on_hold','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
    create type alert_type as enum ('delay','machine_downtime','quality','safety','other');
exception when duplicate_object then null; end $$;

do $$ begin
    create type alert_severity as enum ('info','warning','critical');
exception when duplicate_object then null; end $$;

do $$ begin
    create type alert_status as enum ('open','acknowledged','resolved','dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
    create type task_status as enum ('scheduled','in_progress','completed','blocked','cancelled');
exception when duplicate_object then null; end $$;

-- Core tables
create table if not exists facilities (
    id          uuid primary key default gen_random_uuid(),
    code        text unique not null,
    name        text not null,
    timezone    text default 'UTC',
    created_at  timestamptz not null default now()
);

create table if not exists production_lines (
    id           uuid primary key default gen_random_uuid(),
    facility_id  uuid not null references facilities(id) on delete cascade,
    code         text not null,
    name         text not null,
    created_at   timestamptz not null default now(),
    unique (facility_id, code)
);

create table if not exists machines (
    id                 uuid primary key default gen_random_uuid(),
    production_line_id uuid not null references production_lines(id) on delete cascade,
    code               text not null,
    name               text not null,
    type               text,
    status             text default 'idle',
    created_at         timestamptz not null default now(),
    unique (production_line_id, code)
);

create table if not exists workers (
    id                 uuid primary key default gen_random_uuid(),
    facility_id        uuid not null references facilities(id) on delete cascade,
    production_line_id uuid references production_lines(id) on delete set null,
    name               text not null,
    role               text,
    skill_level        int,
    status             text default 'active',
    created_at         timestamptz not null default now()
);

create table if not exists products (
    id          uuid primary key default gen_random_uuid(),
    sku         text unique not null,
    name        text not null,
    description text,
    created_at  timestamptz not null default now()
);

create table if not exists work_orders (
    id                uuid primary key default gen_random_uuid(),
    code              text unique not null,
    product_id        uuid not null references products(id) on delete restrict,
    facility_id       uuid not null references facilities(id) on delete cascade,
    assigned_line_id  uuid references production_lines(id) on delete set null,
    quantity          integer not null,
    priority          integer not null default 0,
    due_date          timestamptz,
    progress          numeric(5,2) not null default 0,
    status            work_order_status not null default 'planned',
    created_at        timestamptz not null default now()
);

create table if not exists scheduled_tasks (
    id                 uuid primary key default gen_random_uuid(),
    work_order_id      uuid not null references work_orders(id) on delete cascade,
    production_line_id uuid not null references production_lines(id) on delete cascade,
    machine_id         uuid references machines(id) on delete set null,
    start_time         timestamptz not null,
    end_time           timestamptz,
    status             task_status not null default 'scheduled',
    created_at         timestamptz not null default now()
);

create table if not exists alerts (
    id                   uuid primary key default gen_random_uuid(),
    type                 alert_type not null,
    severity             alert_severity not null,
    message              text not null,
    status               alert_status not null default 'open',
    related_work_order_id uuid references work_orders(id) on delete set null,
    related_line_id      uuid references production_lines(id) on delete set null,
    created_at           timestamptz not null default now()
);

create table if not exists scenarios (
    id               uuid primary key default gen_random_uuid(),
    name             text not null,
    oee              numeric(5,2),
    otif             numeric(5,2),
    utilization      numeric(5,2),
    setup_reduction  numeric(5,2),
    summary          text,
    created_at       timestamptz not null default now()
);

create table if not exists metric_snapshots (
    id                 uuid primary key default gen_random_uuid(),
    scenario_id        uuid references scenarios(id) on delete cascade,
    facility_id        uuid references facilities(id) on delete cascade,
    production_line_id uuid references production_lines(id) on delete set null,
    captured_at        timestamptz not null default now(),
    oee                numeric(5,2),
    otif               numeric(5,2),
    utilization        numeric(5,2),
    throughput         numeric,
    wip                numeric,
    notes              text
);

-- Indexes
create index if not exists idx_lines_facility       on production_lines(facility_id);
create index if not exists idx_machines_line        on machines(production_line_id);
create index if not exists idx_workers_facility     on workers(facility_id);
create index if not exists idx_workorders_facility  on work_orders(facility_id);
create index if not exists idx_workorders_line      on work_orders(assigned_line_id);
create index if not exists idx_workorders_due       on work_orders(due_date);
create index if not exists idx_tasks_workorder      on scheduled_tasks(work_order_id);
create index if not exists idx_tasks_line           on scheduled_tasks(production_line_id);
create index if not exists idx_tasks_machine        on scheduled_tasks(machine_id);
create index if not exists idx_alerts_status        on alerts(status);
create index if not exists idx_alerts_related_wo    on alerts(related_work_order_id);
create index if not exists idx_metrics_scenario     on metric_snapshots(scenario_id);
create index if not exists idx_metrics_facility     on metric_snapshots(facility_id);
