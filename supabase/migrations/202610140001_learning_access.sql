begin;

create table public.user_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (length(product_id) > 0),
  access_type text not null check (access_type in ('purchase', 'subscription', 'manual')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id),
  check (expires_at is null or expires_at > starts_at)
);

alter table public.user_access enable row level security;
revoke all on public.user_access from public, anon, authenticated;
grant select on public.user_access to authenticated;
create policy user_access_select_own on public.user_access
  for select to authenticated using (user_id = (select auth.uid()));

-- Nenhum INSERT/UPDATE/DELETE é concedido ao cliente.
-- Relógio do banco e acessos próprios em uma única leitura, sem privilégios elevados.
create function public.get_my_access()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'server_time', now(),
    'access', coalesce((select jsonb_agg(to_jsonb(a)) from public.user_access a
      where a.user_id = (select auth.uid())), '[]'::jsonb)
  );
$$;
revoke all on function public.get_my_access() from public, anon;
grant execute on function public.get_my_access() to authenticated;

commit;
