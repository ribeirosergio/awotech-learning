import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type PropsWithChildren,
} from 'react';
import {
  hasCourseAccess,
  getLessonProgression,
  getCompletionChecklist,
} from '@awotech/course-engine';
import type { LessonEvidence, WatchedRange } from '@awotech/course-engine';
import { catalog } from '../content';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import type { LessonProgress, UserAccess } from '../lib/database.types';

interface Snapshot {
  owner: string;
  loading: boolean;
  error: string;
  access: UserAccess[];
  progress: LessonProgress[];
  evidence: LessonEvidence[];
  evidenceError: string;
  serverTime: number;
  measuredAt: number;
}
const empty: Snapshot = {
  owner: '',
  loading: true,
  error: '',
  access: [],
  progress: [],
  evidence: [],
  evidenceError: '',
  serverTime: 0,
  measuredAt: 0,
};
interface StudentState extends Snapshot {
  hasAccess: (productId: string) => boolean;
  reload: () => void;
  recordEvidence: (
    courseId: string,
    lessonId: string,
    report: {
      video?: { id: string; duration: number; ranges: WatchedRange[] };
      activity?: string;
    },
  ) => Promise<void>;
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
  const evidenceQueue = useRef<Promise<void>>(Promise.resolve());
  const [, tick] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!supabase || !userId) return;
    const controller = new AbortController();
    let active = true;
    async function load() {
      setSnapshot((previous) =>
        previous.owner === userId && !previous.loading
          ? previous
          : { ...empty, owner: userId },
      );
      try {
        const [access, progress, evidence] = await Promise.all([
          supabase!.rpc('get_my_access').abortSignal(controller.signal),
          supabase!
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .abortSignal(controller.signal),
          supabase!
            .from('lesson_evidence')
            .select('*')
            .eq('user_id', userId)
            .abortSignal(controller.signal),
        ]);
        if (access.error || progress.error || evidence.error)
          throw new Error('student_data');
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
            evidence: evidence.data ?? [],
            evidenceError: '',
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
              'Não foi possível carregar seus cursos e progresso. Verifique se todas as migrations foram aplicadas e tente novamente.',
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
  const recordEvidence = useCallback(
    (
      courseId: string,
      lessonId: string,
      report: {
        video?: { id: string; duration: number; ranges: WatchedRange[] };
        activity?: string;
      },
    ) => {
      const work = evidenceQueue.current
        .catch(() => {})
        .then(async () => {
          if (!supabase || !userId)
            throw new Error('Entre novamente para salvar as verificações.');
          const { catalog: fullCatalog } = await import('./content');
          const lesson = fullCatalog.getLesson(courseId, lessonId)?.definition;
          if (!lesson?.video) throw new Error('Videoaula não configurada.');
          const { data, error } = await supabase.rpc('save_lesson_evidence', {
            p_user_id: userId,
            p_course_id: courseId,
            p_lesson_id: lessonId,
            p_video_id: report.video?.id ?? lesson.video.videoId,
            p_duration: report.video?.duration ?? 0,
            p_ranges: report.video?.ranges ?? [],
            p_activities: report.activity ? [report.activity] : [],
          });
          if (error || !data) {
            setSnapshot((previous) =>
              previous.owner !== userId
                ? previous
                : {
                    ...previous,
                    evidenceError:
                      'Não foi possível salvar as verificações. Confira a conexão e tente novamente.',
                  },
            );
            throw new Error('Falha ao salvar verificações.');
          }
          setSnapshot((previous) =>
            previous.owner !== userId
              ? previous
              : {
                  ...previous,
                  evidenceError: '',
                  evidence: [
                    ...previous.evidence.filter(
                      (e) =>
                        e.course_id !== courseId || e.lesson_id !== lessonId,
                    ),
                    data,
                  ],
                },
          );
        });
      evidenceQueue.current = work;
      return work;
    },
    [userId],
  );
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
    const course = catalog.getCourse(courseId);
    if (!supabase || !userId || !course || !hasAccess(course.productId))
      throw new Error(
        'Seu acesso precisa estar ativo para salvar o progresso.',
      );
    if (completed) {
      const { catalog: fullCatalog } = await import('./content');
      const lesson = fullCatalog.getLesson(courseId, lessonId)?.definition;
      if (
        !lesson ||
        !getCompletionChecklist(
          lesson,
          current.evidence.find(
            (e) => e.course_id === courseId && e.lesson_id === lessonId,
          ),
        ).ready
      )
        throw new Error(
          'Assista ao vídeo e conclua todas as atividades obrigatórias antes de concluir.',
        );
    }
    const sequence = getLessonProgression(course, current.progress);
    if (!sequence.unlockedIds.has(lessonId))
      throw new Error('Conclua as aulas anteriores antes de continuar.');
    if (
      !completed &&
      sequence.completedIds.has(lessonId) &&
      sequence.reopenableLessonId !== lessonId
    ) {
      throw new Error(
        'Somente a última aula concluída pode voltar a pendente.',
      );
    }
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
    if (error?.code === '23514')
      throw new Error(
        'Conclua o vídeo e as atividades obrigatórias, salve as verificações e siga a ordem das aulas.',
      );
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
    <StudentContext
      value={{ ...current, hasAccess, reload, saveProgress, recordEvidence }}
    >
      {children}
    </StudentContext>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('StudentProvider ausente');
  return context;
}
