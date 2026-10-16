-- Executar no SQL Editor de um projeto Supabase de desenvolvimento após todas as migrations.
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
  begin
    perform public.save_lesson_evidence(bid,'robotica-basico','robotica-01-introducao','hcuA5wkgUNA',100,'[[0,100]]'::jsonb,'{}'::text[]);
    raise exception 'Cliente creditou evidências a outro usuário';
  exception when insufficient_privilege then null;end;
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
  begin
    insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
      values (aid, 'robotica-basico', 'robotica-02-pensamento-computacional', true);
    raise exception 'Cliente pulou a primeira aula';
  exception when check_violation then null; end;
  begin
    insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
      values (aid, 'robotica-basico', 'aula-inexistente', true);
    raise exception 'Cliente concluiu aula inexistente';
  exception when check_violation then null; end;
  begin
    insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
      values (aid, 'robotica-basico', 'robotica-01-introducao', true);
    raise exception 'Cliente concluiu sem assistir vídeo';
  exception when check_violation then null; end;
  perform public.save_lesson_evidence(aid,'robotica-basico','robotica-01-introducao','hcuA5wkgUNA',100,'[[0,100]]'::jsonb,'{}'::text[]);
  insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
    values (aid, 'robotica-basico', 'robotica-01-introducao', true);
  if not exists(select 1 from public.lesson_progress where completed and completed_at is not null) then raise exception 'Conclusão não persistida'; end if;
  -- Mesmo fluxo de upsert usado pelo navegador, incluindo uma linha já existente.
  insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
    values (aid, 'robotica-basico', 'robotica-01-introducao', true)
    on conflict (user_id, course_id, lesson_id) do update set completed = excluded.completed;
  perform public.save_lesson_evidence(aid,'robotica-basico','robotica-02-pensamento-computacional','hcuA5wkgUNA',100,'[[0,100]]'::jsonb,'{}'::text[]);
  insert into public.lesson_progress (user_id, course_id, lesson_id, completed)
    values (aid, 'robotica-basico', 'robotica-02-pensamento-computacional', true);
  -- Um seek ao fim e uma montagem isolada não bastam para concluir a aula 3.
  perform public.save_lesson_evidence(aid,'robotica-basico','robotica-03-circuitos','hcuA5wkgUNA',100,'[[0,1],[99,100]]'::jsonb,array['battery-led']);
  begin
    insert into public.lesson_progress(user_id,course_id,lesson_id,completed) values(aid,'robotica-basico','robotica-03-circuitos',true);
    raise exception 'Cliente concluiu pulando trechos do vídeo';
  exception when check_violation then null;end;
  perform public.save_lesson_evidence(aid,'robotica-basico','robotica-03-circuitos','hcuA5wkgUNA',100,'[[1,99]]'::jsonb,'{}'::text[]);
  begin
    insert into public.lesson_progress(user_id,course_id,lesson_id,completed) values(aid,'robotica-basico','robotica-03-circuitos',true);
    raise exception 'Cliente concluiu sem a segunda montagem';
  exception when check_violation then null;end;
  perform public.save_lesson_evidence(aid,'robotica-basico','robotica-03-circuitos','hcuA5wkgUNA',0,'[]'::jsonb,array['button-led']);
  insert into public.lesson_progress(user_id,course_id,lesson_id,completed) values(aid,'robotica-basico','robotica-03-circuitos',true);
  perform public.save_lesson_evidence(aid,'robotica-basico','robotica-04-controlando-circuitos','hcuA5wkgUNA',100,'[[0,100]]'::jsonb,array['blink-led']);
  begin
    insert into public.lesson_progress(user_id,course_id,lesson_id,completed) values(aid,'robotica-basico','robotica-04-controlando-circuitos',true);
    raise exception 'Cliente concluiu com atividade indisponível';
  exception when check_violation then null;end;
  begin
    perform public.save_lesson_evidence(aid,'robotica-basico','robotica-04-controlando-circuitos','hcuA5wkgUNA',0,'[]'::jsonb,array['traffic-light']);
    raise exception 'Cliente aprovou atividade indisponível';
  exception when check_violation then null;end;
  begin
    update public.lesson_evidence set activities=array['traffic-light'];
    raise exception 'Cliente alterou evidências diretamente';
  exception when insufficient_privilege then null;end;
  update public.lesson_progress set completed=false where lesson_id='robotica-03-circuitos';
  begin
    update public.lesson_progress set completed = false where lesson_id = 'robotica-01-introducao';
    raise exception 'Cliente reabriu uma aula anterior à última concluída';
  exception when check_violation then null; end;
  update public.lesson_progress set completed = false where lesson_id = 'robotica-02-pensamento-computacional';
  update public.lesson_progress set completed = false where lesson_id = 'robotica-01-introducao';
  begin
    update public.lesson_progress set completed = true where lesson_id = 'robotica-02-pensamento-computacional';
    raise exception 'Cliente pulou a primeira aula via UPDATE';
  exception when check_violation then null; end;
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
  if exists(select 1 from public.lesson_evidence) then raise exception 'RLS: leu evidências alheias';end if;
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
  begin
    perform * from public.lesson_evidence;
    raise exception 'Anônimo leu evidências';
  exception when insufficient_privilege then null;end;
  begin
    perform public.save_lesson_evidence('00000000-0000-0000-0000-000000000000'::uuid,'robotica-basico','robotica-01-introducao','hcuA5wkgUNA',100,'[[0,100]]'::jsonb,'{}'::text[]);
    raise exception 'Anônimo registrou evidências';
  exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
