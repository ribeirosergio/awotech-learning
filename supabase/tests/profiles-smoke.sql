-- SQL Editor, após 202610160001. Cria identidades temporárias e desfaz tudo.
begin;
create temporary table profile_test_ids as select gen_random_uuid() a, gen_random_uuid() b;
grant select on profile_test_ids to authenticated;
insert into auth.users(id, aud, role, email, raw_user_meta_data)
select a, 'authenticated', 'authenticated', a::text || '@profile-test.invalid',
  '{"student_profile":{"full_name":"Aluno Teste","birth_date":"2000-01-01","phone":"24999999999","city":"Volta Redonda","state":"RJ","country":"Brasil"}}'::jsonb
from profile_test_ids
union all select b, 'authenticated', 'authenticated', b::text || '@profile-test.invalid', '{}'::jsonb from profile_test_ids;
do $$ begin
  if not exists(select 1 from public.profiles where user_id=(select a from profile_test_ids) and full_name='Aluno Teste') then
    raise exception 'Trigger não criou o perfil com os dados do cadastro';
  end if;
end; $$;
select set_config('request.jwt.claim.sub', a::text, true) from profile_test_ids;
set local role authenticated;
do $$ declare aid uuid; bid uuid; affected integer; begin
  select a,b into aid,bid from profile_test_ids;
  if (select count(*) from public.profiles) <> 1 then raise exception 'Leitura de perfil alheio'; end if;
  update public.profiles set full_name='Aluno Atualizado', city='Resende' where user_id=aid;
  if not exists(select 1 from public.profiles where user_id=aid and full_name='Aluno Atualizado') then raise exception 'Atualização própria negada'; end if;
  update public.profiles set full_name='Invasão' where user_id=bid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Alterou perfil alheio'; end if;
  begin
    insert into public.profiles(user_id,full_name) values(bid,'Invasão');
    raise exception 'Inseriu perfil alheio';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set user_id=bid where user_id=aid;
    raise exception 'Mudou identidade do perfil';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set created_at=now() where user_id=aid;
    raise exception 'Forjou data de criação';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.profiles where user_id=aid;
    raise exception 'Excluiu perfil pelo cliente';
  exception when insufficient_privilege then null; end;
end; $$;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.profiles; raise exception 'Anônimo leu perfis';
  exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
