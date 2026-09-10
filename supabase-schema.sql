-- WaterlooBudget Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved spots table
create table public.saved_spots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  spot_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, spot_id)
);

-- Teams table
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  invite_code text not null unique,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team members table
create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('owner', 'member')) default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Team spots table
create table public.team_spots (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams on delete cascade not null,
  spot_id text not null,
  added_by uuid references auth.users on delete set null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, spot_id)
);

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

-- Team expenses (group cost splitting: a bill one member fronted, to be split among participants)
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

-- Row Level Security (RLS)

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.saved_spots enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_spots enable row level security;
alter table public.expenses enable row level security;
alter table public.budget_goals enable row level security;
alter table public.team_expenses enable row level security;
alter table public.team_expense_splits enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Saved spots policies
create policy "Users can view own saved spots" on public.saved_spots
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved spots" on public.saved_spots
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved spots" on public.saved_spots
  for delete using (auth.uid() = user_id);

-- Teams policies
create policy "Team members can view teams" on public.teams
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create teams" on public.teams
  for insert with check (auth.uid() = created_by);

create policy "Team owners can update teams" on public.teams
  for update using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
      and team_members.role = 'owner'
    )
  );

-- For joining teams via invite code
create policy "Anyone can view teams by invite code" on public.teams
  for select using (true);

-- Team members policies
create policy "Team members can view team members" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    )
  );

create policy "Authenticated users can join teams" on public.team_members
  for insert with check (auth.uid() = user_id);

create policy "Team owners can manage members" on public.team_members
  for delete using (
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
    )
    or auth.uid() = user_id -- Users can leave teams
  );

-- Team spots policies
create policy "Team members can view team spots" on public.team_spots
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = team_spots.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can add spots" on public.team_spots
  for insert with check (
    exists (
      select 1 from public.team_members
      where team_members.team_id = team_spots.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can remove spots" on public.team_spots
  for delete using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = team_spots.team_id
      and team_members.user_id = auth.uid()
    )
  );

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

-- Function to handle user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index saved_spots_user_id_idx on public.saved_spots(user_id);
create index team_members_team_id_idx on public.team_members(team_id);
create index team_members_user_id_idx on public.team_members(user_id);
create index team_spots_team_id_idx on public.team_spots(team_id);
create index teams_invite_code_idx on public.teams(invite_code);
create index expenses_user_id_idx on public.expenses(user_id);
create index expenses_spent_at_idx on public.expenses(spent_at);
create index budget_goals_user_id_idx on public.budget_goals(user_id);
create index team_expenses_team_id_idx on public.team_expenses(team_id);
create index team_expense_splits_expense_id_idx on public.team_expense_splits(expense_id);
create index team_expense_splits_user_id_idx on public.team_expense_splits(user_id);
