# Análise da apostila de robótica

Análise realizada em 14/10/2026 a partir de `Apostila - Curso de Robótica.docx`, na raiz. O texto dos parágrafos e as imagens dos circuitos/códigos foram inspecionados. Os documentos originais não foram alterados.

SHA-256 da apostila analisada:

```text
1AD9E038AA42E04CC487E38810EF6A10D1F6BA05CB0A1E4BFB0BC4D38E1FAEA2
```

A apostila prevalece sobre os exemplos pedagógicos do handoff. A sequência geral é compatível, mas títulos, componentes e detalhes de código precisam considerar o material real.

## Mapa pedagógico

Os índices abaixo são os parágrafos zero-based de `word/document.xml`, incluindo parágrafos vazios. As imagens são os arquivos internos em `word/media`; não são números de página.

| Aula | Título na apostila          | Conteúdo e atividades                                                                         | Referência                          |
| ---- | --------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1    | Introdução à Robótica       | Instruções; hardware/software; exemplos cotidianos; imaginar um robô e seus comandos          | §42–82                              |
| 2    | Pensamento Computacional    | Sequência, algoritmo, condicional e loop; hambúrguer, escovação, sanduíche e pote de maionese | §100–155                            |
| 3    | Circuitos Elétricos         | Circuito aberto/fechado, LED, resistor, botão; circuito humano e montagens com protoboard     | §158–180; imagens 7 e 22            |
| 4    | Controlando os Circuitos    | Arduino, saída digital; piscar LED e semáforo                                                 | §188–211; imagens 13, 5, 8, 12 e 21 |
| 5    | Como Fazer um Robô Enxergar | Ultrassom, leitura de distância e sensor de ré com buzzer                                     | §221–240; imagens 16, 2, 18, 3 e 9  |
| 6    | A Cancela Inteligente       | Servo, posição angular, entrada/decisão/saída; cancela que abre por proximidade               | §244–266; imagens 28, 1 e 20        |
| 7    | Ligando os Motores          | Motor DC, driver, sentidos de giro e parada                                                   | §278–296; imagens 29 e 30           |
| 8    | Meu Primeiro Robô - Parte 1 | Somente título                                                                                | §318                                |
| 9    | Meu Primeiro Robô - Parte 2 | Somente título                                                                                | §319                                |
| 10   | Meu Primeiro Robô - Parte 3 | Somente título                                                                                | §320                                |

## Diferenças e lacunas relevantes

### Primeira atividade de LED

A primeira montagem de LED está na aula 3 e usa bateria de 9 V, sem programação. A primeira atividade que valida o conjunto editor + runtime + Arduino está na aula 4. É essa a candidata ao primeiro laboratório completo, preservando a aula 3 na sequência de aprendizagem.

Na aula 4, `image13.png` liga o LED ao pino **11**, com resistor identificado como **220 Ω** e retorno ao GND. Já `image5.png` usa **13** em `pinMode` e nos dois `digitalWrite`, com esperas de **1000 ms**. Os pinos 8 e 13 citados genericamente no handoff não resolvem essa divergência da própria apostila.

**Decisão deste bootstrap:** cadastrar o tema e os componentes, sem publicar pinagem, `circuit.json`, starter code ou desafio. A próxima implementação deve harmonizar desenho e código com uma decisão editorial explícita, em vez de apresentar uma montagem incompatível.

### Semáforo

O código da aula 4 usa variáveis inteiras: vermelho = 10, amarelo = 9, verde = 8. O ciclo é verde por 5000 ms, amarelo por 2000 ms e vermelho por 5000 ms; cada etapa desliga as outras duas luzes. O runtime precisará aceitar variáveis antes desta atividade. O diagrama da imagem 8 aparenta conectar as luzes aos pinos 11/10/9, também exigindo revisão conjunta de montagem e código.

### Ultrassônico e buzzer

A aula 5 contém abordagens diferentes. A primeira usa `#include <Ultrasonic.h>`, macros, objeto `Ultrasonic`, `timing`, `convert`, `long`, `float` e saída serial. O sensor de ré usa função auxiliar, `pulseIn`, `delayMicroseconds`, expressão numérica, condicionais, `tone` e `noTone`.

O buzzer está no diagrama e no código do sensor de ré; não pode ser omitido porque o resumo anterior do handoff destacou somente o HC-SR04. A imagem 9 define buzzer = 2, trigger = 5 e echo = 7, enquanto o diagrama da imagem 18 aparenta ligar trigger ao pino 7 e echo ao pino 6. A primeira montagem do ultrassônico (imagem 16) também deve ser reconciliada com as definições trigger = 4 e echo = 5 da imagem 2 antes de publicar instruções de ligação.

Uma API simplificada de distância, permitida pelo handoff, seria uma **adaptação pedagógica explícita**, não reprodução exata do código existente. O subconjunto mínimo do LED não executa esses programas.

### Cancela e motores

A cancela usa `Servo.h`, `attach`, `write`, função auxiliar de distância, `Serial` e condicionais. O exemplo abre a 90° quando a distância é menor ou igual a 20 cm, espera 3000 ms e fecha a 0°. O código define servo = 6, trigger = 5, echo = 7; o diagrama da imagem 28 aparenta usar outros pinos para trigger/echo. Conferir a montagem antes da configuração executável.

Na aula 7, a imagem 29 identifica o driver **L293D** e inclui também um HC-SR04. O código da imagem 30 controla somente os pinos 8 e 9 do motor, alternando 3000 ms de giro e 2000 ms de parada, sem ler o sensor. A figura aparenta usar pinos 9/10 para o driver. Essa diferença entre figura e atividade deve ser revisada; o sensor não foi declarado como obrigatório para o exercício de giro do motor.

O desenho de servo não confirma um SKU comercial SG90. A protoboard também não tem tamanho comercial fixado no texto. O catálogo usa identificadores genéricos nesses casos. O circuito de 9 V da aula 3 não deve herdar automaticamente o resistor de 220 Ω da aula 4.

### Projeto final e kit

As aulas 8–10 possuem apenas títulos. O objetivo de construir um robô autônomo aparece na introdução, mas não há instruções finais, lista de peças, quantidades, alimentação ou critérios de conclusão. Não há base suficiente para publicar um BOM completo nem exercícios finais.

## Conteúdo criado

O catálogo preserva as dez aulas e a ordem original, normalizando caixa/acentuação para leitura. As aulas 1–3 agora apresentam os conceitos, exemplos, imagens e enunciados dos exercícios da apostila. A introdução ao curso e a apresentação do professor foram incluídas na aula 1. As aulas 4–7 mantêm resumos e 8–10 são apenas esboços. Nenhuma delas recebe conclusão automática ou simulação. `requiredComponents` é uma referência pedagógica parcial, não uma lista de compra.

Por solicitação do responsável pelo curso, as dez aulas usam o vídeo `hcuA5wkgUNA` como placeholder, com `video.isPlaceholder: true`. O player informa que ele não corresponde à aula. Para substituir por uma videoaula definitiva, trocar o ID e remover a flag ou defini-la como `false`.

### Imagens incorporadas nas aulas 1–3

**Separação da prévia pública:** o material descrito abaixo foi preservado para a plataforma. O catálogo público agora apresenta apenas `preview.json` (resumo e vídeo de apresentação). Textos integrais, exercícios e as 12 imagens não são importados pelo build público. A configuração do vídeo de prévia é independente da videoaula em `lesson.json`.

Os arquivos foram copiados diretamente do DOCX, sem alteração, para `assets/` dentro de cada aula. O Vite publica os assets com URLs próprias; não há dependência do diretório temporário de extração. As imagens têm texto alternativo, legenda e link para ampliação.

| Aula | Arquivo no DOCX | Arquivo em `assets/`          |
| ---- | --------------- | ----------------------------- |
| 1    | `image14.jpg`   | `aspirador.jpg`               |
| 1    | `image24.png`   | `semaforo.png`                |
| 1    | `image10.jpg`   | `braco-robotico.jpg`          |
| 1    | `image17.jpg`   | `portoes.jpg`                 |
| 1    | `image25.jpg`   | `componentes.jpg`             |
| 1    | `image19.png`   | `robo-hardware.png`           |
| 1    | `image6.jpg`    | `software.jpg`                |
| 2    | `image15.png`   | `condicional-maionese.png`    |
| 2    | `image26.png`   | `loop-escovacao.png`          |
| 3    | `image4.png`    | `circuito-aberto-fechado.png` |
| 3    | `image7.png`    | `led-protoboard.png`          |
| 3    | `image22.png`   | `led-botao.png`               |

Os textos foram organizados para leitura na web, preservando todos os assuntos e atividades dessas aulas. As linhas para resposta foram convertidas em enunciados para registro em caderno/documento; não há salvamento de respostas nesta etapa. `activitiesInContent` evita repetir no rodapé os exercícios já detalhados no Markdown.

As notas de leitura complementam o material sem alterar as imagens: o fluxograma da maionese repete “Abrir o pote” no início, e a figura de circuitos mostra uma ligação direta entre os polos da bateria. A aula esclarece a decisão no primeiro caso e o curto-circuito no segundo. Também distingue as figuras ilustrativas da lista do kit e não infere dimensionamento elétrico dos desenhos.

Para repetir a inspeção local:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/inspect-apostila.ps1
```

O script gera texto, mapa de imagens e imagens originais em `.tmp/apostila/`, fora do versionamento. `ExecutionPolicy Bypass` vale somente para esse processo, sem alterar a política global do Windows. Não substitui a inspeção visual dos diagramas e códigos.
