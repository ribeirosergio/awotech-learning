import { lazy, Suspense, useEffect } from 'react';
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
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function CircuitIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full"
      role="img"
      aria-label="Ilustração de uma placa conectada a uma luz, representando os projetos de robótica"
    >
      <defs>
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#ffffff" opacity=".12" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#dots)" />
      <path
        d="M120 70H300V133M120 230H300V170"
        fill="none"
        stroke="#c7e66b"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect
        x="45"
        y="40"
        width="150"
        height="220"
        rx="20"
        fill="#24645b"
        stroke="#69a18f"
      />
      <rect x="85" y="105" width="70" height="100" rx="5" fill="#102c29" />
      <rect x="95" y="30" width="50" height="40" rx="4" fill="#c1cec8" />
      {[80, 105, 130, 155, 180, 205, 230].map((y) => (
        <g key={y}>
          <circle cx="60" cy={y} r="4" fill="#c7e66b" />
          <circle cx="180" cy={y} r="4" fill="#c7e66b" />
        </g>
      ))}
      <circle cx="300" cy="150" r="44" fill="#c7e66b" opacity=".12" />
      <path d="M281 160v-20a19 19 0 0 1 38 0v20Z" fill="#c7e66b" />
      <path d="M290 160v23M310 160v23" stroke="#c1cec8" strokeWidth="5" />
      <text x="104" y="160" fill="#c7e66b" fontSize="24" fontFamily="monospace">
        01
      </text>
      <text x="244" y="244" fill="#d9e7e0" fontSize="12" fontFamily="monospace">
        IDEIA → AÇÃO
      </text>
    </svg>
  );
}

function CatalogPage() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">TECNOLOGIA SE APRENDE FAZENDO</p>
          <h1>
            Uma ideia.
            <br />
            Infinitas possibilidades.
          </h1>
          <p className="hero-copy">
            Descubra como a lógica, a eletrônica e a programação se encontram
            para dar vida às suas ideias.
          </p>
          <a className="button button-lime" href="#cursos">
            Explore os cursos <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="hero-illustration">
          <CircuitIllustration />
        </div>
      </section>
      <section id="cursos" className="section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SEU PRÓXIMO PROJETO COMEÇA AQUI</p>
            <h2>Explore uma nova habilidade</h2>
          </div>
          <Badge>Catálogo em preparação</Badge>
        </div>
        <div className="course-grid">
          {catalog.listCourses().map((course) => (
            <article key={course.id} className="course-card">
              <div className="course-cover">
                <span className="mono">01 / ROBÓTICA</span>
                <span aria-hidden="true" className="cover-symbol">
                  &lt; / &gt;
                </span>
                <Badge>Do conceito à construção</Badge>
              </div>
              <div className="course-card-body">
                <p className="eyebrow">LÓGICA · ELETRÔNICA · PROGRAMAÇÃO</p>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-card-footer">
                  <span>{course.lessonIds.length} aulas na trilha</span>
                  <Link to={`/cursos/${course.id}`}>
                    Conhecer a trilha <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="learning-path">
        <p className="eyebrow">DO PRIMEIRO CONCEITO AO PRIMEIRO ROBÔ</p>
        <h2>Entender. Experimentar. Criar.</h2>
        <p>
          A trilha começa com instruções simples, passa por circuitos e sensores
          e chega ao projeto de um robô autônomo.
        </p>
      </section>
    </>
  );
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
        <Badge>{lessons.length} aulas · Conteúdo em preparação</Badge>
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
            <span className="lesson-status">
              {lesson.contentStatus === 'outline' ? 'Planejada' : 'Prévia'}
            </span>
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
            isPlaceholder={definition.video.isPlaceholder}
            purpose="preview"
          />
        )}
        <p className="notice">
          O conteúdo completo, com textos, imagens e atividades, estará
          disponível na plataforma.
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
    <>
      <ScrollToPage />
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="AWOTech Learning, início">
          <span className="brand-icon" aria-hidden="true">
            a<span>↗</span>
          </span>
          <span>
            AWOTech <small>LEARNING</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal">
          <NavLink to="/cursos">Cursos</NavLink>
          <Link to="/app">Área do aluno</Link>
          <span className="preview-label">Prévia da plataforma</span>
        </nav>
      </header>
      <main id="conteudo" className="container">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
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
          <Route path="/cursos" element={<CatalogPage />} />
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
    </>
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
