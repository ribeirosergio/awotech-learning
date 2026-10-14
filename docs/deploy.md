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

O bootstrap não precisa de banco. Na etapa de autenticação, criar o projeto, implementar e testar migrações com RLS, e preencher `apps/web/.env.local` a partir de `.env.example`. Somente URL pública e chave pública/publicável podem ter prefixo `VITE_`.

Nenhuma credencial foi incluída. Tokens Mercado Pago, chave de serviço Supabase e segredo de webhook pertencem às Edge Functions. Os diretórios `supabase/` registram os requisitos futuros sem disponibilizar endpoints incompletos.
