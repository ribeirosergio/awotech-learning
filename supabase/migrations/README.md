# Migrações da plataforma

Aplicar em ordem no SQL Editor do Supabase Cloud de desenvolvimento:

- `202610140001_learning_access.sql`: `user_access`, RLS de leitura própria, revogação de escrita do cliente e RPC invoker com relógio do banco.
- `202610140002_lesson_progress.sql`: `lesson_progress`, RLS de leitura própria e escrita com entitlement vigente; função de verificação e trigger de horários.
- `202610150001_sequential_lessons.sql`: libera apenas a primeira aula pendente após as conclusões anteriores; impede pular aulas por escrita direta e permite reabrir somente a última conclusão válida.
- `202610150002_completion_requirements.sql`: evidências de reprodução e práticas por aluno/aula, RPC de registro, RLS e requisitos para novas conclusões.

As quatro tabelas possuem RLS. A RPC de acessos usa `security invoker`; a RPC de evidências e os triggers internos usam `security definer`, com `search_path` vazio e identidade de `auth.uid()`. Triggers e funções auxiliares têm execução pública revogada. A RPC de evidências permite apenas registrar relatos do próprio aluno com acesso vigente; nenhuma concessão de curso é criada por ela. Escrita direta em evidências é revogada do cliente. O script `../tests/rls-smoke.sql` testa isolamento, concessão indevida, vigência, sequência e requisitos no Cloud. A política de progresso usa `product_id = course_id`, relação canônica desta fase.

A ordem autorizada contém somente IDs em `course_lesson_sequence`, sem textos ou vídeos no banco. Um teste compara esses IDs com `content/robotica/course.json`. Novos cursos ou mudanças de ordem exigem nova migration atualizando essa função. Registros antigos são preservados: conclusões após uma lacuna só passam a contar e ficar acessíveis quando as aulas anteriores forem concluídas.

Execute somente as migrations ainda não aplicadas, em ordem. Depois das três primeiras, aplique `202610150002_completion_requirements.sql` e `202610160001_student_profiles.sql`. As proteções só entram em vigor após a aplicação no Cloud. Requisitos e limites dos relatos client-side estão em `../../docs/requisitos-conclusao.md`. As migrations preservam conclusões antigas.

A migration `202610160001_student_profiles.sql` adiciona dados do aluno com RLS própria e trigger de cadastro, sem duplicar credenciais. Aplicar depois das anteriores. Consulte `../../docs/perfil-aluno.md` e execute `../tests/profiles-smoke.sql` no Cloud de desenvolvimento. Identidade e senha continuam no Supabase Auth.
