# Arquitetura inicial

## Estado encontrado e decisões

Em 14/10/2026, o repositório continha apenas `AWOTECH_CODEX_HANDOFF.md`, a apostila DOCX e o diretório Git. Não havia aplicação, configuração ou código anterior a preservar.

O menor incremento útil é um workspace pnpm sem orquestrador adicional, uma SPA React/Vite e pacotes privados que expõem TypeScript diretamente ao bundler. Não há build separado por biblioteca, backend próprio, microserviços ou infraestrutura de simulação.

O bootstrap usa Tailwind pelo plugin do Vite e mantém scripts de formatação, lint, TypeScript, testes e build na raiz. O lockfile fixa a instalação. A instalação é explícita; scripts não executam uma instalação automática.

## Limites entre pacotes

| Pacote            | Responsabilidade atual                                                        | Evolução prevista                                                          |
| ----------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `content-types`   | Schemas e tipos de conteúdo, produto, kit e componente                        | Configuração de desafios e regras de conclusão quando houver implementação |
| `course-engine`   | Carregar/validar dados recebidos, conferir referências e navegar na sequência | Regras de conclusão e progresso                                            |
| `arduino-runtime` | Lexer, parser limitado, IR e execução de setup/loop                           | Expandir o subconjunto conforme as próximas atividades; sem `eval`         |
| `simulator`       | Montagem do LED, validação topológica, saídas digitais e tempo virtual        | Novos cenários e componentes conforme a apostila                           |
| `ui`              | Badge e embed de vídeo                                                        | Elementos visuais reutilizáveis; Monaco na primeira experiência de código  |
| `web`             | Adaptação Vite dos arquivos, rotas e apresentação                             | Workspace guiado, auth e integrações                                       |

O runtime não importa React nem o simulador. O simulador consome instruções e eventos do runtime e controla o relógio. O course engine não importa Vite nem lê arquivos diretamente; recebe dados do adaptador. A aplicação carrega o laboratório e os dois pacotes sob demanda na aula configurada, após os guardas de autenticação, acesso e sequência. O primeiro cenário está documentado em `docs/awotech-lab.md`.

## Conteúdo

`course.json` define a sequência por `lessonIds`. Cada pasta de aula possui dois conjuntos de conteúdo: `preview.json` é público e contém identificação, título, resumo e vídeo de apresentação; `lesson.json`, `content.md` e `assets/` guardam o material integral da plataforma. O vídeo público é independente do vídeo da aula.

`apps/web/src/content.ts` carrega somente cursos e prévias. `createPreviewCatalog` valida o contrato público, a ordem e os vínculos das aulas. O schema rejeita campos de material integral. `apps/web/src/platform/` contém o loader completo e o renderer de Markdown/imagens/exercícios. A área `/app` carrega esses módulos sob demanda, depois dos guards de sessão e entitlement. O build contém os assets estáticos da plataforma; a separação de rotas não é DRM, conforme o trade-off aceito no handoff. RLS protege as concessões e o progresso no banco.

Imagens ficam em `assets/` dentro de cada aula e são referenciadas por caminhos relativos no Markdown (`./assets/imagem.png`). O adaptador web resolve esses caminhos via `import.meta.glob` com `?url`; a UI acrescenta legendas e ampliação. Texto alternativo e legenda pertencem ao conteúdo, sem hardcode por aula. `activitiesInContent` indica que os exercícios completos já estão no Markdown. O campo opcional `video.isPlaceholder` diferencia um vídeo provisório de uma videoaula definitiva.

Os nomes das pastas são organização interna; as URLs usam IDs estáveis:

```text
/
/cursos
/cursos/robotica-basico
/cursos/robotica-basico/aulas/robotica-04-controlando-circuitos/previa
/login
/cadastro
/esqueci-minha-senha
/redefinir-senha
/app/meus-cursos
/app/curso/robotica-basico
/app/curso/robotica-basico/aula/robotica-04-controlando-circuitos
/app/conta
```

Rotas e IDs desconhecidos exibem uma página de não encontrado. A URL anterior `/curso/:courseId/aula/:lessonId` redireciona para a prévia correspondente. O site público apresenta um parágrafo e vídeo de apresentação; `status` é editorial e não substitui autorização. `/app` exige sessão, e o CourseGuard valida produto, início e expiração. Não há checkout nesta etapa.

`requiredComponents` descreve os componentes documentados para a aula, não quantidades de um kit. `type`, `hasLab`, `code` e `lab` configuram a apresentação. A aula 3 usa `electric-circuits`, sem código; a aula 4 usa `blink-led`, com D13 e resistor de 220 Ω. As bancadas compartilham terminais e fios. `completion.activities` define os requisitos pedagógicos, espelhados como IDs/disponibilidade na função SQL. O player e os labs registram evidências do próprio aluno via RPC; o trigger exige vídeo e todas as práticas para novas conclusões. Aulas 5–7 mantêm rascunhos/placeholders; práticas indisponíveis, inclusive semáforo da aula 4, bloqueiam conclusão. Limites de confiança dos relatos client-side estão em `docs/requisitos-conclusao.md`.

## Próximo incremento

O primeiro cenário de LED já cobre configuração, gramática limitada, montagem guiada, validação separada, execução interrompível e feedback visual. A pinagem foi harmonizada em D13, seguindo o código da apostila. A evolução seguinte pode ampliar as atividades conforme a apostila e introduzir validação de desafios por comportamento, com autorização específica. A persistência atual continua usando conclusão manual.

Supabase Auth/RLS, acesso manual e progresso estão implementados no frontend e nas migrations versionadas. O projeto Cloud está conectado ao ambiente local, e Auth/tabelas/RPC foram verificados com a chave pública. A validação de usuários reais e isolamento por RLS ainda está pendente. O guia é `docs/plataforma-supabase.md`. Checkout e operações de kits não foram implementados. O produto continua sem preço e sem compra habilitada.

## Referências técnicas consultadas

- [Vite: guia inicial](https://vite.dev/guide/)
- [Tailwind: integração com Vite](https://tailwindcss.com/docs/installation/using-vite)
- [pnpm: configuração do workspace](https://pnpm.io/settings)
- [Cloudflare Pages: configuração de build](https://developers.cloudflare.com/pages/configuration/build-configuration/)
