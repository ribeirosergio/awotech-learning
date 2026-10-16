import { lazy, Suspense, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { calculateProgress } from '@awotech/course-engine';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { catalog } from '../content';
import { CourseGuard } from './CourseGuard';
import { useStudent } from './StudentProvider';
import { Progress } from './Progress';
import Account from './Account';
import './platform.css';

const CourseLearning = lazy(() => import('./CourseLearning'));

export default function StudentApp() {
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    if (!supabase || busy) return;
    setBusy(true);
    setError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      // Recarrega a página pública após limpar a sessão, inclusive o estado em memória.
      window.location.replace('/');
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
        <nav className="student-top-navigation" aria-label="Área do aluno">
          <NavLink to="/app/meus-cursos">
            <span aria-hidden="true">▦</span> Meus cursos
          </NavLink>
          <NavLink to="/app/conta">
            <span aria-hidden="true">◎</span> Minha conta
          </NavLink>
        </nav>
        <span className="student-header-email" title={session?.user.email}>
          {session?.user.email}
        </span>
        <button
          className="button button-lime student-logout"
          onClick={logout}
          disabled={busy}
        >
          {busy ? 'Saindo…' : 'Sair'}
        </button>
      </header>
      <div className="student-layout">
        <main id="aula-conteudo" className="student-main">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
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
      <div className="student-welcome">
        <div>
          <p className="eyebrow">APRENDA. EXPERIMENTE. CONSTRUA.</p>
          <h1>Meus cursos</h1>
          <p>
            Cada descoberta abre caminho para sua próxima ideia. Continue de
            onde parou.
          </p>
        </div>
        <span aria-hidden="true">✳</span>
      </div>
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
                <div className="student-course-banner">
                  <span className="mono">
                    SUA TRILHA / {course.lessonIds.length} AULAS
                  </span>
                  <span aria-hidden="true">&lt; / &gt;</span>
                </div>
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
