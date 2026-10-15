import { Link, Outlet, useParams } from 'react-router-dom';
import { catalog } from '../content';
import { useStudent } from './StudentProvider';

export function CourseGuard() {
  const { courseId = '' } = useParams();
  const student = useStudent();
  const course = catalog.getCourse(courseId);
  if (student.loading) return <p role="status">Verificando acesso ao curso…</p>;
  if (student.error)
    return (
      <div role="alert">
        <p>{student.error}</p>
        <button className="button" onClick={student.reload}>
          Tentar novamente
        </button>
      </div>
    );
  if (!course)
    return (
      <div>
        <h1>Curso não encontrado</h1>
        <Link to="/app/meus-cursos">Voltar aos meus cursos</Link>
      </div>
    );
  if (!student.hasAccess(course.productId))
    return (
      <section className="empty-state">
        <h1>Acesso não disponível</h1>
        <p>Sua conta não possui acesso ativo a este curso.</p>
        <Link className="button" to="/app/meus-cursos">
          Voltar aos meus cursos
        </Link>
        <button className="button button-secondary" onClick={student.reload}>
          Verificar acesso novamente
        </button>
      </section>
    );
  return <Outlet />;
}
