begin;

create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (length(course_id) > 0),
  lesson_id text not null check (length(lesson_id) > 0),
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_id),
  check ((completed and completed_at is not null) or (not completed and completed_at is null))
);

-- No MVP, o entitlement do curso usa product_id = course_id.
-- Não há tabelas de conteúdo estático no banco.
create function public.has_course_access(requested_course_id text)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.user_access a
    where a.user_id = (select auth.uid())
      and a.product_id = requested_course_id
      and a.starts_at <= now()
      and (a.expires_at is null or a.expires_at > now())
  );
$$;
revoke all on function public.has_course_access(text) from public, anon;
grant execute on function public.has_course_access(text) to authenticated;

create function public.stamp_lesson_progress()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if not new.completed then
    new.completed_at := null;
  elsif tg_op = 'INSERT' then
    new.completed_at := now();
  elsif not old.completed then
    new.completed_at := now();
  else
    new.completed_at := old.completed_at;
  end if;
  return new;
end;
$$;
revoke all on function public.stamp_lesson_progress() from public, anon, authenticated;
create trigger stamp_lesson_progress before insert or update on public.lesson_progress
  for each row execute function public.stamp_lesson_progress();

alter table public.lesson_progress enable row level security;
revoke all on public.lesson_progress from public, anon, authenticated;
grant select, insert, update on public.lesson_progress to authenticated;
create policy lesson_progress_select_own on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy lesson_progress_insert_own_with_access on public.lesson_progress
  for insert to authenticated with check (
    user_id = (select auth.uid()) and public.has_course_access(course_id)
  );
create policy lesson_progress_update_own_with_access on public.lesson_progress
  for update to authenticated
  using (user_id = (select auth.uid()) and public.has_course_access(course_id))
  with check (user_id = (select auth.uid()) and public.has_course_access(course_id));

commit;
