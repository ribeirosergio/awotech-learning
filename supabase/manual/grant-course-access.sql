-- SQL Editor do Supabase, como administrador. Substitua o email por um usuário já cadastrado.
-- O navegador NÃO executa este arquivo.
insert into public.user_access (user_id, product_id, access_type, starts_at, expires_at)
select id, 'robotica-basico', 'manual', now(), now() + interval '12 months'
from auth.users where lower(email) = lower('sergioribeiro.sjr@gmail.com')
on conflict (user_id, product_id) do update
  set access_type = 'manual', starts_at = excluded.starts_at, expires_at = excluded.expires_at
returning id, user_id, product_id, access_type, starts_at, expires_at;
-- Deve retornar exatamente uma linha. Resultado vazio indica que o email não foi encontrado.
