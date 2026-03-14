create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities(id) on delete cascade,
  title text not null,
  action text,
  impact text,
  eta text,
  confidence numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_recommendations_facility_id
  on public.ai_recommendations(facility_id);

create index if not exists idx_ai_recommendations_created_at
  on public.ai_recommendations(created_at);

alter table public.ai_recommendations enable row level security;

create policy "ai_recommendations_read"
  on public.ai_recommendations
  for select
  using (true);
