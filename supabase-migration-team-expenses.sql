-- Team cost-splitting migration
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New snippet).

-- Team expenses (a bill one member fronted, to be split among participants)
create table public.team_expenses (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams on delete cascade not null,
  spot_id text,
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  paid_by uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Per-participant share of a team expense
create table public.team_expense_splits (
  id uuid default uuid_generate_v4() primary key,
  expense_id uuid references public.team_expenses on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric(10,2) not null check (amount >= 0),
  settled boolean default false not null,
  settled_at timestamp with time zone,
  unique(expense_id, user_id)
);

alter table public.team_expenses enable row level security;
alter table public.team_expense_splits enable row level security;

-- Team expenses policies
create policy "Team members can view team expenses" on public.team_expenses
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = team_expenses.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can add team expenses" on public.team_expenses
  for insert with check (
    auth.uid() = paid_by
    and exists (
      select 1 from public.team_members
      where team_members.team_id = team_expenses.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Payers can delete their own team expenses" on public.team_expenses
  for delete using (auth.uid() = paid_by);

-- Team expense splits policies
create policy "Team members can view expense splits" on public.team_expense_splits
  for select using (
    exists (
      select 1 from public.team_expenses
      join public.team_members on team_members.team_id = team_expenses.team_id
      where team_expenses.id = team_expense_splits.expense_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Payers can create expense splits" on public.team_expense_splits
  for insert with check (
    exists (
      select 1 from public.team_expenses
      where team_expenses.id = team_expense_splits.expense_id
      and team_expenses.paid_by = auth.uid()
    )
  );

create policy "Participant or payer can update settled status" on public.team_expense_splits
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.team_expenses
      where team_expenses.id = team_expense_splits.expense_id
      and team_expenses.paid_by = auth.uid()
    )
  );

-- Indexes for performance
create index team_expenses_team_id_idx on public.team_expenses(team_id);
create index team_expense_splits_expense_id_idx on public.team_expense_splits(expense_id);
create index team_expense_splits_user_id_idx on public.team_expense_splits(user_id);
