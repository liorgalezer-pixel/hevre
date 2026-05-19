create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  first_name text,
  last_name text,
  age integer,
  gender text,
  phone text,
  birth_date text,
  city text,
  country text,
  intl_license boolean default false,
  languages text[],
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
