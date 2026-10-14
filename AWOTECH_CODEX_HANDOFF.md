# AWOTech Learning Platform — Handoff para desenvolvimento no Codex

> Documento de contexto e especificação inicial do produto.  
> Objetivo: permitir continuar o desenvolvimento diretamente no Codex sem precisar reconstruir as decisões tomadas nesta conversa.


## 0. Fonte de verdade do conteúdo pedagógico

A **apostila atual do Curso de Robótica estará disponível na raiz do projeto** e deve ser consultada pelo Codex sempre que houver qualquer necessidade de entender, implementar ou validar conteúdo pedagógico do curso.

O arquivo pode ter nome semelhante a:

```text
Apostila - Curso de Robótica.docx
```

ou outro nome equivalente claramente identificável na raiz.

### Regra importante

A apostila existente na raiz do projeto deve ser tratada como a **fonte de verdade mais atual para o conteúdo do curso de robótica**.

As descrições de aulas, exemplos e sequência pedagógica presentes neste handoff foram elaboradas a partir de uma versão anterior da apostila e podem estar desatualizadas.

Portanto, em caso de qualquer divergência entre:

```text
AWOTECH_CODEX_HANDOFF.md
```

e a apostila encontrada na raiz do repositório, usar a seguinte prioridade:

```text
1. Apostila atual na raiz do projeto
2. Configurações e arquivos de conteúdo já existentes no repositório
3. AWOTECH_CODEX_HANDOFF.md
```

O handoff continua sendo a referência principal para:

- arquitetura;
- stack;
- decisões técnicas;
- modelo de dados;
- estratégia de baixo custo;
- laboratório virtual;
- pagamentos;
- autenticação;
- organização do projeto.

A apostila deve prevalecer especificamente para:

- nome e ordem das aulas;
- conteúdo pedagógico;
- conceitos ensinados;
- atividades;
- exemplos;
- componentes utilizados;
- projetos propostos;
- progressão do curso;
- textos que serão apresentados ao aluno.

### Antes de implementar uma aula de robótica

O Codex deve:

1. localizar a apostila na raiz do projeto;
2. consultar a aula correspondente;
3. confirmar quais conceitos, componentes e atividades aparecem na versão atual;
4. somente então criar ou alterar `lesson.json`, `content.md`, `challenge.json`, `circuit.json` ou qualquer comportamento do laboratório relacionado àquela aula.

Não assumir que a estrutura pedagógica descrita neste documento está atualizada sem verificar a apostila.


---

## 1. Visão do produto

A AWOTech Learning Platform será uma plataforma própria de cursos de tecnologia com forte foco em aprendizado prático e interativo.

A proposta não é ser apenas uma biblioteca de videoaulas. O diferencial é combinar:

- conteúdo em vídeo;
- textos e explicações curtas;
- desafios;
- editor de código;
- laboratório virtual guiado;
- feedback imediato;
- progresso do aluno.

Os primeiros eixos de conteúdo serão:

1. **Robótica**
2. **Programação**

No curso de robótica, o aluno deverá conseguir montar virtualmente o setup de cada aula, escrever código e executar a simulação para observar LEDs acendendo, servos movimentando, motores girando, sensores respondendo etc.

O laboratório pode lembrar visualmente a experiência do Tinkercad, mas **não é um concorrente do Tinkercad** e não deve tentar ser um simulador eletrônico genérico.

A plataforma deve ser simples, guiada e específica para as atividades de cada aula.

---

# 2. Princípios do produto

## 2.1. Aprender fazendo

O fluxo ideal de uma aula é:

```text
Aprender
   ↓
Montar
   ↓
Programar
   ↓
Executar
   ↓
Observar
   ↓
Corrigir
   ↓
Concluir desafio
```

A experiência não deve se resumir a:

```text
assistir vídeo → marcar aula como concluída
```

---

## 2.2. Laboratório guiado

O laboratório virtual deve limitar o universo do aluno ao que aquela aula realmente precisa.

Exemplo: aula de LED.

Componentes disponíveis:

- Arduino Uno;
- protoboard;
- LED;
- resistor;
- fios.

Não haverá catálogo completo de componentes eletrônicos.

Na aula seguinte podem ser liberados novos componentes.

Isso reduz:

- complexidade técnica;
- dificuldade de uso;
- possibilidade de erro;
- tempo perdido pelo aluno;
- escopo de desenvolvimento.

---

## 2.3. Não simular eletrônica física completa

Não é necessário calcular:

- corrente elétrica;
- tensão real em todos os pontos;
- resistência equivalente;
- torque real;
- carga;
- ruído;
- características físicas completas dos componentes.

A plataforma trabalha com uma abstração pedagógica.

Exemplo:

```text
LED conectado ao pino 8

digitalWrite(8, HIGH)
        ↓
LED = ligado
```

Servo:

```text
servo.write(90)
        ↓
servo.angle = 90
        ↓
animação visual
```

Motor:

```text
IN1 = HIGH
IN2 = LOW
        ↓
motor = clockwise
```

Sensor ultrassônico:

```text
objeto visual a 18 cm
        ↓
sensor.distance = 18
        ↓
código do aluno recebe 18
```

---

# 3. Decisões já tomadas

Estas decisões devem ser consideradas como padrão do MVP.

## Plataforma

- frontend web;
- foco inicial em desktop/notebook;
- responsividade desejável, mas laboratório não precisa ser otimizado para celular no primeiro MVP;
- interface em português;
- cursos organizados em módulos/aulas;
- conteúdo majoritariamente estático;
- laboratório executado no navegador.

## Vídeos

**Decisão: utilizar YouTube com vídeos não listados.**

Motivos:

- custo zero de armazenamento e streaming;
- infraestrutura pronta;
- player confiável;
- adequado ao MVP.

Trade-off aceito:

- vídeo não listado não é DRM;
- quem tiver o link pode compartilhá-lo;
- isso é aceitável na fase inicial.

A aplicação armazenará apenas:

```text
youtubeVideoId
```

Exemplo:

```json
{
  "videoProvider": "youtube",
  "videoId": "abc123"
}
```

---

# 4. Modelo comercial definido

## MVP

Venda individual por curso.

Exemplo conceitual:

```text
Curso de Robótica
Pagamento único
12 meses de acesso
```

Não implementar assinatura recorrente no MVP.

## Futuro

Quando houver catálogo suficientemente grande:

```text
AWOTech+
assinatura mensal/anual
todos os cursos
```

A arquitetura deve suportar futuramente os dois tipos de acesso.

---

## 4.1. Acesso

Evitar campos como:

```text
isPremium = true
```

Preferir modelo de entitlement/acesso:

```text
user_access
```

Exemplo:

```text
user_id: 123
product_id: robotica-basico
access_type: purchase
starts_at: 2026-10-14
expires_at: 2027-10-14
```

No futuro:

```text
user_id: 456
product_id: awotech-plus
access_type: subscription
```

---

# 5. Pagamentos

## Gateway inicial

**Mercado Pago**

Utilizar checkout hospedado pelo provedor.

A AWOTech não deve manipular:

- número do cartão;
- CVV;
- dados sensíveis de pagamento.

Fluxo:

```text
Aluno
  ↓
Comprar curso
  ↓
Checkout Mercado Pago
  ↓
PIX / cartão
  ↓
Pagamento aprovado
  ↓
Webhook
  ↓
função serverless valida pagamento
  ↓
user_access é criado
  ↓
curso liberado por 12 meses
```

---

## 5.1. Regras importantes

- nunca liberar curso somente porque o frontend recebeu retorno de sucesso;
- concessão de acesso deve ocorrer após confirmação segura do pagamento;
- validar assinatura/origem do webhook do Mercado Pago;
- garantir idempotência do webhook;
- um mesmo `payment_id` não pode conceder acesso duas vezes.

---

# 6. Stack proposta

Objetivo principal: **baixo custo operacional**.

## Frontend

```text
React
TypeScript
Vite
```

UI:

```text
Tailwind CSS
```

Editor:

```text
Monaco Editor
```

Motivo do Monaco:

- experiência parecida com VS Code;
- syntax highlighting;
- autocomplete futuro;
- bom para cursos de programação e robótica;
- reutilizável em vários cursos.

---

## Hospedagem

```text
Cloudflare Pages
```

Objetivo:

- servir aplicação e assets estáticos;
- evitar servidor próprio;
- deploy por Git.

---

## Auth e banco

```text
Supabase
```

Usar:

- Supabase Auth;
- PostgreSQL;
- Row Level Security;
- Edge Functions apenas onde necessário.

Não criar backend ASP.NET Core no MVP.

Motivo:

a API inicialmente serviria quase somente para autenticação, acesso e progresso, funções que o Supabase já atende.

ASP.NET poderá ser introduzido futuramente se surgirem necessidades como:

- escolas;
- turmas;
- professores;
- dashboards;
- certificados avançados;
- billing complexo;
- integrações;
- relatórios;
- APIs públicas.

---

# 7. Filosofia de armazenamento

Quase todo o conteúdo deve ficar no código/repositório.

## Estático

- catálogo de cursos;
- descrição dos cursos;
- módulos;
- aulas;
- textos;
- Markdown;
- imagens;
- configuração de laboratório;
- componentes permitidos;
- starter code;
- regras pedagógicas;
- challenges;
- expected circuit;
- testes da atividade.

## Banco

Guardar somente dados específicos do usuário ou de pagamento.

### Necessário

- autenticação;
- acesso aos cursos;
- progresso;
- pagamentos processados.

### Não necessário inicialmente

- conteúdo das aulas;
- configuração dos componentes;
- textos da aula;
- catálogo completo.

---

# 8. Modelo de dados sugerido

O Supabase Auth já utiliza `auth.users`.

Não duplicar senha nem implementar autenticação própria.

## profiles

Opcional, mas útil.

```sql
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text,
    created_at timestamptz not null default now()
);
```

---

## user_access

```sql
create table user_access (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references auth.users(id) on delete cascade,

    product_id text not null,

    access_type text not null
        check (access_type in ('purchase', 'subscription', 'manual')),

    starts_at timestamptz not null default now(),

    expires_at timestamptz,

    created_at timestamptz not null default now(),

    unique(user_id, product_id)
);
```

Para compra de curso:

```text
expires_at = data da compra + 12 meses
```

---

## lesson_progress

```sql
create table lesson_progress (
    user_id uuid not null references auth.users(id) on delete cascade,

    course_id text not null,

    lesson_id text not null,

    completed boolean not null default false,

    completed_at timestamptz,

    updated_at timestamptz not null default now(),

    primary key (user_id, course_id, lesson_id)
);
```

---

## payments

```sql
create table payments (
    id uuid primary key default gen_random_uuid(),

    provider text not null,

    provider_payment_id text not null unique,

    user_id uuid references auth.users(id),

    product_id text not null,

    status text not null,

    amount numeric(12,2),

    currency text default 'BRL',

    raw_payload jsonb,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);
```

Guardar `raw_payload` é opcional, mas útil para auditoria no MVP.

---

# 9. RLS / segurança

Ativar Row Level Security.

O aluno deve conseguir:

- ler seu próprio perfil;
- ler seus próprios acessos;
- ler seu próprio progresso;
- atualizar somente seu próprio progresso.

O frontend **não pode**:

- criar `user_access`;
- modificar pagamentos;
- conceder acesso;
- usar `service_role`.

`service_role` só pode existir em:

- Supabase Edge Function;
- ambiente server-side seguro.

---

# 10. Conteúdo do curso no repositório

Estrutura sugerida:

```text
content/
├── robotica/
│   ├── course.json
│   │
│   ├── aula-01-introducao/
│   │   ├── lesson.json
│   │   ├── content.md
│   │   └── challenge.json
│   │
│   ├── aula-02-pensamento-computacional/
│   │   ├── lesson.json
│   │   ├── content.md
│   │   └── challenge.json
│   │
│   ├── aula-03-circuitos/
│   │   ├── lesson.json
│   │   ├── content.md
│   │   ├── circuit.json
│   │   └── challenge.json
│   │
│   └── ...
│
└── programacao/
```

---

# 11. Estrutura atual do curso de robótica

O curso presencial/apostila já possui esta progressão.

## Aula 1 — Introdução à Robótica

Conceitos:

- o que é um robô;
- robôs executam instruções;
- exemplos do cotidiano;
- hardware;
- software.

Exemplos usados:

- aspirador automático;
- semáforo;
- braço industrial;
- portão eletrônico.

Atividades:

- o que vem à cabeça ao pensar em robô;
- se pudesse criar um robô, o que ele faria.

---

## Aula 2 — Pensamento Computacional

Conceitos:

- sequência;
- algoritmo;
- condicional;
- repetição/loop.

Exemplos cotidianos:

- escovar os dentes;
- preparar sanduíche;
- pote de maionese aberto/fechado.

---

## Aula 3 — Circuitos Elétricos

Conceitos:

- circuito aberto;
- circuito fechado;
- energia;
- LED;
- resistor;
- interruptor;
- protoboard.

Atividades:

- circuito humano;
- ligar LED com protoboard;
- ligar LED com botão.

---

## Aula 4 — Controlando os Circuitos

Introdução ao Arduino.

Conceitos:

- Arduino;
- pinos;
- saída digital;
- programação;
- HIGH/LOW;
- controle de LED.

Atividades:

1. piscar LED;
2. construir semáforo.

Esta deve ser uma das primeiras aulas com laboratório virtual completo.

---

## Aula 5 — Como fazer um robô enxergar

Componente:

```text
HC-SR04
```

Conceitos:

- ultrassom;
- medição de distância;
- objeto próximo/distante;
- percepção do ambiente.

Atividades:

1. ligar sensor ultrassônico;
2. sensor de ré de carro.

No laboratório virtual o aluno poderá arrastar um objeto para perto/longe do sensor.

Exemplo:

```text
HC-SR04              caixa

  👀 ---------------- 📦
         72 cm
```

Ao arrastar:

```text
👀 ------- 📦
     18 cm
```

O valor fornecido ao programa muda para `18`.

---

## Aula 6 — Cancela Inteligente

Componente novo:

```text
servo motor
```

Projeto:

```text
sensor ultrassônico
       ↓
Arduino
       ↓
servo
```

Modelo pedagógico central:

```text
sensor = entrada
Arduino = decisão
servo = saída
```

Aproximar um objeto deve abrir a cancela virtual.

---

## Aula 7 — Motores

Componente:

```text
motor DC
```

Necessidade:

```text
driver de motor
```

Conceitos:

- sentido horário;
- sentido anti-horário;
- parada;
- diferença entre servo e motor DC.

Atividade:

```text
girar em um sentido
parar
girar no outro sentido
parar
```

---

## Aulas 8 a 10 — Meu Primeiro Robô

Projeto final dividido em três aulas.

Objetivo:

juntar:

- Arduino;
- sensores;
- motores;
- lógica;
- tomada de decisão;
- movimento.

Resultado final:

**robô autônomo.**

---

# 12. MVP do laboratório

Não começar implementando todo o curso.

Primeiros cenários recomendados:

```text
1. LED piscando
2. Semáforo
3. Sensor ultrassônico
4. Cancela inteligente
```

Esses quatro cenários validam praticamente todas as ideias centrais do engine:

- saída digital;
- delays;
- múltiplos outputs;
- sensor virtual;
- input externo;
- condicionais;
- servo;
- animações;
- validação de montagem;
- validação de código.

Motor DC entra depois.

---

# 13. UX do laboratório

Tela conceitual:

```text
┌───────────────────────────────────────────────────────┐
│ Aula 4 — Construa um semáforo                        │
├─────────────────────────┬─────────────────────────────┤
│                         │                             │
│      LABORATÓRIO        │          CÓDIGO             │
│                         │                             │
│      Arduino Uno        │ void setup() {              │
│          │              │   ...                       │
│     🔴 🟡 🟢           │ }                           │
│                         │                             │
│      Protoboard         │ void loop() {               │
│                         │   ...                       │
│                         │ }                           │
├─────────────────────────┴─────────────────────────────┤
│ [Verificar montagem] [Executar] [Reiniciar] [Dica]   │
└───────────────────────────────────────────────────────┘
```

---

# 14. Níveis de orientação

## Nível 1 — totalmente guiado

Exemplo:

> Conecte o LED ao pino 13.

Destacar:

- LED;
- pino;
- ponto de destino.

---

## Nível 2 — parcialmente guiado

Exemplo:

> Monte um circuito que permita ao Arduino controlar o LED.

Disponibilizar os componentes, sem mostrar cada conexão.

---

## Nível 3 — programação

Circuito pronto.

Exemplo:

> Faça o LED piscar a cada 500 ms.

---

## Nível 4 — desafio

Exemplo:

> Construa um semáforo completo.

Pouca ou nenhuma orientação.

---

# 15. Representação dos componentes

Cada componente virtual deve possuir uma definição lógica.

Exemplo conceitual:

```ts
interface VirtualComponent {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  terminals: TerminalDefinition[];
  state: Record<string, unknown>;
}
```

Terminal:

```ts
interface TerminalDefinition {
  id: string;
  kind: "digital" | "analog" | "power" | "ground" | "signal";
  accepts?: string[];
}
```

---

# 16. Fios / conexões

Representar conexões logicamente:

```ts
interface WireConnection {
  id: string;

  from: {
    componentId: string;
    terminalId: string;
  };

  to: {
    componentId: string;
    terminalId: string;
  };
}
```

Visualmente:

- componentes podem ser SVG;
- fios podem ser um SVG overlay;
- drag inicia num terminal;
- soltura em terminal permitido cria conexão.

Não é necessário permitir qualquer conexão possível.

Cada aula pode determinar:

- terminais habilitados;
- conexões permitidas;
- conexões esperadas.

---

# 17. LessonDefinition

O elemento mais importante da arquitetura do laboratório será a configuração declarativa de cada aula.

Exemplo:

```ts
interface LessonDefinition {
  id: string;
  courseId: string;

  title: string;

  video?: {
    provider: "youtube";
    videoId: string;
  };

  workspace?: {
    components: ComponentInstance[];
    allowedConnections: AllowedConnection[];
  };

  code?: {
    language: "arduino";
    starterCode: string;
  };

  validation?: {
    circuitRules: CircuitRule[];
    runtimeTests: RuntimeTest[];
  };

  completion?: CompletionRule[];
}
```

A meta é conseguir criar uma nova aula principalmente por configuração, sem programar uma nova aplicação inteira.

---

# 18. Exemplo de lesson.json

```json
{
  "id": "robotica-04-semaforo",
  "courseId": "robotica-basico",
  "title": "Construindo um Semáforo",

  "video": {
    "provider": "youtube",
    "videoId": "YOUTUBE_VIDEO_ID"
  },

  "workspace": {
    "components": [
      "arduino-uno",
      "breadboard",
      "led-red",
      "led-yellow",
      "led-green",
      "resistor-220"
    ]
  },

  "code": {
    "language": "arduino",
    "starterCode": "void setup() {\n\n}\n\nvoid loop() {\n\n}"
  },

  "goals": [
    "red-light",
    "yellow-light",
    "green-light"
  ]
}
```

---

# 19. Runtime do Arduino — decisão para o MVP

O aluno deve escrever código com aparência e APIs de Arduino.

Exemplo:

```cpp
void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
  digitalWrite(8, HIGH);
  delay(1000);

  digitalWrite(8, LOW);
  delay(1000);
}
```

Entretanto, **não compilar C++ completo no MVP**.

Isso aumentaria muito a complexidade.

Criar um runtime para um subconjunto controlado da linguagem Arduino usado no curso.

---

# 20. Subconjunto inicial da linguagem

Priorizar somente o necessário para as primeiras aulas.

## Estrutura

```cpp
void setup() {}
void loop() {}
```

## Variáveis simples

```cpp
int
bool
```

## Controle

```cpp
if
else
```

Loops adicionais podem entrar conforme necessidade.

## Arduino API

Primeira fase:

```cpp
pinMode()
digitalWrite()
digitalRead()
delay()
```

Segunda fase:

```cpp
analogWrite()
analogRead()
```

Servo:

```cpp
servo.attach()
servo.write()
```

Ultrassônico pode utilizar uma API pedagógica simplificada inicialmente, desde que visualmente/semanticamente continue ensinando o conceito correto.

Exemplo interno:

```cpp
distance = readDistance();
```

Mais tarde pode evoluir para `trigger/echo` completos.

---

# 21. Parser / executor

Não utilizar regex solta como parser final.

Criar uma pequena gramática para o subconjunto aceito.

O runtime deve produzir uma representação intermediária, por exemplo:

```ts
[
  {
    type: "digitalWrite",
    pin: 8,
    value: "HIGH"
  },
  {
    type: "delay",
    milliseconds: 1000
  },
  {
    type: "digitalWrite",
    pin: 8,
    value: "LOW"
  }
]
```

SimulationEngine executa esses comandos sequencialmente.

---

# 22. SimulationEngine

Responsabilidades:

```text
estado dos pinos
estado dos sensores
tempo virtual
estado dos componentes
eventos
animações
```

Exemplo:

```ts
interface SimulationState {
  digitalPins: Record<number, "HIGH" | "LOW">;

  sensors: {
    distance?: number;
  };

  servos: Record<string, number>;

  motors: Record<string, "stopped" | "clockwise" | "counterclockwise">;
}
```

---

# 23. Event model sugerido

O runtime pode emitir eventos:

```ts
type SimulationEvent =
  | {
      type: "DIGITAL_WRITE";
      pin: number;
      value: "HIGH" | "LOW";
    }
  | {
      type: "DELAY";
      milliseconds: number;
    }
  | {
      type: "SERVO_WRITE";
      componentId: string;
      angle: number;
    }
  | {
      type: "MOTOR_CHANGE";
      componentId: string;
      direction: string;
    };
```

A UI apenas reage aos eventos.

Isso desacopla:

```text
código
```

de:

```text
visualização
```

---

# 24. Validação de circuito

Separar claramente:

```text
CircuitValidator
```

de:

```text
CodeRuntime
```

Isso permite feedback como:

```text
MONTAGEM
✅ circuito correto

CÓDIGO
❌ LED verde nunca recebe HIGH
```

ou:

```text
MONTAGEM
❌ Servo conectado ao pino incorreto

CÓDIGO
✅ Código válido
```

---

# 25. Runtime tests

Cada desafio pode possuir testes semelhantes a testes unitários.

Exemplo:

```ts
{
  id: "traffic-light-only-one-active",
  description: "Somente uma luz deve permanecer ligada por vez"
}
```

Resultado:

```text
✓ vermelho acendeu
✓ amarelo acendeu
✗ vermelho permaneceu ligado
✓ verde acendeu
```

Evitar entregar diretamente a solução.

---

# 26. Progresso

Ao concluir uma atividade:

```text
lesson_progress.completed = true
lesson_progress.completed_at = now()
```

Não é necessário salvar toda alteração do laboratório no servidor.

## MVP

Servidor:

- aula concluída;
- data de conclusão.

Browser/localStorage:

- código em edição;
- posição dos componentes;
- fios ainda não finalizados;
- workspace temporário.

Chave sugerida:

```text
awotech:workspace:{courseId}:{lessonId}
```

No futuro, se houver demanda, sincronizar workspace entre dispositivos.

---

# 27. Cursos estáticos e autorização

O conteúdo pode estar dentro do bundle/repositório para reduzir custos.

A UI deve esconder e bloquear rotas de conteúdo pago sem entitlement válido.

Trade-off do MVP:

**isso não representa proteção DRM forte.**

Um usuário tecnicamente avançado poderá encontrar partes do conteúdo estático inspecionando a aplicação.

Isso é aceitável inicialmente porque:

- vídeos já são YouTube não listado;
- principal objetivo é validar produto;
- proteção absoluta aumentaria custo e complexidade.

Se necessário no futuro:

- conteúdo privado em storage;
- signed URLs;
- API de conteúdo;
- serviço de vídeo privado.

---

# 28. Rotas da aplicação

Sugestão:

```text
/
 /login
 /cadastro

 /cursos
 /cursos/:courseId

 /curso/:courseId/aula/:lessonId

 /minha-conta
 /meus-cursos

 /checkout/:productId
 /pagamento/sucesso
 /pagamento/pendente
 /pagamento/erro
```

Admin pode ficar fora do primeiro MVP.

Conteúdo será alterado via Git.

---

# 29. Estrutura de repositório

Preferência: monorepo simples, mesmo que inicialmente exista apenas uma aplicação.

```text
awotech-learning/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── course-engine/
│   ├── simulator/
│   ├── arduino-runtime/
│   ├── ui/
│   └── content-types/
│
├── content/
│   ├── robotica/
│   └── programacao/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│       └── mercado-pago-webhook/
│
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

Gerenciador sugerido:

```text
pnpm
```

Não adicionar Turborepo se não houver necessidade real no começo.

---

# 30. packages

## course-engine

Responsável por:

- carregar curso;
- carregar aulas;
- controlar sequência;
- regras de conclusão;
- dados comuns para qualquer curso.

---

## simulator

Responsável por:

- componentes;
- fios;
- conexões;
- estados visuais;
- SimulationEngine;
- CircuitValidator.

---

## arduino-runtime

Responsável por:

- parser;
- AST/IR;
- execução do subconjunto Arduino;
- geração dos eventos da simulação.

---

## ui

Componentes visuais genéricos:

- Button;
- Modal;
- Card;
- Header;
- Sidebar;
- Progress;
- CodePanel;
- LessonNavigation.

---

## content-types

Interfaces TypeScript compartilhadas:

```text
CourseDefinition
LessonDefinition
ChallengeDefinition
ComponentDefinition
RuntimeTest
CompletionRule
```

---

# 31. Fluxo de autenticação

Supabase Auth.

Primeiro MVP:

- email;
- senha;
- recuperação de senha.

Depois:

- Google login.

Não é necessário implementar OAuth inicialmente se atrasar o MVP.

---

# 32. Fluxo de acesso a uma aula

```text
Usuário abre aula
       ↓
Auth session?
       ↓
não → login
       ↓
sim
       ↓
consultar user_access
       ↓
product_id correspondente ao curso
       ↓
starts_at <= agora
       ↓
expires_at > agora
       ↓
sim → liberar
não → tela de compra
```

Aulas gratuitas/introdutórias podem ignorar essa regra futuramente.

---

# 33. Fluxo do Mercado Pago

## Criação do checkout

Pode ser feita por Edge Function:

```text
create-checkout
```

Entrada:

```json
{
  "productId": "robotica-basico"
}
```

A função:

1. valida usuário;
2. busca definição do produto/preço em configuração segura;
3. cria preferência no Mercado Pago;
4. associa `external_reference` ao usuário/produto;
5. devolve URL do checkout.

Não aceitar preço enviado pelo frontend como fonte de verdade.

---

## Webhook

```text
mercado-pago-webhook
```

Responsabilidades:

1. receber evento;
2. validar origem/assinatura;
3. consultar pagamento no Mercado Pago;
4. verificar status aprovado;
5. identificar usuário e produto;
6. registrar payment;
7. criar/update `user_access`;
8. garantir idempotência.

---

# 34. Produtos

Preço ainda não está definido.

Não hardcode preço dentro dos componentes React.

Criar uma pequena configuração:

```ts
export const products = {
  "robotica-basico": {
    name: "Robótica do Básico ao Robô Autônomo",
    accessMonths: 12
  }
};
```

Preço pode futuramente vir de configuração segura ou tabela própria.

---

# 35. Certificados

Não são prioridade do primeiro MVP.

Planejar depois que existirem:

- progresso confiável;
- curso completo;
- regras claras de conclusão.

Possível regra:

```text
100% das aulas obrigatórias concluídas
+
desafio final aprovado
```

---

# 36. Curso de programação futuro

A arquitetura deve permitir reutilizar:

- autenticação;
- player;
- course engine;
- Monaco;
- progresso;
- pagamentos.

Curso de programação não precisa carregar o simulador eletrônico.

Exemplos futuros:

```text
Lógica
JavaScript
Python
Web
Git/GitHub
```

O conceito permanece:

```text
explicação
→ código
→ executar
→ testes
→ feedback
```

---

# 37. Fora do escopo do MVP

Não implementar agora:

- simulador eletrônico genérico;
- física elétrica completa;
- marketplace de cursos;
- professores terceiros;
- comunidade;
- fórum;
- chat;
- gamificação complexa;
- app nativo;
- microserviços;
- Kubernetes;
- API ASP.NET própria;
- DRM avançado;
- streaming próprio;
- assinatura mensal;
- cobrança recorrente;
- múltiplos gateways de pagamento;
- dashboard escolar;
- turmas;
- certificado sofisticado;
- editor visual completo estilo Tinkercad;
- colaboração em tempo real.

---

# 38. Princípio de engenharia

Sempre preferir:

```text
simples
declarativo
client-side
estático
serverless
```

antes de:

```text
backend adicional
microserviços
infra dedicada
processamento server-side
```

desde que isso não comprometa:

- segurança de pagamento;
- autenticação;
- autorização;
- integridade dos acessos.

---

# 39. Roadmap técnico recomendado

## Fase 0 — Bootstrap

Criar:

- pnpm workspace;
- React + Vite + TypeScript;
- Tailwind;
- lint/format;
- Cloudflare Pages;
- Supabase project;
- estrutura de packages.

Resultado:

```text
deploy funcionando
```

---

## Fase 1 — Course Engine

Criar:

- CourseDefinition;
- LessonDefinition;
- loader de conteúdo;
- catálogo;
- tela do curso;
- tela da aula;
- navegação anterior/próxima;
- embed YouTube.

Sem login inicialmente, se isso acelerar o desenvolvimento.

Resultado:

```text
curso estático navegável
```

---

## Fase 2 — Autenticação

Criar:

- login;
- cadastro;
- sessão;
- logout;
- recuperação de senha;
- profile mínimo.

Resultado:

```text
usuário autenticado
```

---

## Fase 3 — Access Control

Criar:

- user_access;
- RLS;
- CourseGuard;
- tela "comprar curso";
- acesso manual para usuário de teste.

Resultado:

```text
curso pago corretamente bloqueado/liberado
```

---

## Fase 4 — Primeiro laboratório

Começar por:

```text
LED piscando
```

Criar:

- Workspace;
- Arduino visual;
- LED;
- resistor;
- wire layer;
- connection model;
- CircuitValidator;
- Monaco;
- runtime Arduino mínimo;
- digitalWrite;
- delay;
- animação do LED.

Resultado esperado:

```cpp
digitalWrite(8, HIGH);
delay(1000);
digitalWrite(8, LOW);
```

faz o LED virtual piscar.

Esta é a primeira grande prova de conceito do produto.

---

## Fase 5 — Semáforo

Adicionar:

- múltiplos LEDs;
- runtime loop;
- testes de sequência;
- feedback pedagógico.

Resultado:

```text
atividade completa da Aula 4
```

---

## Fase 6 — Ultrassônico

Adicionar:

- HC-SR04 visual;
- objeto arrastável;
- distância;
- sensor state;
- condicionais no runtime.

Resultado:

```text
atividade sensor de ré
```

---

## Fase 7 — Servo + cancela

Adicionar:

- ServoComponent;
- servo.attach;
- servo.write;
- animação de ângulo;
- integração com sensor.

Resultado:

```text
cancela abre ao aproximar objeto
```

---

## Fase 8 — Progresso

Criar:

- lesson_progress;
- conclusão;
- indicadores no sidebar;
- retomada do curso.

Workspace temporário:

```text
localStorage
```

---

## Fase 9 — Mercado Pago

Criar:

- checkout;
- webhook;
- payment audit;
- criação do entitlement;
- páginas de resultado.

Somente após fluxo do curso estar estável.

---

## Fase 10 — Publicação MVP

Checklist:

- landing/course page;
- login;
- pagamento;
- curso;
- vídeo;
- laboratório;
- progresso;
- responsividade básica;
- analytics;
- termos de uso;
- política de privacidade.

---

# 40. Primeiro objetivo para o Codex

Se o repositório ainda não existir, começar pela Fase 0.

Se já existir frontend, não reescrever tudo automaticamente.

Primeiro:

1. inspecionar estrutura atual;
2. identificar stack existente;
3. preservar o que for compatível;
4. criar plano incremental;
5. somente então alterar arquivos.

---

# 41. Primeira vertical slice recomendada

Antes de implementar todo o produto, construir esta experiência ponta a ponta:

```text
Curso de Robótica
      ↓
Aula "Piscando um LED"
      ↓
vídeo YouTube
      ↓
texto curto
      ↓
laboratório
      ↓
aluno conecta LED
      ↓
aluno escreve código
      ↓
Executar
      ↓
LED pisca
      ↓
teste aprovado
      ↓
aula concluída
```

Sem pagamento inicialmente.

Depois conectar auth + acesso.

Essa vertical slice valida o maior risco técnico e pedagógico da plataforma: **o laboratório**.

---

# 42. Critérios de aceite da vertical slice

## Curso

- [ ] curso pode ser carregado a partir de arquivos estáticos;
- [ ] aula pode ser carregada a partir de `lesson.json`;
- [ ] vídeo YouTube não listado pode ser exibido pelo `videoId`.

## Workspace

- [ ] Arduino aparece no laboratório;
- [ ] LED aparece;
- [ ] resistor aparece;
- [ ] aluno consegue criar conexão válida;
- [ ] conexões inválidas podem ser rejeitadas;
- [ ] estado das conexões está separado da UI.

## Editor

- [ ] Monaco funciona;
- [ ] starter code é carregado;
- [ ] código pode ser editado.

## Runtime

- [ ] reconhece `setup`;
- [ ] reconhece `loop`;
- [ ] reconhece `pinMode`;
- [ ] reconhece `digitalWrite`;
- [ ] reconhece `delay`;
- [ ] gera erros compreensíveis para sintaxe não suportada.

## Simulation

- [ ] HIGH acende LED correspondente;
- [ ] LOW apaga LED;
- [ ] delay influencia a linha do tempo visual;
- [ ] execução pode ser interrompida;
- [ ] botão Reiniciar volta ao estado inicial.

## Validação

- [ ] montagem correta é detectada;
- [ ] montagem incorreta gera feedback;
- [ ] desafio sabe se o comportamento esperado ocorreu.

---

# 43. Erros pedagógicos

Mensagens devem ser úteis para iniciantes.

Evitar:

```text
RuntimeError: node undefined at instruction 18
```

Preferir:

```text
O pino 8 foi usado no código, mas nenhum componente está conectado a ele.
```

ou:

```text
O LED está conectado corretamente, mas seu código ainda não o liga.
```

ou:

```text
Este comando ainda não é suportado nesta aula.
```

---

# 44. Telemetria futura

Não é necessária para primeira vertical slice.

Depois, vale medir:

- aula iniciada;
- aula concluída;
- desafio iniciado;
- desafio concluído;
- quantidade de tentativas;
- abandono por aula;
- clique em dica;
- checkout iniciado;
- pagamento aprovado.

Não registrar código do aluno em analytics de terceiros sem necessidade.

---

# 45. Resumo executivo

## Produto

```text
AWOTech Learning Platform
```

Cursos de tecnologia com laboratório interativo.

## Primeiro curso

```text
Robótica
```

## Diferencial

```text
Aprenda → Monte → Programe → Execute → Veja acontecer
```

## Stack

```text
React
TypeScript
Vite
Tailwind
Monaco
Cloudflare Pages
Supabase Auth
Supabase PostgreSQL
Supabase Edge Functions
Mercado Pago
YouTube não listado
```

## Infra

```text
conteúdo estático
+
simulador client-side
+
backend mínimo/serverless
```

## Monetização inicial

```text
compra individual por curso
pagamento único
12 meses de acesso

opcionalmente:
curso + kit físico
```

## Não fazer agora

```text
assinatura
backend .NET
microserviços
simulador universal
streaming próprio
hardware próprio
logística complexa
estoque sofisticado
```

## Primeira prova de conceito

```text
Aula LED
→ montar circuito
→ escrever código Arduino
→ executar
→ LED virtual piscar
```

---

# 46. Prompt sugerido para iniciar no Codex

Copiar o trecho abaixo para iniciar a execução:

```text
Leia o arquivo AWOTECH_CODEX_HANDOFF.md por completo e trate-o como a especificação inicial do projeto.

Antes de escrever código:

1. inspecione o repositório atual;
2. localize a apostila atual do Curso de Robótica na raiz do projeto e trate-a como fonte de verdade para conteúdo pedagógico;
3. descreva a arquitetura encontrada;
4. compare com a arquitetura definida no handoff;
5. proponha o menor conjunto de mudanças necessário;
6. não crie backend próprio, microserviços ou infraestrutura adicional sem necessidade;
7. preserve o objetivo de baixo custo operacional;
8. mantenha o laboratório separado em course-engine, simulator e arduino-runtime;
9. antes de implementar qualquer aula de robótica, consulte a versão correspondente na apostila da raiz;
10. priorize a primeira vertical slice compatível com a apostila atual: preferencialmente a primeira atividade de laboratório com LED, usando Monaco, montagem guiada, execução e feedback visual.

Depois da análise, implemente a Fase 0 ou continue da fase compatível com o estado atual do repositório.

Ao encontrar decisões não especificadas, priorize:
simplicidade > abstração prematura;
client-side > servidor;
configuração declarativa > hardcode por aula;
MVP funcional > arquitetura excessivamente genérica.
```

---

# 47. Decisões em aberto

Não bloquear o desenvolvimento por estas decisões.

Podem ser definidas depois:

- nome comercial definitivo da plataforma;
- identidade visual;
- preço do curso;
- domínio;
- curso de programação específico;
- certificado;
- login Google;
- analytics;
- ferramenta de email transacional;
- política de reembolso;
- regras comerciais de cupom/desconto;
- conteúdo gratuito de demonstração;
- composição final do kit físico;
- preço do kit;
- embalagem;
- política de frete;
- fornecedores dos componentes.

Nenhum desses itens é necessário para começar a primeira vertical slice.

---

**Fim do handoff.**

# 48. Kits físicos — estratégia de produto

A AWOTech poderá vender kits físicos de robótica como complemento opcional ao curso.

O kit **não deve ser obrigatório** para acompanhar o curso. O aluno precisa conseguir concluir a trilha usando apenas:

- videoaulas;
- conteúdo escrito;
- laboratório virtual;
- exercícios;
- desafios.

O kit funciona como um **upgrade físico da experiência**, permitindo que o aluno reproduza no mundo real o mesmo circuito e projeto praticado no laboratório virtual.

Fluxo ideal:

```text
Aprender no curso
      ↓
Montar no laboratório virtual
      ↓
Programar
      ↓
Executar e validar
      ↓
Reproduzir com o kit físico
```

---

# 49. Relação entre curso, laboratório e kit

A experiência deve ser coerente entre os três ambientes:

```text
CURSO
  ↕
LABORATÓRIO VIRTUAL
  ↕
KIT FÍSICO
```

O mesmo componente deve possuir uma identidade lógica compartilhada.

Exemplo:

```text
arduino-uno-compatible
hc-sr04
servo-sg90
motor-tt
driver-motor
led-red
resistor-220
```

A intenção é permitir que o aluno encontre no kit físico exatamente os componentes que aparecem no laboratório e nas instruções da aula.

---

# 50. Modelo comercial dos kits

Oferta inicial sugerida:

## Produto 1 — Curso de Robótica

Inclui:

- 12 meses de acesso;
- videoaulas;
- apostila;
- laboratório virtual;
- exercícios;
- desafios;
- certificado futuramente.

## Produto 2 — Curso de Robótica + Kit

Inclui tudo acima mais:

- componentes físicos;
- embalagem;
- organização por aula ou módulo;
- materiais necessários para os projetos do curso;
- componentes do projeto final.

## Produto 3 — Kit avulso

Pode ser disponibilizado depois para alunos que já possuem o curso.

Não precisa existir no primeiro lançamento.

---

# 51. Não criar kit por aula como produto separado

A preferência inicial é vender **um único kit completo para o curso**, mesmo que internamente os componentes sejam separados por aula ou módulo.

Exemplo:

```text
AWOTECH ROBOTICS KIT

01 — Circuitos
02 — Arduino
03 — Sensores
04 — Movimento
05 — Projeto final
```

Dentro da caixa podem existir:

- saquinhos identificados;
- etiquetas;
- QR codes;
- pequenos guias de referência.

Isso simplifica:

- estoque;
- checkout;
- frete;
- suporte;
- montagem dos pedidos.

---

# 52. Fonte de verdade para o BOM do kit

A lista final de componentes do kit **não deve ser criada apenas a partir deste handoff**.

Antes de definir o kit, o Codex ou qualquer implementação futura deve consultar a **apostila atual na raiz do projeto**, pois ela é a fonte de verdade para:

- aulas existentes;
- componentes realmente utilizados;
- atividades;
- projetos;
- projeto final.

A versão da apostila consultada durante a criação inicial deste handoff pode estar desatualizada.

---

# 53. KitDefinition

Criar um modelo declarativo para kits físicos.

Exemplo:

```ts
interface KitDefinition {
  id: string;
  name: string;
  courseId: string;
  version: string;

  components: KitComponentItem[];
}
```

```ts
interface KitComponentItem {
  sku: string;
  quantity: number;
  optional?: boolean;
  notes?: string;
}
```

Exemplo:

```json
{
  "id": "robotica-basico-kit-v1",
  "name": "AWOTech Robotics Kit",
  "courseId": "robotica-basico",
  "version": "1.0",
  "components": [
    {
      "sku": "arduino-uno-compatible",
      "quantity": 1
    },
    {
      "sku": "breadboard-400",
      "quantity": 1
    },
    {
      "sku": "hc-sr04",
      "quantity": 1
    },
    {
      "sku": "servo-sg90",
      "quantity": 1
    }
  ]
}
```

---

# 54. Component catalog

Criar um catálogo único de componentes, compartilhado entre:

- laboratório virtual;
- aulas;
- desafios;
- kit físico.

Exemplo:

```ts
interface ComponentCatalogItem {
  sku: string;
  name: string;
  category: string;

  virtual?: {
    componentType: string;
    asset?: string;
  };

  physical?: {
    description?: string;
    replacementSku?: string;
  };
}
```

Exemplo:

```json
{
  "sku": "hc-sr04",
  "name": "Sensor Ultrassônico HC-SR04",
  "category": "sensor",
  "virtual": {
    "componentType": "ultrasonic-sensor"
  },
  "physical": {
    "description": "Sensor ultrassônico compatível com Arduino"
  }
}
```

Essa identidade compartilhada evita manter nomes e componentes duplicados em vários lugares.

---

# 55. requiredComponents por aula

Cada aula prática deve declarar quais componentes utiliza.

Exemplo:

```json
{
  "id": "robotica-05-ultrassonico",
  "requiredComponents": [
    "arduino-uno-compatible",
    "breadboard-400",
    "hc-sr04",
    "jumper-male-male"
  ]
}
```

A plataforma poderá usar isso para mostrar ao aluno:

```text
Você vai precisar:

✓ Arduino Uno
✓ HC-SR04
✓ Jumpers
```

Se o aluno tiver comprado o kit:

```text
Todos esses componentes estão no seu AWOTech Robotics Kit.
```

Se não tiver:

```text
[ Comprar kit físico ]
```

Essa ação não deve bloquear a aula.

---

# 56. Compatibilidade entre componente virtual e físico

Sempre que possível, o componente virtual deve representar o componente físico realmente fornecido.

Exemplo:

```text
Laboratório:
Servo SG90 virtual

Kit:
Servo SG90 físico
```

Evitar ensinar com uma representação e enviar um componente incompatível ou com pinagem completamente diferente.

Quando houver substituição de fornecedor, garantir compatibilidade funcional.

---

# 57. QR codes no kit

O kit pode utilizar QR codes para conectar a experiência física ao curso.

Exemplo:

```text
AULA 5
SENSOR ULTRASSÔNICO

[ QR CODE ]

Abrir atividade
```

O QR pode apontar para:

```text
/curso/robotica-basico/aula/robotica-05-ultrassonico
```

Preferir URLs estáveis e independentes de IDs internos frágeis.

---

# 58. Reposição de componentes

Não implementar e-commerce completo de reposição no primeiro MVP, mas manter o modelo preparado para isso.

Possibilidades futuras:

- kit de reposição;
- LEDs;
- resistores;
- jumpers;
- servo;
- sensor;
- motor;
- driver.

Isso pode ser útil porque componentes físicos podem:

- ser perdidos;
- quebrar;
- apresentar defeito;
- ser danificados durante atividades.

---

# 59. Estoque e logística

Não criar módulo complexo de estoque inicialmente.

No primeiro MVP, pode existir apenas uma estrutura simples de produto e status manual.

Exemplo futuro:

```text
kit_status
AVAILABLE
OUT_OF_STOCK
PRE_ORDER
```

Não implementar:

- WMS;
- multiestoque;
- roteirização;
- logística própria;
- integração com transportadoras complexa;

antes da validação comercial.

---

# 60. Validação inicial dos kits

Antes de comprar grande volume, produzir um lote pequeno.

Referência de validação:

```text
10–20 kits
```

Objetivos:

- medir taxa de compra do kit;
- validar custo real;
- testar embalagem;
- identificar componentes frágeis;
- descobrir dúvidas recorrentes;
- medir tempo de montagem;
- medir incidência de defeito;
- entender custo de frete;
- calcular margem real.

Não assumir escala antes de validar operação.

---

# 61. Custos do kit

Não calcular margem apenas como:

```text
preço de venda - componentes
```

Considerar:

```text
componentes
+ embalagem
+ etiquetas
+ material impresso
+ perdas
+ defeitos
+ reposições
+ mão de obra para separar/montar
+ taxa do pagamento
+ impostos
+ eventual subsídio de frete
```

O preço deve deixar margem suficiente para suportar operação física.

---

# 62. Posicionamento do kit

O valor do kit não está apenas no hardware.

A proposta comercial é:

```text
componentes compatíveis
+
quantidades corretas
+
organização
+
integração com o curso
+
mesmos componentes do laboratório
+
redução de dúvidas
+
experiência pronta para uso
```

A AWOTech não precisa competir como loja de eletrônicos.

O valor está na curadoria e integração pedagógica.

---

# 63. Não fabricar hardware próprio no início

Não desenvolver inicialmente:

- Arduino próprio;
- placa controladora própria;
- sensores próprios;
- PCB customizada.

Utilizar componentes padronizados e amplamente disponíveis.

Hardware próprio pode ser avaliado apenas depois de:

- validação de demanda;
- volume relevante;
- necessidade concreta de simplificar conexões;
- viabilidade financeira.

---

# 64. Experiência visual do kit

Não é necessário ter embalagem premium cara no primeiro MVP.

Ainda assim, o kit deve parecer um produto organizado.

Exemplo:

```text
┌──────────────────────────────────┐
│                                  │
│          AWOTECH LAB             │
│                                  │
│       ROBOTICS KIT — V1          │
│                                  │
│     Aprenda criando o futuro     │
│                                  │
└──────────────────────────────────┘
```

Possíveis elementos:

- caixa kraft;
- adesivo da marca;
- saquinhos separados;
- etiquetas;
- QR codes;
- guia rápido.

---

# 65. Impacto na modelagem de produtos

A modelagem comercial deve aceitar diferentes tipos de produto.

Exemplo:

```ts
type ProductType =
  | "course"
  | "course_with_kit"
  | "kit"
  | "subscription";
```

Não significa implementar todos no primeiro MVP.

Apenas evitar uma modelagem que suponha que todo produto é exclusivamente digital.

---

# 66. Exemplo de ProductDefinition

```ts
interface ProductDefinition {
  id: string;
  type: ProductType;
  name: string;

  courseIds?: string[];
  kitId?: string;

  accessMonths?: number;

  active: boolean;
}
```

Exemplo:

```json
{
  "id": "robotica-basico",
  "type": "course",
  "name": "Curso de Robótica",
  "courseIds": ["robotica-basico"],
  "accessMonths": 12,
  "active": true
}
```

```json
{
  "id": "robotica-basico-kit",
  "type": "course_with_kit",
  "name": "Curso de Robótica + Kit",
  "courseIds": ["robotica-basico"],
  "kitId": "robotica-basico-kit-v1",
  "accessMonths": 12,
  "active": true
}
```

---

# 67. Pagamento de produto com kit

O fluxo financeiro continua sendo Mercado Pago.

Após pagamento aprovado:

```text
curso digital
   ↓
criar user_access
```

Para produto com kit:

```text
pagamento aprovado
   ↓
criar user_access
   ↓
registrar pedido físico
```

A criação do pedido físico pode ser implementada depois do fluxo digital estar estável.

---

# 68. Estrutura futura de orders

Não é obrigatória para a primeira vertical slice.

Quando os kits forem efetivamente vendidos, adicionar algo semelhante a:

```sql
create table orders (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references auth.users(id),

    product_id text not null,

    payment_id uuid references payments(id),

    status text not null,

    recipient_name text,
    shipping_address jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
```

Estados possíveis:

```text
PAID
PREPARING
SHIPPED
DELIVERED
CANCELLED
```

Não armazenar dados de endereço antes de serem realmente necessários.

---

# 69. Separação entre entitlement e pedido físico

Não confundir acesso digital com envio do kit.

Exemplo:

```text
user_access
→ controla acesso ao curso

orders
→ controla o envio físico
```

O curso pode ser liberado imediatamente após o pagamento, mesmo que o kit ainda esteja em preparação.

---

# 70. Prioridade de desenvolvimento dos kits

O recurso de kits **não deve atrasar o laboratório virtual**.

Ordem sugerida:

```text
1. course engine
2. laboratório LED
3. simulador
4. progresso
5. autenticação/acesso
6. pagamento
7. produto curso + kit
8. pedido físico
9. logística
```

A modelagem deve estar preparada agora, mas a operação física entra depois da validação do núcleo digital.


