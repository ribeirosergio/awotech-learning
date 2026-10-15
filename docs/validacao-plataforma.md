# Validação da plataforma — 14/10/2026

## Executado localmente

- Lint, TypeScript, formatação, testes unitários e build de produção.
- 18 testes cobrindo conteúdo, catálogos público/privado, referências de imagens, navegação, entitlement por usuário/produto/vigência, progresso e bloqueio de chaves privilegiadas no build.
- Navegador Chrome headless com build de produção separado, variáveis públicas fictícias e interceptação das respostas do Supabase. Essa interceptação existe somente no script temporário de teste, não no código ou nas rotas da aplicação.

## Verificações de navegador

| Fluxo                     | Resultado                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Site público e preview    | Página pública preservada; resumo de um parágrafo; material completo e Monaco não carregados pelo preview                   |
| Cadastro                  | Formulário, envio ao SDK e mensagem de confirmação por email; navegação para login sem manter estado do formulário anterior |
| Login                     | Mensagem para credencial inválida; sucesso e retorno à área privada                                                         |
| Sessão após refresh       | Sessão persistida pelo SDK e recuperada ao recarregar                                                                       |
| Conta sem entitlement     | Meus cursos vazio; acesso direto à aula negado; conteúdo não renderizado                                                    |
| Concessão manual simulada | Curso aparece e aula exibe Markdown, imagens e atividades                                                                   |
| Vídeos separados          | Placeholder somente público; aula real sem ID completo mostra estado de preparação                                          |
| Progresso                 | Salvar, recarregar, desfazer e calcular percentual; erro de escrita não altera a conclusão na interface                     |
| Monaco                    | Carregamento dos chunks, edição, rascunho após refresh e inicialização de worker servido localmente                         |
| Navegação                 | Lista com dez aulas, anterior/próxima, retomada do curso e Meus cursos                                                      |
| Layout                    | Verificado em 1440 px e 390 px, sem transbordamento da página                                                               |
| Acesso vencido            | Negado após revalidação; falha da consulta também impede renderização do curso                                              |
| Logout                    | Sessão removida do armazenamento e rota privada redirecionada ao login                                                      |
| Recuperação               | Solicitação do link, estado para link ausente e atualização de senha com sessão                                             |
| Troca de conta            | A segunda conta não herda concessões, progresso ou rascunho da primeira                                                     |

Os fluxos acima validam a integração da interface com o contrato do SDK. Não validam assinatura de JWT, persistência real no PostgreSQL, entrega de email ou políticas reais do Supabase.

## Pendente no Cloud

Após a validação inicial acima, o responsável solicitou o vídeo temporário também nas aulas completas. As dez definições `lesson.json` agora configuram esse player com `isPlaceholder: true`, independentemente dos previews. A linha de validação de vídeos separados registra o estado anterior, em que o player completo ainda aguardava um ID.

O projeto Supabase Cloud foi informado pelo responsável e configurado localmente. Uma verificação real com a chave pública confirmou:

- Auth settings: HTTP 200, email habilitado, cadastro permitido e confirmação de email obrigatória.
- `user_access` e `lesson_progress`: existentes, com leitura anônima negada (HTTP 401 / código PostgreSQL `42501`).
- `get_my_access`: existente, com chamada anônima negada (HTTP 401 / `42501`).
- Build de produção com URL/chave pública reais: aprovado; `.env.local` ignorado pelo Git.

Ainda não foram executados contra o serviço real: cadastro/email, autenticação de usuário, refresh de tokens, persistência remota de progresso nem o script `supabase/tests/rls-smoke.sql`. A negação anônima não comprova por si só o isolamento entre dois usuários autenticados.

O procedimento para criação, aplicação das duas migrations, configuração das URLs e validação real está em `docs/plataforma-supabase.md`. O teste SQL é transacional, usa dois usuários temporários e termina com ROLLBACK. Não requer banco local ou Docker.
