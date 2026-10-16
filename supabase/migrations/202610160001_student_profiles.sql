begin;

-- Identidade continua em auth.users. Nenhum dado de perfil concede acesso a cursos.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (length(full_name) <= 160),
  birth_date date check (birth_date >= date '1900-01-01' and birth_date <= current_date),
  phone text not null default '' check (length(phone) <= 32),
  city text not null default '' check (length(city) <= 100),
  state text not null default '' check (length(state) <= 100),
  country text not null default 'Brasil' check (length(country) <= 100),
  document_type text check (document_type in ('CPF', 'RG', 'Passaporte', 'Outro')),
  document_number text check (length(document_number) between 3 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((document_type is null) = (document_number is null)),
  check (phone = '' or (phone ~ '^[+0-9 ().-]+$' and length(regexp_replace(phone, '[^0-9]', '', 'g')) between 10 and 15))
);

create function public.stamp_student_profile()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.stamp_student_profile() from public, anon, authenticated;
create trigger stamp_student_profile before insert or update on public.profiles
for each row execute function public.stamp_student_profile();

create function public.create_student_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare fields jsonb := coalesce(new.raw_user_meta_data->'student_profile', '{}'::jsonb);
begin
  insert into public.profiles(user_id, full_name, birth_date, phone, city, state, country, document_type, document_number)
  values (
    new.id, coalesce(btrim(fields->>'full_name'), ''), nullif(fields->>'birth_date', '')::date,
    coalesce(btrim(fields->>'phone'), ''), coalesce(btrim(fields->>'city'), ''),
    coalesce(btrim(fields->>'state'), ''), coalesce(nullif(btrim(fields->>'country'), ''), 'Brasil'),
    nullif(btrim(fields->>'document_type'), ''), nullif(btrim(fields->>'document_number'), '')
  );
  return new;
end;
$$;
revoke all on function public.create_student_profile() from public, anon, authenticated;
create trigger create_student_profile after insert on auth.users
for each row execute function public.create_student_profile();

-- Contas existentes completam o perfil em Minha conta; não inventar dados pessoais.
insert into public.profiles(user_id) select id from auth.users on conflict(user_id) do nothing;

alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant insert(user_id, full_name, birth_date, phone, city, state, country, document_type, document_number)
  on public.profiles to authenticated;
grant update(full_name, birth_date, phone, city, state, country, document_type, document_number)
  on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

commit;
