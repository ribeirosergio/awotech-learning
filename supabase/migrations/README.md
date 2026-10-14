# Migrações futuras

Implementar na etapa de autenticação/acesso, com testes de políticas:

- `profiles`: vinculado a `auth.users`, acesso somente ao próprio perfil.
- `user_access`: produto, origem, início e expiração; o cliente apenas lê seus próprios acessos. Nunca conceder INSERT/UPDATE ao aluno.
- `lesson_progress`: chave usuário/curso/aula; políticas de leitura/escrita restritas ao próprio usuário e consistência entre conclusão e data.
- `payments`: identificação única do pagamento no provedor e auditoria server-side; sem escrita do cliente.

Ativar RLS explicitamente em todas as tabelas expostas. Testar acesso anônimo, usuário A contra B e impossibilidade de conceder acesso ou alterar pagamentos pelo navegador. Não publicar um schema sem suas políticas.

Pedidos físicos entram apenas quando houver venda de kits. Acesso digital e entrega física são entidades distintas.
