import { lazy, Suspense, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { calculateProgress } from '@awotech/course-engine';
import { useAuth } from '../auth/AuthProvider';
import { catalog } from './content';
import { LessonMaterial } from './LessonMaterial';
import { useStudent } from './StudentProvider';
import { Progress } from './Progress';

const CodePractice = lazy(() => import('./CodePractice'));
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
  const completed = new Set(
    student.progress
      .filter((row) => row.course_id === courseId && row.completed)
      .map((row) => row.lesson_id),
  );
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
          {lessons.map((item) => (
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
          ))}
        </nav>
      </aside>
      <div className="student-lesson-body">
        {lesson ? (
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
            {lesson.definition.code && session && (
              <Suspense fallback={<p role="status">Preparando editor…</p>}>
                <CodePractice
                  key={`${session.user.id}:${lesson.definition.id}`}
                  lesson={lesson.definition}
                  userId={session.user.id}
                />
              </Suspense>
            )}
            <CompletionButton
              key={lesson.definition.id}
              courseId={courseId}
              lessonId={lesson.definition.id}
              completed={completed.has(lesson.definition.id)}
            />
            <LessonNavigation
              courseId={courseId}
              lessonId={lesson.definition.id}
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
              {lessons.map((item) => (
                <Link
                  className="lesson-row"
                  key={item.id}
                  to={url(courseId, item.id)}
                >
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
                    {completed.has(item.id) ? 'Concluída' : 'Abrir →'}
                  </span>
                </Link>
              ))}
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
}: {
  courseId: string;
  lessonId: string;
  completed: boolean;
}) {
  const { saveProgress } = useStudent();
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
      <button className="button" onClick={save} disabled={busy}>
        {busy
          ? 'Salvando…'
          : completed
            ? '✓ Concluída — marcar como pendente'
            : 'Marcar aula como concluída'}
      </button>
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
}: {
  courseId: string;
  lessonId: string;
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
        {navigation.next && (
          <Link to={url(courseId, navigation.next)}>Próxima aula →</Link>
        )}
      </div>
    </nav>
  );
}
