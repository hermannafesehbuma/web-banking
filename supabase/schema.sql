-- Fortiz Bank schema (run in Supabase SQL editor)

-- 1) Tables
create table if not exists public.bank_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  kyc_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.bank_users(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.bank_users(id) on delete cascade,
  account_type text not null check (account_type in ('checking','savings')),
  account_number text not null unique,
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.bank_users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  amount numeric not null,
  type text not null check (type in ('credit','debit','refund')),
  description text,
  created_at timestamptz not null default now()
);

-- 2) RLS Policies
alter table public.bank_users enable row level security;
alter table public.accounts enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.transactions enable row level security;

-- Users can select their own bank_user row
create policy if not exists bank_users_select_self on public.bank_users
for select using (auth.uid() = id);

-- Users can update only their own bank_user limited fields
create policy if not exists bank_users_update_self on public.bank_users
for update using (auth.uid() = id) with check (auth.uid() = id);

-- Accounts: only owner can select
create policy if not exists accounts_select_owner on public.accounts
for select using (auth.uid() = user_id);

-- Transactions: only owner can select
create policy if not exists transactions_select_owner on public.transactions
for select using (auth.uid() = user_id);

-- KYC submissions: owner can insert/select their own
create policy if not exists kyc_insert_owner on public.kyc_submissions
for insert with check (auth.uid() = user_id);
create policy if not exists kyc_select_owner on public.kyc_submissions
for select using (auth.uid() = user_id);

-- 3) Helper functions
create or replace function public.generate_account_number()
returns text as $$
declare
  num text;
begin
  num := lpad((floor(random()*1e10))::bigint::text, 10, '0');
  return num;
end;
$$ language plpgsql volatile;

-- 4) Trigger to auto-create accounts after KYC approval
create or replace function public.create_accounts_after_kyc()
returns trigger as $$
begin
  if (new.status = 'approved' and old.status is distinct from 'approved') then
    -- create checking
    insert into public.accounts (user_id, account_type, account_number, balance)
    values (new.user_id, 'checking', public.generate_account_number(), 0)
    on conflict do nothing;
    -- create savings
    insert into public.accounts (user_id, account_type, account_number, balance)
    values (new.user_id, 'savings', public.generate_account_number(), 0)
    on conflict do nothing;
    -- mark bank_users approved
    update public.bank_users set kyc_status = 'approved' where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_accounts_after_kyc on public.kyc_submissions;
create trigger trg_accounts_after_kyc
after update on public.kyc_submissions
for each row
execute procedure public.create_accounts_after_kyc();


