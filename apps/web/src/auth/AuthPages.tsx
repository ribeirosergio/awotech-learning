import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { PlatformUnavailable } from './RequireAuth';
import { authRedirect, supabase } from '../lib/supabase';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';
const labels = {
  login: ['Entre na sua conta', 'Entrar'],
  signup: ['Comece sua jornada', 'Criar conta'],
  forgot: ['Recuperar senha', 'Enviar link de recuperação'],
  reset: ['Defina uma nova senha', 'Salvar nova senha'],
} satisfies Record<Mode, [string, string]>;

function authError(code?: string) {
  switch (code) {
    case 'invalid_credentials':
      return 'Email ou senha incorretos.';
    case 'email_not_confirmed':
      return 'Confirme seu email antes de entrar.';
    case 'user_already_exists':
      return 'Já existe uma conta com este email. Tente entrar ou recuperar a senha.';
    case 'weak_password':
      return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
    case 'same_password':
      return 'Escolha uma senha diferente da anterior.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    default:
      return 'Não foi possível concluir a solicitação. Verifique os dados e tente novamente.';
  }
}

export default function AuthPage({ mode }: { mode: Mode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const from = (location.state as { from?: unknown } | null)?.from;
  const destination =
    typeof from === 'string' && /^\/app(?:\/|\?|$)/.test(from) ? from : '/app';

  if (!supabase) return <PlatformUnavailable />;
  if (loading)
    return (
      <p className="page-status" role="status">
        Verificando sessão…
      </p>
    );
  if (session && (mode === 'login' || mode === 'signup'))
    return <Navigate to={destination} replace />;
  if (mode === 'reset' && !session)
    return (
      <section className="auth-card">
        <h1>Abra o link de recuperação</h1>
        <p>
          O link é necessário para definir uma nova senha. Ele pode ter
          expirado.
        </p>
        <Link to="/esqueci-minha-senha">Solicitar outro link</Link>
      </section>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    if (
      (mode === 'signup' || mode === 'reset') &&
      password !== form.get('confirmation')
    ) {
      setError('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(destination, { replace: true });
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: authRedirect('/login') },
        });
        if (error) throw error;
        if (data.session) navigate('/app', { replace: true });
        else {
          setMessage(
            'Confira seu email para confirmar o cadastro. Depois, entre na sua conta.',
          );
          setDone(true);
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: authRedirect('/redefinir-senha'),
        });
        if (error) throw error;
        setMessage(
          'Se houver uma conta elegível com este email, você receberá um link para redefinir a senha.',
        );
        setDone(true);
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage(
          'Senha atualizada. Você já pode continuar para seus cursos.',
        );
        setDone(true);
      }
    } catch (error) {
      setError(
        authError(
          error && typeof error === 'object' && 'code' in error
            ? String(error.code)
            : undefined,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">AWOTECH LEARNING</p>
      <h1>{labels[mode][0]}</h1>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {!done && (
        <form onSubmit={submit}>
          {mode !== 'reset' && (
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={busy}
              />
            </label>
          )}
          {mode !== 'forgot' && (
            <label>
              {mode === 'reset' ? 'Nova senha' : 'Senha'}
              <input
                name="password"
                type="password"
                minLength={mode === 'login' ? 1 : 8}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                required
                disabled={busy}
              />
            </label>
          )}
          {(mode === 'signup' || mode === 'reset') && (
            <label>
              Confirme a senha
              <input
                name="confirmation"
                type="password"
                minLength={8}
                autoComplete="new-password"
                required
                disabled={busy}
              />
            </label>
          )}
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Aguarde…' : labels[mode][1]}
          </button>
        </form>
      )}
      <div className="auth-links">
        {mode === 'login' && (
          <>
            <Link to="/cadastro">Criar uma conta</Link>
            <Link to="/esqueci-minha-senha">Esqueci minha senha</Link>
          </>
        )}
        {mode !== 'login' && (
          <Link to={mode === 'reset' && done ? '/app' : '/login'}>
            {mode === 'reset' && done
              ? 'Ir para meus cursos'
              : 'Voltar para o login'}
          </Link>
        )}
      </div>
    </section>
  );
}
