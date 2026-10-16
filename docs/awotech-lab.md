# AWOTech Lab — primeira atividade

Aula 4 → atividade 1, “Piscando um LED com Arduino”. A aula 3 também possui as duas montagens sem programação descritas ao final deste guia. A plataforma mantém autenticação, entitlement e ordem das aulas. A confirmação de conclusão exige agora vídeo assistido e práticas aprovadas: veja `docs/requisitos-conclusao.md` e a migration de evidências que deve ser aplicada no Cloud.

## Testar

1. Execute `pnpm install --frozen-lockfile` e `pnpm dev`, com o Supabase configurado como no guia da plataforma.
2. Entre com acesso ao curso e conclua as três primeiras aulas para liberar a quarta.
3. Abra `/app/curso/robotica-basico/aula/robotica-04-controlando-circuitos` e encontre AWOTech Lab.
4. Selecione Arduino D13 e resistor A; resistor B e LED ânodo (+); LED cátodo (−) e Arduino GND. Também é possível arrastar entre os terminais ou usar Tab/Enter. O resistor pode ser invertido ou ficar no retorno ao GND.
5. Use **Verificar montagem**. Montagem incompleta, ligação errada e LED invertido recebem feedback, e não podem iniciar a simulação.
6. Escreva o programa ou use **Carregar exemplo**, que substitui o texto do editor pelo exemplo da apostila. Execute e observe o LED alternar a cada segundo.
7. Pare, troque `delay(1000)` por `delay(500)` e execute novamente. O período visual deve mudar. `delay` usa milissegundos.
8. Remova um ponto e vírgula e execute: deve mostrar linha/coluna. Remova `pinMode`: deve indicar a necessidade de OUTPUT. Troque as três referências ao pino 13 por 12: o programa roda, mas o LED montado em D13 fica apagado.
9. Pare ou reinicie: LED apagado; reiniciar zera o tempo e mantém código e montagem. Recarregar preserva o rascunho, sem reiniciar a execução automaticamente. Sair da aula cancela a simulação.

Código e fios são persistidos somente no localStorage, separados por aluno/curso/aula. O rascunho de código anterior é preservado na mesma chave; se estiver vazio, pode usar Carregar exemplo. A edição de código/fios fica bloqueada durante a execução.

## Decisão pedagógica

A apostila da raiz foi consultada novamente em 15/10/2026, com SHA-256 `1AD9E038AA42E04CC487E38810EF6A10D1F6BA05CB0A1E4BFB0BC4D38E1FAEA2`. Os parágrafos 188–211 definem saída digital e a atividade de piscar LED. A imagem 5 usa pino 13 e esperas de 1000 ms; a imagem 13 desenha pino 11 e resistor de 220 Ω.

Neste laboratório foi adotado **D13 em código e montagem**, seguindo o código da imagem 5. O resistor permanece 220 Ω. O desenho original e o DOCX não foram alterados. A conexão é representada diretamente entre terminais, sem protoboard nesta primeira atividade. O semáforo é a segunda atividade da mesma aula e continua pendente.

## Organização e limites

- `lesson.json`: `lab.kind = blink-led`, pino e resistor; nenhuma condição por ID de aula na página. O starter apresenta a configuração da saída e deixa a sequência para o aluno; o exemplo completo é uma ação explícita.
- `packages/arduino-runtime`: lexer + parser para uma gramática pequena e IR. Não interpreta JavaScript nem compila C++ completo.
- `packages/simulator`: validador da montagem separado do runtime, estado digital e relógio virtual determinístico. Delays são esperas lógicas; não há busy-wait.
- `apps/web/src/lab`: bancada SVG, conexões interativas, Monaco reutilizado, controles e feedback. Componentes em posições fixas; fios podem ser removidos. Sem biblioteca visual nova.

APIs disponíveis: `pinMode`, `digitalWrite`, `delay`; `setup` uma vez e `loop` repetido. Declarações globais `int`/`const int` são constantes neste subconjunto. Não há atribuições, condicionais, bibliotecas, sensores, servo, motor ou execução arbitrária. Fonte e instruções são limitadas; `loop` exige delay positivo. A simulação usa requestAnimationFrame com avanço limitado a 250 ms por quadro, desacelerando em abas inativas em vez de acumular trabalho.

A validação é topológica, sem cálculo elétrico. Cada bancada é guiada pela atividade. As práticas disponíveis registram aprovação pedagógica automática; o aluno ainda confirma a conclusão após satisfazer todos os requisitos. O semáforo da aula 4 e as práticas posteriores permanecem pendentes e impedem novas conclusões dessas aulas.

## Validação

Os testes unitários cobrem gramática, rejeição de sintaxe não suportada, limites, constantes, relógio, setup único, repetição, alteração de delay/pino, parada, requisito OUTPUT e montagens válidas/inválidas. Execute `pnpm check`. A validação de navegador utiliza um build separado e Supabase simulado, sem escrever em contas reais; o acesso autenticado real continua dependente da configuração do Cloud.

## Aula 3 — circuitos sem Arduino

Abra a aula 3 após concluir as duas anteriores. No AWOTech Lab, escolha **LED com protoboard** ou **LED com botão**, correspondentes às atividades 2 e 3 da apostila. A atividade 1, circuito humano, permanece uma experiência em turma. Não há editor nem programação nesta aula.

O resistor e o LED já vêm encaixados em um recorte guiado da protoboard. Os três contatos A/B/C de cada grupo colorido são conectados internamente; grupos distintos são isolados. Cada barramento possui dois contatos interligados. A representação é simplificada e não pretende ensinar a disposição de todos os furos de uma placa comercial. O desenho mostra os pontos de contato e a continuidade interna.

1. Ligue bateria (+) a positivo 1 e bateria (−) a negativo 1.
2. Ligue positivo 2 ao grupo 1 C. O resistor conecta o grupo 1 ao 2; o LED está entre os grupos 2 e 3, com o ânodo no 2.
3. Na primeira montagem, ligue grupo 3 C ao negativo 2: o LED acende imediatamente. Remova um fio para observar o circuito abrir e o LED apagar.
4. Na montagem com botão, ligue grupo 3 C ao botão A e botão B ao negativo 2. **Clique no próprio botão desenhado no circuito** para abrir/fechar o caminho. Também é possível focá-lo com Tab e usar Enter ou Espaço; o contorno indica foco e `aria-pressed` informa o estado. O botão representa dois contatos que abrem/fecham; não simula os quatro pinos do pushbutton físico.

**Verificar montagem** explica caminho interrompido, polos unidos diretamente, polaridade incorreta e componentes desviados por fios. A continuidade usa os contatos internos da protoboard, não apenas a quantidade de fios. O LED fica apagado em montagens inválidas, e o botão precisa estar em série na segunda atividade. Ligações equivalentes pelos contatos do mesmo grupo são aceitas.

As montagens são salvas separadamente no localStorage por usuário/curso/aula/atividade. Ao trocar de atividade ou recarregar, o botão começa aberto. As aprovações vão para o Supabase: o LED precisa acender na primeira montagem e acender/apagar pelo botão na segunda. Não há conclusão automática da aula; o aluno confirma depois do vídeo e de todas as práticas.

A bancada mostra fileiras de furos, barramentos e canal central. Os grupos guiados A/B/C ficam na parte superior, sem continuidade interna através do canal; as pernas do LED são desenhadas como ligações explícitas aos grupos. Os furos menores restantes são referência visual; os contatos maiores identificados continuam sendo os pontos interativos. A mudança visual preserva IDs de terminais e rascunhos existentes.

Fonte pedagógica: imagens 7 e 22 da apostila, com bateria de 9 V, protoboard, LED, resistor e botão; SHA-256 da fonte permanece o registrado acima. O resistor não recebe valor numérico nem faixas de valor nesta bancada: a apostila não o especifica em texto, e 220 Ω da aula 4 não é automaticamente adotado para 9 V. A simulação verifica apenas continuidade e polaridade, sem dimensionamento elétrico. O DOCX e as imagens originais permanecem preservados.

Implementação: `lab.kind = electric-circuits` em `lesson.json`; `createElectricCircuit`/`evaluateElectricCircuit` no simulador; `ElectricCircuitLab` e `ElectricBoard` no frontend. A bancada e a interação dos terminais/fios são compartilhadas com a aula 4. O catálogo permite uma definição de laboratório sem `code` para este cenário. A bancada não exigiu dependência nova; a etapa de requisitos acrescenta a migration `202610150002_completion_requirements.sql` para persistir as verificações.
