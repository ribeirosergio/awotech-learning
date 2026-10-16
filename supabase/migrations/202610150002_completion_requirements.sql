begin;
-- Somente identificadores de autorização; textos e materiais permanecem no repositório.
-- Atualizações de vídeos/atividades exigem nova migration e alinhamento do teste de contrato.
create function public.lesson_completion_requirements(course text, lesson text)
returns jsonb language sql immutable set search_path='' as $$
 select entry from jsonb_array_elements($requirements$[
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-01-introducao",
    "video_id": "hcuA5wkgUNA",
    "activities": []
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-02-pensamento-computacional",
    "video_id": "hcuA5wkgUNA",
    "activities": []
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-03-circuitos",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "battery-led",
        "available": true
      },
      {
        "id": "button-led",
        "available": true
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-04-controlando-circuitos",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "blink-led",
        "available": true
      },
      {
        "id": "traffic-light",
        "available": false
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-05-ultrassonico",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "practice-pending",
        "available": false
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-06-cancela",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "practice-pending",
        "available": false
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-07-motores",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "practice-pending",
        "available": false
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-08-primeiro-robo-parte-1",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "practice-pending",
        "available": false
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-09-primeiro-robo-parte-2",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "practice-pending",
        "available": false
      }
    ]
  },
  {
    "course_id": "robotica-basico",
    "lesson_id": "robotica-10-primeiro-robo-parte-3",
    "video_id": "hcuA5wkgUNA",
    "activities": [
      {
        "id": "practice-pending",
        "available": false
      }
    ]
  }
]$requirements$::jsonb) entry
 where entry->>'course_id'=course and entry->>'lesson_id'=lesson;
$$;
revoke all on function public.lesson_completion_requirements(text,text) from public,anon,authenticated;

create table public.lesson_evidence (
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id text not null,lesson_id text not null,video_id text not null,
 duration_seconds double precision not null default 0 check(duration_seconds>=0 and duration_seconds<=86400),
 watched_ranges jsonb not null default '[]'::jsonb,
 activities text[] not null default '{}',updated_at timestamptz not null default now(),
 primary key(user_id,course_id,lesson_id)
);
alter table public.lesson_evidence enable row level security;
revoke all on public.lesson_evidence from public,anon,authenticated;
grant select on public.lesson_evidence to authenticated;
create policy lesson_evidence_select_own on public.lesson_evidence for select to authenticated using(user_id=(select auth.uid()));

-- Relatos do player e simulador no navegador: requisito pedagógico, não atestado antifraude.
-- Não concede entitlement. Nenhuma chave privilegiada é usada pelo cliente.
create function public.save_lesson_evidence(p_user_id uuid,p_course_id text,p_lesson_id text,p_video_id text,p_duration double precision,p_ranges jsonb,p_activities text[])
returns public.lesson_evidence language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid(); requirements jsonb; old_row public.lesson_evidence; result public.lesson_evidence;
 sequence_ids text[]; lesson_position integer; duration double precision; merged jsonb:='[]';
 range jsonb; left_edge double precision; right_edge double precision; next_left double precision; next_right double precision;
 activity text; approved text[];
begin
 if actor is null or actor is distinct from p_user_id or not public.has_course_access(p_course_id) then raise exception using errcode='42501',message='Identidade e acesso vigente necessários.';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text||':'||p_course_id,0));
 requirements:=public.lesson_completion_requirements(p_course_id,p_lesson_id);
 sequence_ids:=public.course_lesson_sequence(p_course_id);lesson_position:=array_position(sequence_ids,p_lesson_id);
 if requirements is null or lesson_position is null then raise exception using errcode='23514',message='Aula não configurada.';end if;
 if exists(select 1 from unnest(sequence_ids) with ordinality as lesson(id,ord) where ord<lesson_position and not exists(select 1 from public.lesson_progress p where p.user_id=actor and p.course_id=p_course_id and p.lesson_id=lesson.id and p.completed)) then
  raise exception using errcode='23514',message='Conclua as aulas anteriores.';
 end if;
 if p_video_id is distinct from requirements->>'video_id' then raise exception using errcode='23514',message='O vídeo da aula foi atualizado.';end if;
 if p_duration is null or p_duration<0 or p_duration>86400 or p_duration='NaN'::float8 then raise exception using errcode='23514',message='Duração inválida.';end if;
 if p_ranges is null or jsonb_typeof(p_ranges)<>'array' then raise exception using errcode='23514',message='Intervalos inválidos.';end if;
 if jsonb_array_length(p_ranges)>2048 or coalesce(array_length(p_activities,1),0)>32 then raise exception using errcode='23514',message='Relato excede o limite.';end if;
 foreach activity in array coalesce(p_activities,'{}') loop
  if not exists(select 1 from jsonb_array_elements(requirements->'activities') a where a->>'id'=activity and (a->>'available')::boolean) then raise exception using errcode='23514',message='Atividade indisponível ou desconhecida.';end if;
 end loop;
 select * into old_row from public.lesson_evidence where user_id=actor and course_id=p_course_id and lesson_id=p_lesson_id;
 duration:=case when p_duration>0 then p_duration when old_row.video_id=p_video_id then old_row.duration_seconds else 0 end;
 for range in select value from jsonb_array_elements(p_ranges) loop
  if jsonb_typeof(range)<>'array' then raise exception using errcode='23514',message='Intervalo inválido.';end if;
  if jsonb_array_length(range)<>2 or jsonb_typeof(range->0)<>'number' or jsonb_typeof(range->1)<>'number' then raise exception using errcode='23514',message='Intervalo inválido.';end if;
  if (range->>0)::float8<0 or (range->>1)::float8<=(range->>0)::float8 or (range->>1)::float8>duration then raise exception using errcode='23514',message='Intervalo fora do vídeo.';end if;
 end loop;
 for range in select value from jsonb_array_elements((case when old_row.video_id=p_video_id then coalesce(old_row.watched_ranges,'[]') else '[]'::jsonb end)||p_ranges) order by (value->>0)::float8 loop
  next_left:=(range->>0)::float8;next_right:=least((range->>1)::float8,duration);
  if next_right<=next_left then continue;end if;
  if left_edge is null then left_edge:=next_left;right_edge:=next_right;
  elsif next_left<=right_edge+0.05 then right_edge:=greatest(right_edge,next_right);
  else merged:=merged||jsonb_build_array(jsonb_build_array(left_edge,right_edge));left_edge:=next_left;right_edge:=next_right;end if;
 end loop;
 if left_edge is not null then merged:=merged||jsonb_build_array(jsonb_build_array(left_edge,right_edge));end if;
 select coalesce(array_agg(distinct item),'{}') into approved from unnest(coalesce(old_row.activities,'{}')||coalesce(p_activities,'{}')) item
 where exists(select 1 from jsonb_array_elements(requirements->'activities') a where a->>'id'=item and (a->>'available')::boolean);
 insert into public.lesson_evidence(user_id,course_id,lesson_id,video_id,duration_seconds,watched_ranges,activities)
 values(actor,p_course_id,p_lesson_id,p_video_id,duration,merged,approved)
 on conflict(user_id,course_id,lesson_id) do update set video_id=excluded.video_id,duration_seconds=excluded.duration_seconds,watched_ranges=excluded.watched_ranges,activities=excluded.activities,updated_at=now()
 returning * into result;
 return result;
end;$$;
revoke all on function public.save_lesson_evidence(uuid,text,text,text,double precision,jsonb,text[]) from public,anon;
grant execute on function public.save_lesson_evidence(uuid,text,text,text,double precision,jsonb,text[]) to authenticated;

create function public.enforce_lesson_completion()
returns trigger language plpgsql security definer set search_path='' as $$
declare requirements jsonb; evidence public.lesson_evidence; watched double precision; changing boolean;
begin
 changing:=new.completed;
 if tg_op='UPDATE' then changing:=new.completed and not old.completed;end if;
 if not changing then return new;end if;
 if new.user_id is distinct from auth.uid() then raise exception using errcode='42501',message='Identidade inválida.';end if;
 requirements:=public.lesson_completion_requirements(new.course_id,new.lesson_id);
 select * into evidence from public.lesson_evidence where user_id=new.user_id and course_id=new.course_id and lesson_id=new.lesson_id;
 select coalesce(sum((value->>1)::float8-(value->>0)::float8),0) into watched from jsonb_array_elements(coalesce(evidence.watched_ranges,'[]'));
 if requirements is null or evidence.video_id is distinct from requirements->>'video_id' or coalesce(evidence.duration_seconds,0)<=0 or watched<evidence.duration_seconds-least(2,evidence.duration_seconds*.02) then
  raise exception using errcode='23514',message='Assista à videoaula na plataforma antes de concluir.';
 end if;
 if exists(select 1 from jsonb_array_elements(requirements->'activities') a where not (a->>'available')::boolean or not (a->>'id'=any(coalesce(evidence.activities,'{}')))) then
  raise exception using errcode='23514',message='Conclua todas as atividades práticas obrigatórias.';
 end if;
 return new;
end;$$;
revoke all on function public.enforce_lesson_completion() from public,anon,authenticated;
create trigger enforce_lesson_completion before insert or update on public.lesson_progress for each row execute function public.enforce_lesson_completion();
-- Não altera conclusões antigas. Sequência, identidade e entitlement continuam obrigatórios.
commit;
