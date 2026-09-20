-- Founder Arena schema. Run in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.decisions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  decision_text text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.responses (
  id            uuid primary key default gen_random_uuid(),
  decision_id   uuid not null references public.decisions(id) on delete cascade,
  agent_name    text not null,
  response_text text not null,
  created_at    timestamptz not null default now()
);

create index if not exists responses_decision_id_idx on public.responses(decision_id);

-- The API writes with the service role key, so RLS can stay on with no public policies.
alter table public.decisions enable row level security;
alter table public.responses enable row level security;
