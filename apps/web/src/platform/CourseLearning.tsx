import { lazy, Suspense, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import {
  calculateProgress,
  getLessonProgression,
  getCompletionChecklist,
} from '@awotech/course-engine';
import { useAuth } from '../auth/AuthProvider';
import { catalog } from './content';
import { LessonMaterial } from './LessonMaterial';
import { useStudent } from './StudentProvider';
import { Progress } from './Progress';
import LockedLessonHint from './LockedLessonHint';

const CodePractice = lazy(() => import('./CodePractice'));
const AwotechLab = lazy(() => import('../lab/AwotechLab'));
const url = (courseId: string, lessonId: string) =>
  `/app/curso/${courseId}/aula/${lessonId}`;

export default function CourseLearning() {
  const { courseId = '', lessonId } = useParams();
  const course = catalog.getCourse(courseId);
  const student = useStudent();
  const { session } = useAuth();
  if (!course) return <h1>Curso não encontrado</h1>;
  const lessons = catalog.listLessons(courseId);
  const progress = calculateProgress(course, student.progress);
  const sequence = getLessonProgression(course, student.progress);
  const completed = sequence.completedIds;
  const lesson = lessonId ? catalog.getLesson(courseId, lessonId) : undefined;
  if (lessonId && !lesson)
    return (
      <section>
        <h1>Aula não encontrada</h1>
        <Link to={`/app/curso/${courseId}`}>Voltar ao curso</Link>
      </section>
    );
  return (
    <div className="student-course-layout">
      <aside className="lesson-sidebar student-lesson-sidebar">
        <Link className="back-link" to="/app/meus-cursos">
          ← Meus cursos
        </Link>
        <h2>{course.title}</h2>
        <Progress {...progress} />
        <nav aria-label="Aulas do curso">
          {lessons.map((item) =>
            sequence.unlockedIds.has(item.id) ? (
              <NavLink key={item.id} to={url(courseId, item.id)}>
                <span
                  aria-label={completed.has(item.id) ? 'Concluída' : 'Pendente'}
                >
                  {completed.has(item.id)
                    ? '✓'
                    : String(item.order).padStart(2, '0')}
                </span>
                {item.title}
              </NavLink>
            ) : (
              <LockedLessonHint key={item.id} className="locked-lesson">
                <span aria-label="Bloqueada">🔒</span>
                {item.title}
              </LockedLessonHint>
            ),
          )}
        </nav>
      </aside>
      <div className="student-lesson-body">
        {lesson && !sequence.unlockedIds.has(lesson.definition.id) ? (
          <section className="empty-state">
            <h1>Aula bloqueada</h1>
            <p>Conclua as aulas anteriores para liberar esta aula.</p>
            <Link className="button" to={url(courseId, sequence.nextLessonId!)}>
              Continuar na aula disponível →
            </Link>
          </section>
        ) : lesson ? (
          <article className="lesson-content">
            <p className="eyebrow">
              AULA {lesson.definition.order} / {lessons.length}
            </p>
            <h1>{lesson.definition.title}</h1>
            {!lesson.definition.video && (
              <div className="video-pending">
                <h2>Videoaula em preparação</h2>
                <p>
                  O vídeo completo desta aula será adicionado aqui. Você já pode
                  estudar pelo material abaixo.
                </p>
              </div>
            )}
            {lesson.definition.contentStatus === 'outline' && (
              <p className="notice">
                O detalhamento desta etapa ainda está em preparação.
              </p>
            )}
            <LessonMaterial lesson={lesson} />
            {lesson.definition.lab && session ? (
              <Suspense fallback={<p role="status">Preparando AWOTech Lab…</p>}>
                <AwotechLab
                  key={`${session.user.id}:${lesson.definition.id}`}
                  lesson={lesson.definition}
                  userId={session.user.id}
                />
              </Suspense>
            ) : (
              lesson.definition.code &&
              session && (
                <Suspense fallback={<p role="status">Preparando editor…</p>}>
                  <CodePractice
                    key={`${session.user.id}:${lesson.definition.id}`}
                    lesson={lesson.definition}
                    userId={session.user.id}
                  />
                </Suspense>
              )
            )}
            <CompletionButton
              key={lesson.definition.id}
              courseId={courseId}
              lessonId={lesson.definition.id}
              completed={completed.has(lesson.definition.id)}
              canReopen={sequence.reopenableLessonId === lesson.definition.id}
            />
            <LessonNavigation
              courseId={courseId}
              lessonId={lesson.definition.id}
              unlockedIds={sequence.unlockedIds}
            />
          </article>
        ) : (
          <section>
            <p className="eyebrow">SUA TRILHA</p>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <Progress {...progress} />
            <Link className="button" to={url(courseId, progress.nextLessonId!)}>
              Continuar curso →
            </Link>
            <div className="syllabus">
              {lessons.map((item) => {
                const unlocked = sequence.unlockedIds.has(item.id);
                const row = (
                  <>
                    <span className="lesson-number">
                      {completed.has(item.id)
                        ? '✓'
                        : String(item.order).padStart(2, '0')}
                    </span>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.summary}</p>
                    </div>
                    <span>
                      {!unlocked
                        ? '🔒 Bloqueada'
                        : completed.has(item.id)
                          ? 'Concluída'
                          : 'Abrir →'}
                    </span>
                  </>
                );
                return unlocked ? (
                  <Link
                    className="lesson-row"
                    key={item.id}
                    to={url(courseId, item.id)}
                  >
                    {row}
                  </Link>
                ) : (
                  <LockedLessonHint
                    as="div"
                    className="lesson-row"
                    key={item.id}
                  >
                    {row}
                  </LockedLessonHint>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function CompletionButton({
  courseId,
  lessonId,
  completed,
  canReopen,
}: {
  courseId: string;
  lessonId: string;
  completed: boolean;
  canReopen: boolean;
}) {
  const { saveProgress } = useStudent();
  const student = useStudent();
  const definition = catalog.getLesson(courseId, lessonId)!.definition;
  const requirements = getCompletionChecklist(
    definition,
    student.evidence.find(
      (e) => e.course_id === courseId && e.lesson_id === lessonId,
    ),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function save() {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      await saveProgress(courseId, lessonId, !completed);
      setMessage(
        completed
          ? 'Aula marcada como pendente.'
          : 'Aula concluída. Progresso salvo.',
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o progresso.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="completion-section">
      <h2>Requisitos para concluir</h2>
      <ul className="completion-checklist">
        <li>
          {requirements.video.complete ? '✓' : '○'} Vídeo assistido e salvo:{' '}
          {requirements.video.percent}%
        </li>
        {requirements.activities.map((activity) => (
          <li key={activity.id}>
            {activity.complete ? '✓' : '○'} {activity.title}
            {!activity.available ? ' — disponível em uma próxima etapa' : ''}
          </li>
        ))}
      </ul>
      {!completed && !requirements.ready && (
        <p>
          Assista à videoaula e conclua as atividades obrigatórias para liberar
          a conclusão e a próxima aula.
        </p>
      )}
      {student.evidenceError && (
        <p className="form-error" role="alert">
          {student.evidenceError}
        </p>
      )}
      <button
        className="button"
        onClick={save}
        disabled={busy || (completed ? !canReopen : !requirements.ready)}
      >
        {busy
          ? 'Salvando…'
          : completed
            ? '✓ Concluída — marcar como pendente'
            : 'Marcar aula como concluída'}
      </button>
      {completed && !canReopen && (
        <p>
          Para manter a sequência, apenas a última aula concluída pode voltar a
          pendente.
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function LessonNavigation({
  courseId,
  lessonId,
  unlockedIds,
}: {
  courseId: string;
  lessonId: string;
  unlockedIds: Set<string>;
}) {
  const navigation = catalog.getNavigation(courseId, lessonId);
  return (
    <nav className="lesson-navigation" aria-label="Navegação entre aulas">
      <div>
        {navigation.previous && (
          <Link to={url(courseId, navigation.previous)}>← Aula anterior</Link>
        )}
      </div>
      <div>
        {navigation.next &&
          (unlockedIds.has(navigation.next) ? (
            <Link to={url(courseId, navigation.next)}>Próxima aula →</Link>
          ) : (
            <LockedLessonHint className="locked-navigation">
              🔒 Conclua esta aula para continuar
            </LockedLessonHint>
          ))}
      </div>
    </nav>
  );
}
