# Plataforma do aluno e Supabase Cloud

Esta etapa integra a aplicação ao SDK oficial do Supabase, adiciona autenticação, direitos de acesso, progresso e Monaco. Nenhum banco local ou Docker é necessário. O projeto Supabase Cloud já foi informado e configurado em `apps/web/.env.local`, fora do Git. A consulta real confirmou Auth por email habilitado, confirmação de email obrigatória e existência das duas tabelas e da RPC de acessos, com consultas anônimas negadas. A validação de cadastro/login real, entrega de emails e isolamento entre usuários autenticados ainda precisa ser concluída.

## Configuração no Cloud

1. Crie sua organização/projeto no [painel Supabase](https://supabase.com/dashboard). Guarde a senha administrativa do banco fora do frontend.
2. No SQL Editor do projeto de desenvolvimento, execute, nesta ordem, os arquivos completos:
   - `supabase/migrations/202610140001_learning_access.sql`;
   - `supabase/migrations/202610140002_lesson_progress.sql`;
   - `supabase/migrations/202610150001_sequential_lessons.sql`;
   - `supabase/migrations/202610150002_completion_requirements.sql`;
   - `supabase/migrations/202610160001_student_profiles.sql`.

   Aplique somente as migrations ainda não executadas, em ordem. A quarta adiciona evidências de conclusão; a quinta adiciona perfis e o preenchimento automático após o cadastro. As novas migrations não foram executadas remotamente pelo assistente.

3. Em Authentication, habilite o provedor Email com senha e configure a confirmação de email. Esta aplicação trata tanto cadastro com confirmação quanto sessão imediata, conforme a configuração do projeto. Para uso público, configure o serviço de email/SMTP no Supabase conforme os limites e orientações do provedor.
4. Em Authentication → URL Configuration, defina a Site URL do ambiente e autorize os retornos de cadastro e recuperação:

```text
http://127.0.0.1:5173/login
http://127.0.0.1:5173/redefinir-senha
http://localhost:5173/login
http://localhost:5173/redefinir-senha
```

Inclua também as mesmas rotas na origem de produção antes de publicar. Para testar o build servido por `pnpm preview`, adicione a origem/porta mostrada pelo servidor, normalmente 4173. Links de confirmação e recuperação devem retornar ao mesmo ambiente onde o usuário iniciou o fluxo.

5. Copie a URL do projeto e sua chave **publishable** (ou `anon` legada) para `apps/web/.env.local`, usando `apps/web/.env.example`:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUBSTITUA
```

A `.env.example` na raiz aponta para o mesmo procedimento. Não salve esses placeholders como valores reais. Nenhuma chave `service_role`, `sb_secret_…`, senha de banco ou token administrativo pode ter prefixo `VITE_`. O build valida a configuração e recusa chaves privilegiadas antes de gerar os arquivos públicos.

6. Execute `pnpm dev` novamente após alterar o ambiente. Sem essas variáveis, o site público funciona e a área do aluno informa que está em preparação; não há autenticação de demonstração habilitada.

## Usuário e acesso manual

1. Abra `/cadastro`, informe os dados do aluno, email/senha e confirme o email quando solicitado.
2. Entre em `/login`. Uma conta recém-criada não recebe cursos automaticamente.
3. No SQL Editor, como administrador, abra `supabase/manual/grant-course-access.sql`, substitua `dev@example.com` pelo email cadastrado e execute. A consulta deve retornar exatamente uma concessão para `robotica-basico`, com início imediato e 12 meses de vigência.
4. Volte à interface e clique em “Atualizar meus acessos” ou recarregue a página. O curso passa a aparecer em `/app/meus-cursos`.

O mesmo arquivo renova uma concessão existente, sem duplicá-la, por meio da chave única usuário/produto. O navegador não executa essa operação. Para revogar, o administrador pode excluir a concessão no painel ou ajustar sua expiração mantendo `expires_at > starts_at`.

No MVP, cada curso tem um `productId` canônico igual ao seu `id`. Isso permite à política de progresso confirmar o entitlement do curso sem uma tabela de conteúdo estático. Todos os cursos novos desta fase devem manter essa relação. Uma futura venda em pacote exigirá uma expansão confiável de produtos para direitos individuais de curso; o browser não pode inventar esse vínculo.

## Dados e RLS

| Recurso                   | Políticas e privilégios                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `user_access`             | RLS ativa; `authenticated` só tem SELECT nas próprias linhas. Sem INSERT, UPDATE ou DELETE para clientes; `anon` sem acesso.           |
| `lesson_progress`         | RLS ativa; SELECT somente próprio; INSERT/UPDATE somente próprio com acesso vigente ao curso. DELETE não concedido; `anon` sem acesso. |
| `get_my_access()`         | RPC com `security invoker`, acessível apenas a autenticados. Retorna somente concessões próprias e horário do banco.                   |
| `has_course_access(text)` | Função invoker que usa usuário autenticado, produto e vigência no relógio do PostgreSQL.                                               |
| `stamp_lesson_progress`   | Trigger que define `updated_at` e normaliza `completed_at` pelo relógio do banco. O cliente não determina esses horários.              |

Identidade, e-mail e senha pertencem ao Supabase Auth (`auth.users`). A tabela `profiles` guarda somente dados do aluno com RLS de leitura/escrita próprias. Veja [Perfil do aluno](perfil-aluno.md) para campos, migration e validação.

O CourseGuard consulta concessões próprias e avalia `starts_at <= agora < expires_at`, ou acesso sem expiração. O relógio da interface parte do horário retornado pelo banco e avança com tempo monotônico. Falhas na consulta negam o acesso em vez de presumir liberação. O retorno à aba revalida os dados; o instante de expiração também atualiza a interface. As políticas do banco continuam verificando a vigência em cada escrita, inclusive se o navegador estiver desatualizado após uma revogação.

O conteúdo é estático/versionado, conforme o trade-off aceito no handoff: os guards controlam a experiência de navegação, enquanto RLS protege acessos e progresso. Os assets gerados não são DRM; alguém que obtenha uma URL de arquivo do build pode acessá-la. Não há API de conteúdo privado nesta etapa.

## Rotas e conteúdo

```text
/login
/cadastro
/esqueci-minha-senha
/redefinir-senha
/app                         → /app/meus-cursos
/app/meus-cursos
/app/curso/:courseId
/app/curso/:courseId/aula/:lessonId
/app/conta
```

O site público mantém suas rotas e layout. Cada `preview.json` contém um parágrafo e vídeo de apresentação. `lesson.json` configura a aula real, sem condições por ID: tipo, `hasLab`, vídeo opcional, atividades e código opcional. `content.md` e imagens permanecem na estrutura existente. As primeiras três aulas mantêm todo o material ampliado.

As dez aulas reais também possuem player, com o vídeo `hcuA5wkgUNA` configurado temporariamente em cada `lesson.json`, conforme solicitado pelo responsável. Ele é identificado como provisório e não representa a videoaula definitiva. A configuração é independente de `preview.json`, mesmo enquanto os dois contextos usam o mesmo vídeo. Quando os vídeos completos estiverem disponíveis, substitua o `videoId` de cada `lesson.json` e remova `isPlaceholder` (ou defina como `false`):

```json
{ "video": { "provider": "youtube", "videoId": "ID_REAL_11C" } }
```

Use um ID real do YouTube com 11 caracteres; o exemplo acima é ilustrativo. O vídeo público continua em `preview.json.video`.

O Course Engine valida os arquivos e determina sequência, navegação e totais. As aulas 8–10 continuam como esboços, pois a apostila atual contém apenas seus títulos. Nenhum projeto final foi inventado.

## Progresso e editor

A confirmação de conclusão é manual, após o vídeo e as atividades obrigatórias serem registrados no Supabase. Apenas a primeira aula está inicialmente disponível; concluir uma aula libera a seguinte. As anteriores continuam disponíveis para revisão. A lista, a sidebar, os links de navegação e a rota direta respeitam essa sequência. Só a última conclusão válida pode ser desfeita, voltando a bloquear as seguintes. Uma falha ao salvar não libera a próxima aula. Leia `docs/requisitos-conclusao.md` para critérios, atividades indisponíveis e limites da validação client-side.

O cálculo considera apenas o trecho contínuo concluído da sequência atual, evitando contar aulas removidas, duplicadas ou conclusões após lacunas. Registros antigos fora de ordem são preservados e voltam a contar quando as anteriores forem concluídas. “Meus cursos”, curso e sidebar exibem concluídas/total e percentual, e o botão Continuar leva à primeira pendente. O trigger da terceira migration impõe a mesma regra para INSERT/UPDATE diretos no banco, verifica entitlement e serializa alterações do mesmo aluno/curso. Somente os IDs de autorização são espelhados na função SQL; conteúdo pedagógico permanece versionado nos arquivos. Ao criar cursos ou alterar a ordem, atualizar a função em nova migration e o teste de alinhamento.

`CodeEditor` encapsula Monaco e recebe `value`, `onChange`, `language`, `readOnly`, `height` e `options`. `arduino` usa o realce C/C++ existente; não há linguagem Arduino própria, parser, compilador ou execução. Os workers são publicados localmente pelo Vite, sem CDN. O editor carrega apenas quando uma aula configurada possui `code`.

As aulas 4–7 possuem um rascunho de programação configurado, com estruturas vazias de `setup` e `loop`. Nenhuma pinagem divergente foi resolvida implicitamente. O texto digitado fica em localStorage, separado por usuário/curso/aula. Ele não é enviado a analytics nem salvo no Supabase. O progresso, por sua vez, é persistente no Cloud. Se o armazenamento local falhar, a interface avisa para copiar o código antes de sair.

## Testar o fluxo completo no Cloud

1. Faça cadastro, confirme email e entre; recarregue a página e confirme a permanência da sessão.
2. Sem concessão, verifique a lista vazia em Meus cursos e tente abrir `/app/curso/robotica-basico` diretamente: deve negar acesso.
3. Conceda acesso pelo SQL administrativo e atualize a interface.
4. Abra a primeira aula: conclusão bloqueada antes do vídeo. Pular ao fim não deve bastar. Assista dentro da plataforma até o checklist registrar a cobertura e então marque como concluída: 1/10 (10%). Recarregue e confirme a persistência.
5. Confirme que a segunda aula foi liberada e a terceira continua bloqueada, inclusive abrindo sua URL diretamente. Conclua a segunda, revise a primeira e confirme que apenas a segunda pode voltar a pendente. Desfaça a segunda e depois a primeira: a segunda deve bloquear novamente. Recarregue para verificar a persistência. Execute `supabase/tests/rls-smoke.sql` no SQL Editor para testar também a proteção do banco sem manter dados de teste.
6. Na aula 3, teste as montagens LED com protoboard e LED com botão. Depois, conclua a terceira aula e abra a quarta para testar o LED programável com Monaco. Siga `docs/awotech-lab.md`; código e fios devem ser restaurados após reload, sem iniciar automaticamente a execução do Arduino.
7. Teste acesso com início futuro e expirado; ambos devem ser negados. Use outra conta sem concessão para conferir isolamento entre alunos.
8. Saia e tente uma rota `/app` diretamente; deve voltar ao login. O progresso da conta anterior não deve aparecer ao entrar com outro usuário.
9. Solicite recuperação em `/esqueci-minha-senha`; abra o email, defina nova senha em `/redefinir-senha`, saia e entre com a nova senha. Links inválidos/expirados devem permitir solicitar outro link.
10. Execute `supabase/tests/rls-smoke.sql` no SQL Editor do ambiente de desenvolvimento. Ele cria usuários temporários, testa isolamento, negação de autoconcessão e escritas fora da vigência, e finaliza com ROLLBACK. Caso um teste falhe antes do fim, execute ROLLBACK antes de continuar.

O teste SQL não depende de Docker, pgTAP ou PostgreSQL local. Ele precisa de um Supabase real e não substitui o teste de entrega de emails.

## Dependências e validação local

Adicionadas somente `@supabase/supabase-js` e `monaco-editor` ao frontend. O pnpm lockfile fixa as versões instaladas. O bundle do Monaco foi dividido em chunks e é carregado sob demanda. Não foi acrescentado backend ou serviço de execução.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
```

`pnpm check` executa lint, formatação, testes, TypeScript e build. Os testes unitários cobrem catálogo, conteúdo, concessões, vigência, progresso e rejeição de chaves privilegiadas. A inspeção de navegador usa um build separado com valores públicos fictícios e respostas interceptadas do Supabase, sem modo de autenticação falsa na aplicação. Esse teste valida integração da interface, mas não comprova RLS ou autenticação real no Cloud.

## Limites desta entrega

- A conexão real com o Cloud foi validada usando a chave pública; as tabelas e a RPC estão disponíveis e negam acesso anônimo. O script de teste completo de RLS ainda não foi executado no Cloud.
- A entrega de email, login real, refresh de tokens e isolamento entre usuários autenticados precisam de validação final com contas reais.
- Os vídeos completos ainda precisam dos IDs reais. Aulas 4–7 mantêm os resumos existentes; aulas 8–10 ainda não têm detalhamento na apostila.
- AWOTech Lab, runtime/parser, circuitos, execução, pagamento, kits e assinaturas permanecem para as fases correspondentes.

Referências: [autenticação por senha](https://supabase.com/docs/guides/auth/passwords), [recuperação de senha](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e [Monaco ESM](https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md).
