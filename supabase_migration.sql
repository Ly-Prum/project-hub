-- ========================================================
-- Project Hub - Supabase Migration
-- Run this in the Supabase SQL Editor (one-shot)
-- ========================================================

-- 1. Projects
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client_name text,
  description text,
  status      text not null default 'active'
              check (status in ('active','paused','completed','archived')),
  start_date  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Minutes (議事録)
create table if not exists minutes (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  title        text not null,
  date         date not null default current_date,
  attendees    text[] default '{}',
  content      text,
  decisions    text,
  next_actions text,
  created_at   timestamptz not null default now()
);

-- 3. Task Inventory (業務棚卸し)
create table if not exists task_inventory (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references projects(id) on delete cascade,
  category       text,
  task_name      text not null,
  frequency      text,
  responsible    text,
  current_method text,
  issues         text,
  improvement    text,
  priority       text not null default 'medium'
                 check (priority in ('high','medium','low')),
  status         text not null default 'not_started'
                 check (status in ('not_started','in_progress','completed')),
  created_at     timestamptz not null default now()
);

-- 4. Hearing Items (ヒアリング項目)
create table if not exists hearing_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  category    text,
  question    text not null,
  answer      text,
  answered_by text,
  answered_at date,
  status      text not null default 'pending'
              check (status in ('pending','answered','followup_needed')),
  created_at  timestamptz not null default now()
);

-- 5. Tasks (タスク)
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  description text,
  assignee    text,
  due_date    date,
  priority    text not null default 'medium'
              check (priority in ('high','medium','low')),
  status      text not null default 'todo'
              check (status in ('todo','in_progress','done','cancelled')),
  created_at  timestamptz not null default now()
);

-- 6. Documents (資料URL)
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  url         text not null,
  category    text,
  description text,
  created_at  timestamptz not null default now()
);

-- 7. Manuals (マニュアル)
create table if not exists manuals (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title      text not null,
  category   text,
  content    text,
  role       text,
  version    text not null default '1.0',
  status     text not null default 'draft'
             check (status in ('draft','review','published')),
  created_at timestamptz not null default now()
);

-- 8. FAQs
create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  category   text,
  question   text not null,
  answer     text,
  created_at timestamptz not null default now()
);

-- 9. Members (担当者)
create table if not exists members (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name       text not null,
  role       text not null,
  email      text,
  notes      text,
  created_at timestamptz not null default now()
);

-- 10. Unconfirmed Items (未確認事項)
create table if not exists unconfirmed_items (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       text not null,
  description text,
  raised_by   text,
  assigned_to text,
  due_date    date,
  status      text not null default 'pending'
              check (status in ('pending','confirmed','cancelled')),
  answer      text,
  created_at  timestamptz not null default now()
);

-- ========================================================
-- Row Level Security (RLS) - authenticated users only
-- ========================================================
alter table projects          enable row level security;
alter table minutes           enable row level security;
alter table task_inventory    enable row level security;
alter table hearing_items     enable row level security;
alter table tasks             enable row level security;
alter table documents         enable row level security;
alter table manuals           enable row level security;
alter table faqs              enable row level security;
alter table members           enable row level security;
alter table unconfirmed_items enable row level security;

-- Policy: logged-in users can read/write all rows
do $$
declare
  t text;
begin
  foreach t in array array[
    'projects','minutes','task_inventory','hearing_items',
    'tasks','documents','manuals','faqs','members','unconfirmed_items'
  ] loop
    execute format('
      create policy "authenticated_full_access" on %I
      for all to authenticated using (true) with check (true);
    ', t);
  end loop;
end $$;

-- ========================================================
-- Seed: first project "YATAインストール型BPO化プロジェクト"
-- ========================================================
insert into projects (name, client_name, description, status, start_date)
values (
  'YATAインストール型BPO化プロジェクト',
  'YATA',
  '酒屋YATAの業務を仕組み化・マニュアル化し、100店舗展開を可能にするBPO型パッケージの構築',
  'active',
  current_date
);
