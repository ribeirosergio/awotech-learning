import { describe, expect, it } from 'vitest';
import { readSupabaseConfig } from '../apps/web/src/lib/supabase-config';
describe('configuração pública do Supabase', () => {
  const base = {
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
  };
  it('funciona sem configuração e exige o par URL/chave quando configurado', () => {
    expect(readSupabaseConfig({})).toBeNull();
    expect(readSupabaseConfig(base)).toEqual({
      url: base.VITE_SUPABASE_URL,
      key: base.VITE_SUPABASE_PUBLISHABLE_KEY,
    });
    expect(() =>
      readSupabaseConfig({ VITE_SUPABASE_URL: base.VITE_SUPABASE_URL }),
    ).toThrow();
  });
  it('rejeita chaves secretas e JWT service_role antes de gerar o build', () => {
    for (const key of [
      'sb_secret_do-not-publish',
      `header.${btoa(JSON.stringify({ role: 'service_role' }))}.signature`,
    ]) {
      expect(() =>
        readSupabaseConfig({ ...base, VITE_SUPABASE_PUBLISHABLE_KEY: key }),
      ).toThrow('chaves privilegiadas');
    }
    expect(() =>
      readSupabaseConfig({ ...base, VITE_SUPABASE_SERVICE_ROLE_KEY: 'secret' }),
    ).toThrow('prefixo VITE_');
    expect(() =>
      readSupabaseConfig({ ...base, VITE_SUPABASE_URL: 'http://example.com' }),
    ).toThrow('HTTPS');
  });
  it('aceita anon legado sem aceitar outras roles', () => {
    const anon = `header.${btoa(JSON.stringify({ role: 'anon' }))}.signature`;
    expect(
      readSupabaseConfig({ ...base, VITE_SUPABASE_PUBLISHABLE_KEY: anon })?.key,
    ).toBe(anon);
  });
});
