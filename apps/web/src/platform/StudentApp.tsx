import { lazy, Suspense, useState } from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { calculateProgress } from '@awotech/course-engine';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { catalog } from '../content';
import { CourseGuard } from './CourseGuard';
import { useStudent } from './StudentProvider';
import { Progress } from './Progress';
import './platform.css';

const CourseLearning = lazy(() => import('./CourseLearning'));

export default function StudentApp() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    if (!supabase || busy) return;
    setBusy(true);
    setError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      navigate('/login', { replace: true });
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="student-shell">
      <a href="#aula-conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="student-header">
        <Link className="brand" to="/app">
          AWOTech <small>LEARNING</small>
        </Link>
        <Link to="/">Site público ↗</Link>
      </header>
      <div className="student-layout">
        <aside className="student-navigation">
          <p className="eyebrow">PLATAFORMA DO ALUNO</p>
          <nav aria-label="Área do aluno">
            <NavLink to="/app/meus-cursos">Meus cursos</NavLink>
            <NavLink to="/app/conta">Minha conta</NavLink>
          </nav>
          <p className="student-email">{session?.user.email}</p>
          <button
            className="button button-secondary"
            onClick={logout}
            disabled={busy}
          >
            {busy ? 'Saindo…' : 'Sair'}
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </aside>
        <main id="aula-conteudo" className="student-main">
          <Suspense fallback={<p role="status">Carregando…</p>}>
            <Routes>
              <Route index element={<Navigate replace to="meus-cursos" />} />
              <Route path="meus-cursos" element={<MyCourses />} />
              <Route path="conta" element={<Account />} />
              <Route path="curso/:courseId" element={<CourseGuard />}>
                <Route index element={<CourseLearning />} />
                <Route path="aula/:lessonId" element={<CourseLearning />} />
              </Route>
              <Route
                path="*"
                element={
                  <section>
                    <h1>Página não encontrada</h1>
                    <Link to="/app/meus-cursos">Ir para meus cursos</Link>
                  </section>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function MyCourses() {
  const student = useStudent();
  const courses = catalog
    .listCourses()
    .filter((course) => student.hasAccess(course.productId));
  return (
    <section>
      <p className="eyebrow">SUA JORNADA</p>
      <h1>Meus cursos</h1>
      {student.loading ? (
        <p role="status">Carregando seus cursos…</p>
      ) : student.error ? (
        <div role="alert">
          <p>{student.error}</p>
          <button className="button" onClick={student.reload}>
            Tentar novamente
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h2>Seu próximo aprendizado começa aqui</h2>
          <p>Você ainda não possui cursos com acesso ativo.</p>
          <Link className="button" to="/cursos">
            Conhecer os cursos
          </Link>
          <button className="button button-secondary" onClick={student.reload}>
            Atualizar meus acessos
          </button>
        </div>
      ) : (
        <div className="student-courses">
          {courses.map((course) => {
            const progress = calculateProgress(course, student.progress);
            return (
              <article className="student-course-card" key={course.id}>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <Progress {...progress} />
                <div className="course-actions">
                  <Link
                    className="button"
                    to={`/app/curso/${course.id}/aula/${progress.nextLessonId}`}
                  >
                    Continuar curso →
                  </Link>
                  <Link to={`/app/curso/${course.id}`}>Ver todas as aulas</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Account() {
  const { session } = useAuth();
  return (
    <section>
      <p className="eyebrow">SEUS DADOS</p>
      <h1>Minha conta</h1>
      <div className="student-course-card">
        <h2>Email</h2>
        <p>{session?.user.email}</p>
        <p>Para alterar sua senha, solicite um link de recuperação.</p>
        <Link className="button" to="/esqueci-minha-senha">
          Recuperar senha
        </Link>
      </div>
    </section>
  );
}
