# Migrações da plataforma

Aplicar em ordem no SQL Editor do Supabase Cloud de desenvolvimento:

- `202610140001_learning_access.sql`: `user_access`, RLS de leitura própria, revogação de escrita do cliente e RPC invoker com relógio do banco.
- `202610140002_lesson_progress.sql`: `lesson_progress`, RLS de leitura própria e escrita com entitlement vigente; função de verificação e trigger de horários.

As duas tabelas possuem RLS. As funções não usam `security definer`; `search_path` é fixado. O script `../tests/rls-smoke.sql` testa acesso anônimo, usuário A contra B, concessão indevida e vigência no Cloud. A política de progresso usa `product_id = course_id`, relação canônica desta fase.

Não há `profiles` duplicando identidade, pagamentos ou pedidos físicos nesta etapa. Identidade e senha são gerenciadas pelo Supabase Auth.
