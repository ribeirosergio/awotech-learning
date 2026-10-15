-- Executar no SQL Editor de um projeto Supabase de desenvolvimento após as duas migrations.
-- Usa usuários temporários e termina com ROLLBACK: não envia emails nem preserva dados.
begin;
create temporary table test_ids as select gen_random_uuid() as a, gen_random_uuid() as b;
grant select on test_ids to authenticated;
insert into auth.users (id, aud, role, email)
select a, 'authenticated', 'authenticated', a::text || '@rls-test.invalid' from test_ids
union all select b, 'authenticated', 'authenticated', b::text || '@rls-test.invalid' from test_ids;
insert into public.user_access (user_id, product_id, access_type, starts_at, expires_at)
select a, 'robotica-basico', 'manual', now() - interval '1 day', now() + interval '1 day' from test_ids
union all select b, 'robotica-basico', 'manual', now() - interval '1 day', null from test_ids
union all select a, 'expirado', 'manual', now() - interval '2 days', now() - interval '1 day' from test_ids
union all select a, 'futuro', 'manual', now() + interval '1 day', null from test_ids;

select set_config('request.jwt.claim.sub', a::text, true) from test_ids;
set local role authenticated;
do $$
declare aid uuid; bid uuid;
begin
  select a, b into aid, bid from test_ids;
  if exists(select 1 from public.user_access where user_id = bid) then raise exception 'RLS: leu acesso alheio'; end if;
  if exists(select 1 from jsonb_array_elements(public.get_my_access()->'access') as entry(value)
    where (entry.value->>'user_id')::uuid <> aid) then raise exception 'RPC retornou acesso alheio'; end if;
  if not public.has_course_access('robotica-basico') then raise exception 'Acesso vigente negado'; end if;
  if public.has_course_access('expirado') or public.has_course_access('futuro') then raise exception 'Acesso fora da vigência aceito'; end if;
  begin
    insert into public.user_access (user_id, product_id, access_type) values (aid, 'nao-permitido', 'manual');
    raise exception 'Cliente conseguiu conceder acesso';
  exception when insufficient_privilege then null; end;
  begin
    update public.user_access set expires_at = null where user_id = aid;
    raise exception 'Cliente conseguiu alterar acesso';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.user_access where user_id = aid;
    raise exception 'Cliente conseguiu excluir acesso';
  exception when insufficient_privilege then null; end;
  insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
    values (aid, 'robotica-basico', 'robotica-01-introducao', true);
  if not exists(select 1 from public.lesson_progress where completed and completed_at is not null) then raise exception 'Conclusão não persistida'; end if;
  update public.lesson_progress set completed = false;
  if exists(select 1 from public.lesson_progress where completed_at is not null) then raise exception 'Conclusão não revertida'; end if;
  begin
    update public.lesson_progress set user_id = bid where user_id = aid;
    raise exception 'Cliente transferiu progresso para outro usuário';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.lesson_progress (user_id, course_id, lesson_id) values (bid, 'robotica-basico', 'tentativa');
    raise exception 'Cliente escreveu progresso alheio';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.lesson_progress (user_id, course_id, lesson_id) values (aid, 'expirado', 'tentativa');
    raise exception 'Cliente escreveu sem vigência';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.lesson_progress (user_id, course_id, lesson_id) values (aid, 'futuro', 'tentativa');
    raise exception 'Cliente escreveu antes do início';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub', b::text, true) from test_ids;
set local role authenticated;
do $$
begin
  if exists(select 1 from public.lesson_progress) then raise exception 'RLS: leu progresso alheio'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
  begin
    perform * from public.user_access;
    raise exception 'Anônimo leu acessos';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.lesson_progress;
    raise exception 'Anônimo leu progresso';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_my_access();
    raise exception 'Anônimo chamou RPC de acessos';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
