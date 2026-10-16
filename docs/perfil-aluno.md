# Perfil do aluno

Aplicar `supabase/migrations/202610160001_student_profiles.sql` no SQL Editor do
Supabase Cloud depois das migrations anteriores. Ela não foi aplicada remotamente
pelo assistente.

O cadastro solicita nome completo, nascimento, telefone, cidade, estado/região e
país. Tipo e número de documento são opcionais e devem ser preenchidos juntos.
O nome é apresentado como o nome que constará no certificado. A emissão de
certificados não está implementada nesta entrega.

O cadastro envia os dados em `options.data.student_profile` do Supabase Auth.
Um trigger de `auth.users` cria o perfil na mesma transação, inclusive quando há
confirmação de e-mail. Contas existentes recebem um perfil vazio para completar em
`/app/conta`. Não há dependência de uma sessão imediata após o cadastro.

A tabela `profiles` usa `auth.users.id` como identidade; não duplica senha ou e-mail.
Os dados canônicos para futura certificação são os da tabela, atualizados por
Minha conta. Os metadados do cadastro são somente a origem inicial, não uma regra
de autorização. Alterar metadados depois não modifica o perfil salvo.

RLS permite ler, inserir e atualizar somente o próprio perfil. Não há permissão
de exclusão, mudança de identidade ou escrita dos horários pelo navegador.
Os horários são mantidos por trigger. Nome e demais campos têm limites no banco;
data de nascimento, telefone e par de documento também têm restrições.
Documentos são autodeclarados: esta etapa não verifica identidade, autenticidade
ou dígitos de CPF.

## Conferência no Cloud

1. Aplicar a migration e executar `supabase/tests/profiles-smoke.sql` em um projeto
   de desenvolvimento. O teste cria duas contas temporárias, verifica o trigger,
   leitura/escrita próprias, isolamento, proibição de mudança de identidade e
   acesso anônimo. Termina com rollback.
2. Cadastrar um aluno com todos os dados e confirmar o e-mail.
3. Entrar, abrir Minha conta e conferir os dados recebidos do cadastro.
4. Corrigir um campo, salvar, recarregar e verificar persistência.
5. Entrar com uma conta antiga e completar seus dados.
6. Clicar no único botão Sair, no topo: encerra a sessão local e leva ao site
   público. Reabrir `/app` deve pedir login.

Sem a migration, a conta informa erro de carregamento e permite tentar novamente;
não apresenta os dados como salvos. Credenciais privilegiadas não são necessárias
no frontend.
