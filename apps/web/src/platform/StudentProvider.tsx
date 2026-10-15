import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { hasCourseAccess } from '@awotech/course-engine';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import type { LessonProgress, UserAccess } from '../lib/database.types';

interface Snapshot {
  owner: string;
  loading: boolean;
  error: string;
  access: UserAccess[];
  progress: LessonProgress[];
  serverTime: number;
  measuredAt: number;
}
const empty: Snapshot = {
  owner: '',
  loading: true,
  error: '',
  access: [],
  progress: [],
  serverTime: 0,
  measuredAt: 0,
};
interface StudentState extends Snapshot {
  hasAccess: (productId: string) => boolean;
  reload: () => void;
  saveProgress: (
    courseId: string,
    lessonId: string,
    completed: boolean,
  ) => Promise<void>;
}
const StudentContext = createContext<StudentState | null>(null);

export function StudentProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const [snapshot, setSnapshot] = useState<Snapshot>(empty);
  const [revision, setRevision] = useState(0);
  const [, tick] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!supabase || !userId) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      setSnapshot({ ...empty, owner: userId });
      try {
        const [access, progress] = await Promise.all([
          supabase!.rpc('get_my_access').abortSignal(controller.signal),
          supabase!
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .abortSignal(controller.signal),
        ]);
        if (access.error || progress.error) throw new Error('student_data');
        const data = access.data as unknown as {
          server_time: string;
          access: UserAccess[];
        };
        if (
          !data ||
          !Array.isArray(data.access) ||
          !Number.isFinite(Date.parse(data.server_time))
        )
          throw new Error('invalid_access');
        if (active)
          setSnapshot({
            owner: userId,
            loading: false,
            error: '',
            access: data.access,
            progress: progress.data ?? [],
            serverTime: Date.parse(data.server_time),
            measuredAt: performance.now(),
          });
      } catch {
        if (active)
          setSnapshot({
            ...empty,
            owner: userId,
            loading: false,
            error:
              'Não foi possível carregar seus cursos e progresso. Tente novamente.',
          });
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [userId, revision]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible') reload();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [reload]);

  useEffect(() => {
    if (snapshot.loading) return;
    const now = snapshot.serverTime + performance.now() - snapshot.measuredAt;
    const transitions = snapshot.access
      .flatMap((row) => [
        Date.parse(row.starts_at),
        row.expires_at ? Date.parse(row.expires_at) : Infinity,
      ])
      .filter((time) => time > now);
    const delay = Math.max(
      100,
      Math.min(60000, ...transitions.map((time) => time - now + 10)),
    );
    const timer = window.setTimeout(() => tick((value) => value + 1), delay);
    return () => window.clearTimeout(timer);
  });

  const current = snapshot.owner === userId ? snapshot : { ...empty };
  function hasAccess(productId: string) {
    return (
      !current.loading &&
      !current.error &&
      hasCourseAccess(
        current.access,
        userId,
        productId,
        current.serverTime + performance.now() - current.measuredAt,
      )
    );
  }

  async function saveProgress(
    courseId: string,
    lessonId: string,
    completed: boolean,
  ) {
    if (!supabase || !userId || !hasAccess(courseId))
      throw new Error(
        'Seu acesso precisa estar ativo para salvar o progresso.',
      );
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed,
        },
        { onConflict: 'user_id,course_id,lesson_id' },
      )
      .select()
      .single();
    if (error || !data)
      throw new Error(
        'Não foi possível salvar a conclusão. Seu progresso não foi alterado.',
      );
    setSnapshot((previous) =>
      previous.owner !== userId
        ? previous
        : {
            ...previous,
            progress: [
              ...previous.progress.filter(
                (row) =>
                  row.course_id !== courseId || row.lesson_id !== lessonId,
              ),
              data,
            ],
          },
    );
  }

  return (
    <StudentContext value={{ ...current, hasAccess, reload, saveProgress }}>
      {children}
    </StudentContext>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('StudentProvider ausente');
  return context;
}
