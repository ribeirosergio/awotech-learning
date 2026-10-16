# Vídeo e práticas obrigatórios

A conclusão continua sendo confirmada pelo aluno, mas o botão só libera após registrar no Supabase o vídeo e todas as práticas obrigatórias da aula. A navegação sequencial existente só libera a próxima aula depois dessa conclusão. Conclusões antigas são preservadas, sem zerar o progresso.

## Configurar no Cloud

Execute **somente** `supabase/migrations/202610150002_completion_requirements.sql` se as três anteriores já foram aplicadas. Ela adiciona `lesson_evidence`, RLS de leitura própria, RPC `save_lesson_evidence` e um trigger que rejeita novas conclusões sem requisitos. Depois execute `supabase/tests/rls-smoke.sql` no projeto de desenvolvimento; o script faz rollback dos dados de teste.

A migration e o teste SQL não foram executados remotamente pelo assistente. Antes da aplicação, a área do aluno informa erro ao consultar a tabela nova. Não há chave nova, dependência, Docker ou serviço adicional. O site público e seus previews permanecem separados.

## Vídeos

O player autenticado usa a [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference). Amostras de posição, estado e velocidade a cada 500 ms permitem acumular os intervalos reproduzidos. Um salto incompatível com o tempo decorrido é tratado como seek, sem dar crédito pelo trecho pulado. Repetições de um mesmo trecho não somam crédito em duplicidade. Pausas, buffering e abas ocultas não acumulam reprodução.

O requisito exige cobertura integral, com tolerância de amostragem de no máximo 2% ou 2 segundos, o menor deles. O checklist mostra o percentual **salvo**. Abaixo do vídeo aparece também a cobertura observada localmente. O salvamento ocorre aproximadamente a cada dez segundos, ao pausar/terminar e na saída da aula; podem se perder os últimos segundos ao fechar abruptamente o navegador. Erros de player e gravação têm mensagem e tentativa novamente, sem liberar conclusão indevidamente. A falha no player mantém o requisito pendente.

Assista dentro da plataforma. A reprodução em aba externa do YouTube não é rastreável e não gera crédito. Os vídeos placeholder também cumprem essa regra provisoriamente. Evidências são separadas por aluno/curso/aula/vídeo: usar o mesmo ID provisório em várias aulas não compartilha crédito entre elas. Ao trocar o vídeo definitivo, atualize `lesson.json` e o identificador correspondente na função SQL em uma nova migration; evidências do vídeo anterior não satisfazem uma nova conclusão.

## Práticas

- Aula 3 / `battery-led`: circuito válido e LED aceso.
- Aula 3 / `button-led`: circuito válido, LED aceso com botão fechado e depois apagado com botão aberto, mantendo a mesma montagem.
- Aula 4 / `blink-led`: montagem válida, código compilado e simulação sem erro por pelo menos dois ciclos, com alternância real de HIGH/LOW e pelo menos 100 ms por estado. Apenas executar, escrever no pino errado ou apagar e religar instantaneamente não aprova.
- Aula 4 / `traffic-light`: obrigatório e ainda indisponível. A aula não pode ser concluída enquanto essa atividade não for implementada.
- Aulas 5–10: a prática permanece indisponível e impede novas conclusões. Não foram implementados novos laboratórios nesta tarefa.

As aprovações são registradas automaticamente quando o simulador observa o comportamento. Elas não concluem a aula sozinhas; o aluno ainda confirma após satisfazer o vídeo e todas as atividades. Uma aprovação já salva não é apagada quando ele experimenta outra ligação ou código. A falta de conexão permite tentar salvar a aprovação novamente.

Requisitos ficam em `completion.activities` dos arquivos estáticos. A função SQL espelha somente curso/aula, vídeo, IDs de atividades e disponibilidade, sem armazenar material didático em tabelas. O teste de contrato detecta divergências. Ao implementar uma prática pendente, atualize sua disponibilidade na configuração e em nova migration; apenas retirar o aviso visual não libera a conclusão.

## Segurança e limites

O browser não escreve diretamente em `lesson_evidence`. A RPC fixa a identidade em `auth.uid()`, exige entitlement vigente e aulas anteriores concluídas, valida vídeo, formato/limites dos intervalos e atividades conhecidas/disponíveis, une os registros e serializa alterações por aluno/curso. O trigger mantém a conclusão pendente se faltar vídeo/atividade. Não é possível aprovar uma atividade indisponível enviando seu ID à RPC. Usuários não podem ler evidências alheias ou conceder acesso ao curso.

**Este é um controle pedagógico, não um atestado antifraude.** A duração, os intervalos e os resultados de prática são relatos do código executado no navegador. Uma pessoa que manipule deliberadamente as chamadas autenticadas pode falsificar esses relatos; RLS e a RPC não provam atenção ao vídeo nem que o código foi executado fisicamente no cliente. Entitlements e operações privilegiadas continuam protegidos no banco. Provas resistentes à manipulação exigiriam validação independente no servidor, fora do runtime exclusivamente client-side adotado nesta fase.

## Validação

`pnpm check` cobre lint, formatação, TypeScript, testes e build. Os testes incluem união de intervalos, seek, repetição, velocidade, aba oculta, tolerância, requisitos pendentes e contrato SQL/conteúdo.

No navegador, um build separado usa Supabase e YouTube simulados: teoria exige vídeo; seek não conclui; mesmo vídeo em aulas distintas não transfere crédito; duas montagens e abertura/fechamento do botão são exigidos; falha de gravação não libera o botão; nova tentativa e reload preservam registros; Arduino precisa apresentar alternância observável; semáforo pendente bloqueia a aula 4. Isso não comprova execução real da migration/RLS ou integração de reprodução com o YouTube em produção. O fluxo real deve ser verificado no Cloud após a aplicação.
