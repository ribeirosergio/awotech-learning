import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
}
const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: Boolean(supabase),
    error: null,
  });
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let events = 0;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      events++;
      if (active) setState({ session, loading: false, error: null });
      if (event === 'PASSWORD_RECOVERY')
        window.location.replace('/redefinir-senha');
    });
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active && events === 0)
          setState({
            session: data.session,
            loading: false,
            error: error
              ? 'Não foi possível recuperar sua sessão. Tente entrar novamente.'
              : null,
          });
      })
      .catch(() => {
        if (active)
          setState({
            session: null,
            loading: false,
            error: 'Não foi possível verificar sua sessão.',
          });
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return <AuthContext value={state}>{children}</AuthContext>;
}

export const useAuth = () => useContext(AuthContext);
