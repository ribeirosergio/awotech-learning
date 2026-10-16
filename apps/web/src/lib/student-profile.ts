export type ProfileData = {
  full_name: string;
  birth_date: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  document_type: string | null;
  document_number: string | null;
};

export type StudentProfile = Omit<ProfileData, 'birth_date'> & {
  user_id: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
};

export function readProfile(form: FormData): ProfileData {
  const value = (key: string) => String(form.get(key) ?? '').trim();
  const profile: ProfileData = {
    full_name: value('full_name'),
    birth_date: value('birth_date'),
    phone: value('phone'),
    city: value('city'),
    state: value('state'),
    country: value('country'),
    document_type: value('document_type') || null,
    document_number: value('document_number') || null,
  };
  if (profile.full_name.length < 3 || profile.full_name.length > 160)
    throw new Error('Informe seu nome completo, com até 160 caracteres.');
  const date = new Date(`${profile.birth_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(profile.birth_date) ||
    !Number.isFinite(date.getTime()) ||
    date.getFullYear() < 1900 ||
    date > today ||
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` !==
      profile.birth_date
  )
    throw new Error('Informe uma data de nascimento válida.');
  if (
    !/^[+\d\s().-]+$/.test(profile.phone) ||
    profile.phone.replace(/\D/g, '').length < 10 ||
    profile.phone.replace(/\D/g, '').length > 15 ||
    profile.phone.length > 32
  )
    throw new Error(
      'Informe um telefone com DDD e, se necessário, código do país.',
    );
  for (const key of ['city', 'state', 'country'] as const) {
    if (!profile[key] || profile[key].length > 100)
      throw new Error(
        'Preencha cidade, estado/região e país, com até 100 caracteres.',
      );
  }
  if (
    Boolean(profile.document_type) !== Boolean(profile.document_number) ||
    (profile.document_type &&
      !['CPF', 'RG', 'Passaporte', 'Outro'].includes(profile.document_type)) ||
    (profile.document_number &&
      (profile.document_number.length < 3 ||
        profile.document_number.length > 32))
  )
    throw new Error(
      'Para informar um documento, escolha o tipo e preencha o número (3 a 32 caracteres). Ou deixe ambos em branco.',
    );
  return profile;
}
