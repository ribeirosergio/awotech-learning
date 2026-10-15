import { Navigate, useLocation, Link } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';

export function PlatformUnavailable() {
  return (
    <section className="auth-card">
      <h1>Plataforma em preparação</h1>
      <p>
        A área do aluno estará disponível após a configuração do serviço de
        acesso.
      </p>
      <Link className="button" to="/cursos">
        Explorar os cursos
      </Link>
    </section>
  );
}

export function RequireAuth({ children }: PropsWithChildren) {
  const { session, loading, error } = useAuth();
  const location = useLocation();
  if (!supabase) return <PlatformUnavailable />;
  if (loading)
    return (
      <p role="status" className="page-status">
        Verificando sua sessão…
      </p>
    );
  if (!session)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  if (error) return <p role="alert">{error}</p>;
  return children;
}
