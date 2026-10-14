# AWOTech Learning

Base inicial da plataforma de cursos práticos de tecnologia. O repositório começou apenas com o handoff e a apostila; esta entrega implementa o bootstrap local e uma primeira navegação de conteúdo estático.

## Executar

Requisitos: Node.js 24.22.x e pnpm 12.11.2 (versão registrada em `packageManager`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173`.
Não é necessário configurar Supabase ou outras credenciais para executar esta prévia.

```sh
pnpm check       # lint, formatação, testes, TypeScript e build
pnpm format      # formata os arquivos do projeto, preservando as fontes recebidas
pnpm preview     # serve o último build; executar pnpm build antes
```

Em PowerShell, use `pnpm.cmd` se a política de execução bloquear o shim `pnpm.ps1`. Se Node ou pnpm não forem encontrados, confira o PATH da sessão; eles precisam estar disponíveis também aos processos filhos.

## Organização

```text
apps/web/                 React + Vite + Tailwind; rotas e adaptação de conteúdo
packages/content-types/   Schemas Zod e tipos de curso, aula, produto, componente e kit
packages/course-engine/   Validação, catálogo e sequência de aulas, sem React
packages/arduino-runtime/ Contratos de IR/eventos; parser e executor pendentes
packages/simulator/       Contratos de montagem e simulação; engine pendente
packages/ui/              Elementos visuais compartilhados e player YouTube
content/                  Cursos, Markdown, componentes e produtos estáticos
supabase/                 Espaço e requisitos para as futuras migrações/funções
docs/                     Análise da apostila, arquitetura e preparação de deploy
tests/                    Validação do conteúdo real e regras do course engine
scripts/                  Inspeção local e reproduzível do DOCX
```

## Disponível nesta etapa

- Catálogo público com resumo e vídeo de apresentação de cada aula, sem exibir o material integral.
- Dez aulas na ordem da apostila. O conteúdo ampliado das aulas 1–3, com as 12 imagens originais e exercícios completos, está preservado para a futura área do aluno.
- Validação dos arquivos estáticos, referências de componentes e ordem pedagógica.
- Vídeo YouTube `hcuA5wkgUNA`, escolhido pelo responsável pelo curso, como placeholder das prévias. Cada `preview.json` tem configuração de vídeo independente de `lesson.json`.
- Modelos iniciais de produtos e kits, sem compra habilitada nem BOM presumido.
- Build estático em `apps/web/dist`, preparado para Cloudflare Pages.

O conteúdo está marcado como prévia e **não é um curso publicado**. Laboratório, Monaco, desafios, autenticação, controle de acesso, progresso, pagamentos e operação de kits ainda serão implementados. Os pacotes de runtime e simulador contêm somente contratos; não há execução de código do aluno nesta etapa.

## Fontes e próximos passos

A [apostila](<Apostila - Curso de Robótica.docx>) prevalece para conteúdo pedagógico. O [handoff](AWOTECH_CODEX_HANDOFF.md) define a arquitetura e as decisões de produto.

Leia a [análise da apostila](docs/analise-apostila.md), a [arquitetura](docs/arquitetura.md) e as [instruções de publicação](docs/deploy.md). A divergência entre pino 11 no diagrama do LED e pino 13 no código precisa ser resolvida antes de publicar o primeiro laboratório.

Nenhum recurso remoto, banco, pagamento ou deploy foi criado nesta entrega.
