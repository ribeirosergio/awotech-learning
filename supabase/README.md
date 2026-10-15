# Supabase Cloud

Integração do frontend com Supabase Auth e PostgreSQL/RLS, sem PostgreSQL local e sem Docker. O projeto Cloud está configurado no ambiente local. As duas tabelas e a RPC de acessos foram encontradas pela API real, com acesso anônimo negado. Os testes completos de Auth e RLS entre usuários ainda precisam ser executados.

Siga `docs/plataforma-supabase.md`. Aplique os dois arquivos SQL em `migrations/`, configure Email/Auth e URLs de retorno, e preencha `apps/web/.env.local` com URL/chave pública. `manual/grant-course-access.sql` concede acesso de desenvolvimento pelo painel administrativo. `tests/rls-smoke.sql` valida políticas no Cloud e termina com ROLLBACK.

Não há pagamentos, funções de checkout ou operações de kits. Conteúdo pedagógico permanece em `content/`; nenhum texto, vídeo, aula ou circuito é salvo no banco.
