# AWOTech Learning

Plataforma de cursos práticos de tecnologia com site público, prévias e área do aluno em React, TypeScript e Vite. Cursos e materiais são estáticos/versionados; identidade, acessos e progresso usam Supabase Cloud.

## Executar

Requisitos: Node.js 24.22.x e pnpm 12.11.2 (versão registrada em `packageManager`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173`.
O site público funciona sem credenciais. Para usar cadastro, login e `/app`, crie um projeto Supabase Cloud, aplique as duas migrations e configure `apps/web/.env.local`. O procedimento está em [Plataforma e Supabase](docs/plataforma-supabase.md). Não é necessário Docker ou PostgreSQL local.

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
supabase/                 Migrations/RLS, concessão manual e testes SQL no Cloud
docs/                     Análise da apostila, arquitetura e preparação de deploy
tests/                    Validação do conteúdo real e regras do course engine
scripts/                  Inspeção local e reproduzível do DOCX
```

## Disponível nesta etapa

- Catálogo público com resumo e vídeo de apresentação de cada aula, sem exibir o material integral.
- Área `/app` com autenticação por email/senha, sessão persistente, recuperação de senha e logout.
- Meus cursos filtrado por entitlement, CourseGuard, curso e aula renderizados por configuração.
- Dez aulas na ordem da apostila. As aulas 1–3 contêm o material ampliado com as 12 imagens e exercícios; 4–7 mantêm os resumos existentes e 8–10 são esboços.
- Conclusão manual persistente, progresso por curso e navegação anterior/próxima.
- Monaco reutilizável, workers locais e rascunho por aluno/aula, disponível nas aulas 4–7.
- Validação dos arquivos estáticos, referências de componentes e ordem pedagógica.
- Vídeo YouTube `hcuA5wkgUNA`, escolhido pelo responsável pelo curso, como placeholder das prévias e das dez aulas completas. Cada `lesson.json` possui vídeo independente de `preview.json`, para receber sua videoaula definitiva.
- Modelos iniciais de produtos e kits, sem compra habilitada nem BOM presumido.
- Build estático em `apps/web/dist`, preparado para Cloudflare Pages.

O curso ainda está em preparação. As aulas completas usam um vídeo provisório até receberem seus próprios vídeos definitivos. O Supabase Cloud está conectado ao ambiente local; Auth, tabelas e RPC foram consultados com a chave pública, mas os fluxos autenticados reais ainda precisam de validação. Laboratório, desafios, execução, pagamentos e operação de kits ficam para as próximas fases. Os pacotes de runtime e simulador mantêm somente os contratos anteriores.

## Fontes e próximos passos

A [apostila](<Apostila - Curso de Robótica.docx>) prevalece para conteúdo pedagógico. O [handoff](AWOTECH_CODEX_HANDOFF.md) define a arquitetura e as decisões de produto.

Leia a [configuração da plataforma, concessão de acesso e roteiro de testes](docs/plataforma-supabase.md), a [análise da apostila](docs/analise-apostila.md), a [arquitetura](docs/arquitetura.md) e as [instruções de publicação](docs/deploy.md). A divergência entre pino 11 no diagrama do LED e pino 13 no código precisa ser resolvida antes do primeiro laboratório.

Nenhum recurso remoto, banco, pagamento ou deploy foi criado nesta entrega.
