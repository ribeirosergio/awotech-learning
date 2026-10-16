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

O procedimento para criação, aplicação das migrations, configuração das URLs e validação real está em `docs/plataforma-supabase.md`. O teste SQL é transacional, usa dois usuários temporários e termina com ROLLBACK. Não requer banco local ou Docker.

## Atualização: sequência obrigatória — 15/10/2026

- `pnpm check`: lint, formatação, 23 testes, TypeScript e build aprovados. O Vite sinalizou o chunk principal de aproximadamente 584 kB (171 kB gzip); o build foi concluído. Monaco continua carregado sob demanda.
- Chrome headless com build de produção e Supabase simulado: somente a primeira aula disponível no início; lista/sidebar sem links para aulas bloqueadas; acesso direto por URL bloqueado sem material, player, conclusão ou editor; navegação seguinte liberada somente após salvar.
- Persistência após reload, revisão das anteriores, reabertura apenas da última conclusão, bloqueio novamente após reabertura e manutenção do bloqueio quando a gravação falha.
- Progresso antigo fora de ordem preservado, com liberação ao preencher as lacunas; aula prática liberada com Monaco; layout de 390 px sem transbordamento e preview público preservado. Nenhuma exceção de execução no navegador.
- Teste unitário confere que os IDs e a ordem na função SQL correspondem ao `course.json`. O script SQL cobre também tentativas de pular aulas por INSERT/UPDATE, aula inexistente, upsert e reabertura fora de ordem.

A migration `202610150001_sequential_lessons.sql` e o teste SQL atualizado **ainda precisam ser executados no Supabase Cloud**. Os testes de navegador usam respostas simuladas e não comprovam a execução real do trigger, RLS ou concorrência no banco. A configuração pública disponível não permite aplicar migrations administrativas.

## Atualização: AWOTech Lab — 15/10/2026

Primeira atividade na aula 4, com D13 e resistor de 220 Ω, conforme a decisão em `docs/awotech-lab.md`. Nenhuma migration nova para o laboratório.

- Lint, formatação, TypeScript, 46 testes e build de produção aprovados. O aviso existente de chunk principal acima de 500 kB permanece; laboratório, runtime e Monaco carregam sob demanda.
- Chrome headless em build separado, com Supabase simulado: montagem por teclado e eventos de arraste, bloqueio de circuito incompleto, LED invertido, verificação da montagem correta, programa de exemplo executado com transições reais de HIGH/LOW na interface.
- Edição real no Monaco, alteração de delay/pino, diagnósticos de parser e erro por falta de OUTPUT; parada e reinício; código/fios restaurados após reload, sem execução automática; saída da rota encerra a simulação.
- Layout desktop de 1920 px e celular de 390 px sem transbordamento da página; preview público sem laboratório; nenhuma escrita automática de conclusão e nenhuma exceção de execução do aplicativo no navegador.

Esses testes não criam contas nem alteram dados reais no Supabase. A conclusão continua manual. O teste SQL de sequência/RLS permanece dependente de execução no Cloud pelo responsável.

## Atualização: circuitos da aula 3 — 15/10/2026

- 54 testes, lint, formatação, TypeScript e build aprovados. Não há nova dependência ou migration. O build atual não apresenta o aviso de chunk acima de 500 kB registrado na execução anterior.
- Chrome headless com Supabase simulado: aula 3 sem Monaco; montagem pelas conexões da protoboard; LED acende ao completar o caminho e apaga ao remover fio; botão abre/fecha o circuito; polos invertidos mantêm LED apagado e recebem feedback.
- Rascunhos independentes por atividade e restauração após reload; botão reabre ao trocar atividade; nenhuma conclusão automática; aula 4 bloqueada enquanto a terceira está pendente; preview público sem laboratório; tela de 390 px sem transbordamento da página; nenhuma exceção de execução do aplicativo.
- Regressão do laboratório da aula 4: montagem por teclado e arraste, Monaco editável, execução HIGH/LOW, alteração de pino/delay, diagnósticos, parada/reinício, persistência e encerramento ao sair da rota aprovados.

Protoboard e botão são representações guiadas de continuidade. Não foi realizado cálculo elétrico nem definida uma resistência para uso físico com 9 V. As imagens originais da apostila foram preservadas.

### Ajuste visual e interação direta

Protoboard com fileiras de furos e canal central, mantendo grupos isolados e os IDs de contato dos rascunhos existentes. O controle externo foi substituído pelo próprio botão SVG clicável, com rótulo de estado próximo ao desenho, foco visível e suporte a Enter/Espaço. No Chrome headless com Supabase simulado, clique real por coordenadas no desenho acendeu o LED, Enter abriu o circuito e apagou o LED; persistência, polos invertidos e navegação permaneceram aprovados. Lint, TypeScript, 54 testes e build aprovados.

## Atualização: requisitos de conclusão

- Lint, TypeScript, 61 testes e build aprovados em `pnpm check`. Os testes agora cobrem reprodução, seek, cobertura sem duplicidade, velocidade, aba oculta, tolerância, práticas pendentes e alinhamento com a configuração SQL.
- Navegador com Supabase e player YouTube simulados: conclusão teórica bloqueada sem reprodução; seek para o fim não conclui; crédito por aula mesmo com ID provisório repetido; aula 3 exige vídeo e as duas montagens; botão precisa acender e apagar mantendo a montagem; falha de gravação mantém bloqueio, nova tentativa funciona e reload restaura as verificações.
- Arduino: código sem espera apagado não registra aprovação; código com dois ciclos e estados perceptíveis registra o LED. A atividade de semáforo ainda pendente mantém a aula 4 bloqueada para nova conclusão, conforme a configuração.
- A migration `202610150002_completion_requirements.sql` e o teste SQL atualizado ainda não foram executados no Cloud. A integração real de reprodução YouTube também precisa ser verificada pelo responsável; o teste simula o contrato da IFrame API. Limites da validação estão em `docs/requisitos-conclusao.md`.
