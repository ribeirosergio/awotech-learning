begin;

-- Configuração de autorização derivada de content/*/course.json.
-- Somente IDs/ordem: o conteúdo pedagógico permanece nos arquivos do repositório.
-- Ao alterar a trilha ou cadastrar outro curso, atualizar esta função em NOVA migration.
create function public.course_lesson_sequence(requested_course_id text)
returns text[] language sql immutable set search_path = '' as $sequence$
  select case requested_course_id
    when 'robotica-basico' then array[
      'robotica-01-introducao',
      'robotica-02-pensamento-computacional',
      'robotica-03-circuitos',
      'robotica-04-controlando-circuitos',
      'robotica-05-ultrassonico',
      'robotica-06-cancela',
      'robotica-07-motores',
      'robotica-08-primeiro-robo-parte-1',
      'robotica-09-primeiro-robo-parte-2',
      'robotica-10-primeiro-robo-parte-3'
    ]::text[]
    else null::text[]
  end;
$sequence$;
revoke all on function public.course_lesson_sequence(text) from public, anon, authenticated;

-- O trigger precisa ler o progresso sem depender da política aplicada à linha alterada.
-- Não é uma RPC pública: EXECUTE revogado, identidade fixada em auth.uid(), search_path vazio.
create function public.enforce_lesson_sequence()
returns trigger language plpgsql volatile security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  sequence_ids text[];
  completed_ids text[];
  lesson_position integer;
  completed_prefix integer := 0;
  item text;
begin
  if actor is null or new.user_id <> actor then
    raise exception using errcode = '42501', message = 'Só é permitido alterar seu próprio progresso autenticado.';
  end if;
  if tg_op = 'UPDATE' then
    if (old.user_id, old.course_id, old.lesson_id) is distinct from (new.user_id, new.course_id, new.lesson_id) then
      raise exception using errcode = '42501', message = 'Não é permitido mover registros de progresso.';
    end if;
  end if;

  -- Serializa conclusão/reabertura do mesmo aluno/curso, inclusive entre abas.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text || ':' || new.course_id, 0));
  if not public.has_course_access(new.course_id) then
    raise exception using errcode = '42501', message = 'É necessário acesso vigente ao curso.';
  end if;
  sequence_ids := public.course_lesson_sequence(new.course_id);
  lesson_position := pg_catalog.array_position(sequence_ids, new.lesson_id);
  if lesson_position is null then
    raise exception using errcode = '23514', message = 'Aula não encontrada na sequência do curso.';
  end if;
  select coalesce(array_agg(p.lesson_id), '{}'::text[]) into completed_ids
    from public.lesson_progress p
    where p.user_id = actor and p.course_id = new.course_id and p.completed;
  foreach item in array sequence_ids loop
    exit when not (item = any(completed_ids));
    completed_prefix := completed_prefix + 1;
  end loop;
  if lesson_position > completed_prefix + 1 then
    raise exception using errcode = '23514', message = 'Conclua as aulas anteriores antes de continuar.';
  end if;
  if not new.completed and lesson_position < completed_prefix then
    raise exception using errcode = '23514', message = 'Somente a última aula concluída pode voltar a pendente.';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_lesson_sequence() from public, anon, authenticated;
create trigger enforce_lesson_sequence before insert or update on public.lesson_progress
  for each row execute function public.enforce_lesson_sequence();

-- As políticas RLS de identidade e entitlement continuam em vigor.
-- Nenhum registro existente é apagado ou modificado por esta migration.
commit;
