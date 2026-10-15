/** Compartilhado pelo build e pelo navegador; nunca inclui valores de chaves em erros. */
export function readSupabaseConfig(env: Record<string, string | undefined>) {
  for (const [name, value] of Object.entries(env)) {
    if (value && name.startsWith('VITE_') && /SERVICE_ROLE|SECRET/i.test(name))
      throw new Error('Chaves privilegiadas não podem usar o prefixo VITE_.');
  }
  const url = env.VITE_SUPABASE_URL?.trim();
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url && !key) return null;
  if (!url || !key)
    throw new Error(
      'Configure a URL e a chave pública do Supabase em apps/web/.env.local.',
    );
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password)
      throw new Error();
  } catch {
    throw new Error(
      'VITE_SUPABASE_URL precisa ser uma URL HTTPS do Supabase Cloud.',
    );
  }
  let publicKey = key.startsWith('sb_publishable_');
  if (!publicKey) {
    try {
      const payload = key.split('.')[1];
      publicKey =
        Boolean(payload) &&
        JSON.parse(atob(payload!.replace(/-/g, '+').replace(/_/g, '/')))
          .role === 'anon';
    } catch {
      publicKey = false;
    }
  }
  if (!publicKey)
    throw new Error(
      'Use apenas a chave publicável ou anon; chaves privilegiadas são proibidas no frontend.',
    );
  return { url, key };
}
