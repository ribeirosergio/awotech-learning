import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { readProfile, type StudentProfile } from '../lib/student-profile';
import StudentProfileFields from '../components/StudentProfileFields';

export default function Account() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) return;
    let active = true;
    void supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setProfile(data);
        setLoadError(
          error
            ? 'Não foi possível carregar seus dados. Tente novamente em instantes.'
            : '',
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, attempt]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !userId || busy) return;
    setError('');
    setSaved(false);
    let fields;
    try {
      fields = readProfile(new FormData(event.currentTarget));
    } catch (error) {
      setError((error as Error).message);
      return;
    }
    setBusy(true);
    try {
      const query = profile
        ? supabase.from('profiles').update(fields).eq('user_id', userId)
        : supabase.from('profiles').insert({ user_id: userId, ...fields });
      const { data, error } = await query.select().single();
      if (error) throw error;
      setProfile(data);
      setSaved(true);
    } catch {
      setError(
        'Não foi possível salvar seus dados. Confira sua conexão e tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-page">
      <p className="eyebrow">SEU PERFIL / SUA JORNADA</p>
      <h1>Minha conta</h1>
      <p className="account-intro">
        Mantenha seus dados atualizados para identificar suas conquistas e
        preparar seu certificado de conclusão.
      </p>
      <div className="account-layout">
        <div className="student-course-card account-card">
          {loading ? (
            <p role="status">Carregando seus dados…</p>
          ) : loadError ? (
            <div role="alert">
              <p>{loadError}</p>
              <button
                className="button"
                onClick={() => {
                  setLoading(true);
                  setAttempt((value) => value + 1);
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <form onSubmit={save} onChange={() => setSaved(false)}>
              <StudentProfileFields
                key={profile?.user_id ?? userId}
                defaults={profile ?? {}}
                disabled={busy}
              />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              {saved && (
                <p className="profile-success" role="status">
                  Dados atualizados com sucesso.
                </p>
              )}
              <button className="button" type="submit" disabled={busy}>
                {busy ? 'Salvando…' : 'Salvar meus dados ↗'}
              </button>
            </form>
          )}
        </div>
        <aside className="account-security">
          <span className="account-symbol" aria-hidden="true">
            ✳
          </span>
          <h2>Acesso à conta</h2>
          <p className="profile-hint">E-mail de acesso</p>
          <p className="account-email">{session?.user.email}</p>
          <p>
            Para alterar sua senha, solicite um link de recuperação no seu
            e-mail.
          </p>
          <Link className="button button-secondary" to="/esqueci-minha-senha">
            Recuperar senha
          </Link>
        </aside>
      </div>
    </section>
  );
}
