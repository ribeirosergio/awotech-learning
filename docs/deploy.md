# Preparação de publicação

O build é estático e local. Nenhum projeto Cloudflare/Supabase foi provisionado ou publicado nesta etapa.

## Cloudflare Pages

Configuração para conectar posteriormente o repositório Git:

| Campo              | Valor                                           |
| ------------------ | ----------------------------------------------- |
| Diretório raiz     | Raiz do repositório                             |
| Comando de build   | `pnpm install --frozen-lockfile && pnpm build`  |
| Diretório de saída | `apps/web/dist`                                 |
| Node               | `24.22.0`, também registrado em `.node-version` |
| pnpm               | `12.11.2`, conforme `packageManager`            |

Selecionar uma imagem de build compatível com essas versões. Se o ambiente não disponibilizar o pnpm declarado, instalá-lo na preparação do ambiente antes do comando de build. Evitar configurar `apps/web` como raiz: o workspace também depende de `packages/` e `content/`.

`apps/web/public/_redirects` inclui o fallback SPA para permitir abrir e atualizar URLs de aulas diretamente. O build não inclui o DOCX, o handoff ou `.tmp` nos assets publicados.

Antes da publicação, executar `pnpm check`, conferir a navegação em `/cursos/robotica-basico` e abrir diretamente uma rota de aula. Esta versão é uma prévia pública; não publicar material vendido como protegido antes de implementar autenticação e entitlement.

Referências: [build do Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/) e [monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/).

## Supabase

O site público funciona sem banco configurado. A plataforma do aluno usa Supabase Cloud; seguir `docs/plataforma-supabase.md` para criar o projeto, aplicar as duas migrations com RLS e configurar Auth. Preencher `apps/web/.env.local` a partir de `.env.example`, e adicionar as mesmas duas variáveis públicas no ambiente de build do Cloudflare Pages. Variáveis `VITE_` são incorporadas no build, portanto qualquer alteração exige novo build/deploy.

Somente URL pública e chave publicável/anon podem ir ao navegador. O build rejeita chaves privilegiadas. Nenhuma credencial foi incluída. Não há pagamento ou webhook implementado.
