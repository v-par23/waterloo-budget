-- Budget Tracker migration
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to run once on an existing WaterlooBudget database that already has
-- the tables from supabase-schema.sql.

-- Expenses table (budget tracker: log actual spend per visit)
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  spot_id text,
  amount numeric(10,2) not null check (amount >= 0),
  note text,
  spent_at date default (timezone('utc'::text, now()))::date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Budget goals table (weekly/monthly spending targets)
create table public.budget_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  period text check (period in ('weekly', 'monthly')) not null,
  amount numeric(10,2) not null check (amount >= 0),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, period)
);

alter table public.expenses enable row level security;
alter table public.budget_goals enable row level security;

-- Expenses policies
create policy "Users can view own expenses" on public.expenses
  for select using (auth.uid() = user_id);

create policy "Users can insert own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses" on public.expenses
  for update using (auth.uid() = user_id);

create policy "Users can delete own expenses" on public.expenses
  for delete using (auth.uid() = user_id);

-- Budget goals policies
create policy "Users can view own budget goals" on public.budget_goals
  for select using (auth.uid() = user_id);

create policy "Users can insert own budget goals" on public.budget_goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update own budget goals" on public.budget_goals
  for update using (auth.uid() = user_id);

-- Indexes for performance
create index expenses_user_id_idx on public.expenses(user_id);
create index expenses_spent_at_idx on public.expenses(spent_at);
create index budget_goals_user_id_idx on public.budget_goals(user_id);
