import { lazy, Suspense, useEffect } from 'react';
import LandingPage from './public/LandingPage';
import PublicHeader from './public/PublicHeader';
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import { Badge, YouTubeVideo } from '@awotech/ui';
import { catalog } from './content';
import { RequireAuth } from './auth/RequireAuth';
import { StudentProvider } from './platform/StudentProvider';
import { useAuth } from './auth/AuthProvider';

const StudentApp = lazy(() => import('./platform/StudentApp'));
const AuthPage = lazy(() => import('./auth/AuthPages'));

const lessonUrl = (courseId: string, lessonId: string) =>
  `/cursos/${courseId}/aulas/${lessonId}/previa`;

function ScrollToPage() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash, key]);
  return null;
}

function CoursePage() {
  const { courseId = '' } = useParams();
  const course = catalog.getCourse(courseId);
  if (!course) return <NotFound />;
  const lessons = catalog.listLessons(courseId);
  return (
    <section className="section-space">
      <Link className="back-link" to="/cursos">
        ← Todos os cursos
      </Link>
      <div className="course-intro">
        <p className="eyebrow">TRILHA DE APRENDIZAGEM</p>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <Badge>{lessons.length} aulas · Do conceito à prática</Badge>
      </div>
      <div className="syllabus">
        {lessons.map((lesson) => (
          <Link
            className="lesson-row"
            key={lesson.id}
            to={lessonUrl(courseId, lesson.id)}
          >
            <span className="lesson-number">
              {String(lesson.order).padStart(2, '0')}
            </span>
            <div>
              <h2>{lesson.title}</h2>
              <p>{lesson.summary}</p>
            </div>
            <span className="lesson-status">Prévia</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LessonPreviewPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const lesson = catalog.getLesson(courseId, lessonId);
  const course = catalog.getCourse(courseId);
  if (!lesson || !course) return <NotFound />;
  const definition = lesson;
  const navigation = catalog.getNavigation(courseId, lessonId);
  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar">
        <Link className="back-link" to={`/cursos/${courseId}`}>
          ← Visão do curso
        </Link>
        <h2>{course.title}</h2>
        <nav aria-label="Aulas do curso">
          {catalog.listLessons(courseId).map((item) => (
            <NavLink key={item.id} to={lessonUrl(courseId, item.id)}>
              <span className="mono">
                {String(item.order).padStart(2, '0')}
              </span>
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>
      <article className="lesson-content">
        <p className="eyebrow">
          AULA {String(definition.order).padStart(2, '0')} /{' '}
          {course.lessonIds.length}
        </p>
        <h1>{definition.title}</h1>
        <Badge>Prévia da aula</Badge>
        <section className="lesson-section" aria-label="Resumo da aula">
          <p>{definition.summary}</p>
        </section>
        {definition.video && (
          <YouTubeVideo
            key={definition.id}
            videoId={definition.video.videoId}
            title={definition.title}
            purpose="preview"
          />
        )}
        <p className="notice">
          Acesse a área do aluno para estudar o conteúdo completo, com textos,
          imagens e atividades do curso.
        </p>
        <nav className="lesson-navigation" aria-label="Navegação entre aulas">
          <div>
            {navigation.previous && (
              <Link to={lessonUrl(courseId, navigation.previous)}>
                ← Prévia anterior
              </Link>
            )}
          </div>
          <div>
            {navigation.next && (
              <Link to={lessonUrl(courseId, navigation.next)}>
                Próxima prévia →
              </Link>
            )}
          </div>
        </nav>
      </article>
    </div>
  );
}

function LegacyLessonRedirect() {
  const { courseId = '', lessonId = '' } = useParams();
  return <Navigate replace to={lessonUrl(courseId, lessonId)} />;
}

function NotFound() {
  return (
    <section className="section-space">
      <p className="eyebrow">404</p>
      <h1>Página não encontrada</h1>
      <p>O curso ou a aula deste endereço não está disponível.</p>
      <Link className="button" to="/cursos">
        Voltar aos cursos
      </Link>
    </section>
  );
}

function PublicApp() {
  return (
    <div className="public-shell">
      <ScrollToPage />
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="conteudo" className="container public-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={<AuthPage key="login" mode="login" />}
          />
          <Route
            path="/cadastro"
            element={<AuthPage key="signup" mode="signup" />}
          />
          <Route
            path="/esqueci-minha-senha"
            element={<AuthPage key="forgot" mode="forgot" />}
          />
          <Route
            path="/redefinir-senha"
            element={<AuthPage key="reset" mode="reset" />}
          />
          <Route path="/cursos" element={<LandingPage />} />
          <Route path="/cursos/:courseId" element={<CoursePage />} />
          <Route
            path="/cursos/:courseId/aulas/:lessonId/previa"
            element={<LessonPreviewPage />}
          />
          <Route
            path="/curso/:courseId/aula/:lessonId"
            element={<LegacyLessonRedirect />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>AWOTech Learning</span>
        <span>Aprenda criando o futuro.</span>
      </footer>
    </div>
  );
}

function PrivateApp() {
  const { session } = useAuth();
  return (
    <RequireAuth>
      <StudentProvider key={session?.user.id}>
        <StudentApp />
      </StudentProvider>
    </RequireAuth>
  );
}

export function App() {
  return (
    <Suspense
      fallback={
        <p className="page-status" role="status">
          Carregando…
        </p>
      }
    >
      <Routes>
        <Route path="/app/*" element={<PrivateApp />} />
        <Route path="*" element={<PublicApp />} />
      </Routes>
    </Suspense>
  );
}
