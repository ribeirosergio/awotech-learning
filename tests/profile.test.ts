import { describe, expect, it } from 'vitest';
import { readProfile } from '../apps/web/src/lib/student-profile';

function form(values: Record<string, string | undefined> = {}) {
  const data = new FormData();
  Object.entries({
    full_name: '  Sérgio Ribeiro  ',
    birth_date: '1990-03-12',
    phone: '(24) 99902-1787',
    city: 'Volta Redonda',
    state: 'RJ',
    country: 'Brasil',
    ...values,
  }).forEach(([key, value]) => data.set(key, value ?? ''));
  return data;
}

describe('dados do aluno', () => {
  it('preserva acentos, normaliza espaços e permite documento opcional', () => {
    const profile = readProfile(form());
    expect(profile.full_name).toBe('Sérgio Ribeiro');
    expect(profile.document_number).toBeNull();
    expect(profile.document_type).toBeNull();
  });
  it('rejeita datas impossíveis, futuras e anteriores a 1900', () => {
    for (const birth_date of ['2025-02-30', '2999-01-01', '1899-12-31', ''])
      expect(() => readProfile(form({ birth_date }))).toThrow(
        'data de nascimento',
      );
  });
  it('rejeita dados incompletos, telefone inválido e texto acima dos limites', () => {
    for (const fields of [
      { full_name: 'A' },
      { phone: '123' },
      { phone: '(24) abc999021787' },
      { city: '' },
      { country: 'x'.repeat(101) },
    ])
      expect(() => readProfile(form(fields))).toThrow();
  });
  it('exige tipo e número juntos para um documento e recusa tipos desconhecidos', () => {
    expect(
      readProfile(
        form({ document_type: 'Passaporte', document_number: 'AB123456' }),
      ).document_number,
    ).toBe('AB123456');
    for (const fields of [
      { document_type: 'CPF' },
      { document_number: '123456' },
      { document_type: 'Admin', document_number: '123456' },
    ])
      expect(() => readProfile(form(fields))).toThrow('documento');
  });
});
