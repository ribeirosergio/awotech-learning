# Arquitetura inicial

## Estado encontrado e decisões

Em 14/10/2026, o repositório continha apenas `AWOTECH_CODEX_HANDOFF.md`, a apostila DOCX e o diretório Git. Não havia aplicação, configuração ou código anterior a preservar.

O menor incremento útil é um workspace pnpm sem orquestrador adicional, uma SPA React/Vite e pacotes privados que expõem TypeScript diretamente ao bundler. Não há build separado por biblioteca, backend próprio, microserviços ou infraestrutura de simulação.

O bootstrap usa Tailwind pelo plugin do Vite e mantém scripts de formatação, lint, TypeScript, testes e build na raiz. O lockfile fixa a instalação. A instalação é explícita; scripts não executam uma instalação automática.

## Limites entre pacotes

| Pacote            | Responsabilidade atual                                                        | Evolução prevista                                                                          |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `content-types`   | Schemas e tipos de conteúdo, produto, kit e componente                        | Configuração de desafios e regras de conclusão quando houver implementação                 |
| `course-engine`   | Carregar/validar dados recebidos, conferir referências e navegar na sequência | Regras de conclusão e progresso                                                            |
| `arduino-runtime` | Contratos de IR, diagnóstico e eventos                                        | Gramática, parser e executor do subconjunto Arduino; sem `eval` ou regex solta como parser |
| `simulator`       | Contratos de componentes, conexões, circuito e estado                         | Validador de montagem, tempo virtual e atualização de componentes                          |
| `ui`              | Badge e embed de vídeo                                                        | Elementos visuais reutilizáveis; Monaco na primeira experiência de código                  |
| `web`             | Adaptação Vite dos arquivos, rotas e apresentação                             | Workspace guiado, auth e integrações                                                       |

O runtime não importa React nem o simulador. O simulador pode consumir tipos de eventos do runtime. O course engine não importa Vite nem lê arquivos diretamente; recebe dados do adaptador. A aplicação não importa runtime/simulador enquanto não existir laboratório, evitando carregar código desnecessário.

## Conteúdo

`course.json` define a sequência por `lessonIds`. Cada pasta de aula possui dois conjuntos de conteúdo: `preview.json` é público e contém identificação, título, resumo e vídeo de apresentação; `lesson.json`, `content.md` e `assets/` guardam o material integral da plataforma. O vídeo público é independente do vídeo da aula.

`apps/web/src/content.ts` carrega somente cursos e prévias. `createPreviewCatalog` valida o contrato público, a ordem e os vínculos das aulas. O schema rejeita campos de material integral. `apps/web/src/platform/` preserva o loader completo e o renderer de Markdown/imagens/exercícios, sem importação pelas rotas públicas. Assim, o build público não inclui os textos e as imagens didáticas. O course engine completo continua validando Markdown e componentes nos testes.

Imagens ficam em `assets/` dentro de cada aula e são referenciadas por caminhos relativos no Markdown (`./assets/imagem.png`). O adaptador web resolve esses caminhos via `import.meta.glob` com `?url`; a UI acrescenta legendas e ampliação. Texto alternativo e legenda pertencem ao conteúdo, sem hardcode por aula. `activitiesInContent` indica que os exercícios completos já estão no Markdown. O campo opcional `video.isPlaceholder` diferencia um vídeo provisório de uma videoaula definitiva.

Os nomes das pastas são organização interna; as URLs usam IDs estáveis:

```text
/
/cursos
/cursos/robotica-basico
/cursos/robotica-basico/aulas/robotica-04-controlando-circuitos/previa
```

Rotas e IDs desconhecidos exibem uma página de não encontrado. A URL anterior `/curso/:courseId/aula/:lessonId` redireciona para a prévia correspondente. Não há rotas fictícias de login/checkout. A navegação atual é uma prévia aberta com resumo e vídeo de apresentação; `status` é editorial e não substitui autorização. A área do aluno e seu controle de acesso ainda serão implementados.

`requiredComponents` descreve os componentes documentados para a aula, não quantidades de um kit. Tipos genéricos são mantidos quando o modelo físico não está confirmado. Não existem `challenge.json`, `circuit.json` ou starter code sem validação da aula correspondente.

## Próximo incremento

1. Resolver e registrar a pinagem do LED da aula 4, harmonizando imagem, código e instruções.
2. Criar configuração do circuito/desafio e Monaco, com workers locais e carregamento sob demanda.
3. Implementar gramática para `setup`, `loop`, `pinMode`, `digitalWrite` e `delay`, com diagnósticos compreensíveis. Código não suportado deve ser rejeitado, nunca ignorado ou executado como JavaScript.
4. Implementar montagem guiada, validação separada do código, execução interrompível e feedback do LED.
5. Validar o desafio por comportamento antes de registrar conclusão; só depois integrar persistência e acesso.

As etapas seguintes adicionam Supabase Auth/RLS, progresso e checkout hospedado Mercado Pago. A chave de serviço, assinatura de webhook e preço nunca devem vir do frontend. O produto está inativo e não há preço fictício.

## Referências técnicas consultadas

- [Vite: guia inicial](https://vite.dev/guide/)
- [Tailwind: integração com Vite](https://tailwindcss.com/docs/installation/using-vite)
- [pnpm: configuração do workspace](https://pnpm.io/settings)
- [Cloudflare Pages: configuração de build](https://developers.cloudflare.com/pages/configuration/build-configuration/)
