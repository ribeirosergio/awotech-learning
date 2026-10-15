import { describe, expect, it } from 'vitest';
import {
  calculateProgress,
  hasCourseAccess,
} from '../packages/course-engine/src/student';

const start = Date.parse('2026-10-14T12:00:00Z');
const grant = {
  user_id: 'aluno-a',
  product_id: 'robotica-basico',
  starts_at: new Date(start).toISOString(),
  expires_at: new Date(start + 1000).toISOString(),
};
describe('entitlement por usuário, produto e vigência', () => {
  it('aceita o início e rejeita o instante exato da expiração', () => {
    expect(
      hasCourseAccess([grant], 'aluno-a', 'robotica-basico', start - 1),
    ).toBe(false);
    expect(hasCourseAccess([grant], 'aluno-a', 'robotica-basico', start)).toBe(
      true,
    );
    expect(
      hasCourseAccess([grant], 'aluno-a', 'robotica-basico', start + 999),
    ).toBe(true);
    expect(
      hasCourseAccess([grant], 'aluno-a', 'robotica-basico', start + 1000),
    ).toBe(false);
  });
  it('rejeita outro usuário, outro produto, datas inválidas e ausência de acesso', () => {
    expect(hasCourseAccess([grant], 'aluno-b', 'robotica-basico', start)).toBe(
      false,
    );
    expect(hasCourseAccess([grant], 'aluno-a', 'python', start)).toBe(false);
    expect(hasCourseAccess([], 'aluno-a', 'robotica-basico', start)).toBe(
      false,
    );
    expect(
      hasCourseAccess(
        [{ ...grant, starts_at: 'inválida' }],
        'aluno-a',
        'robotica-basico',
        start,
      ),
    ).toBe(false);
    expect(
      hasCourseAccess(
        [{ ...grant, expires_at: 'inválida' }],
        'aluno-a',
        'robotica-basico',
        start,
      ),
    ).toBe(false);
  });
  it('permite concessão sem vencimento após o início', () => {
    expect(
      hasCourseAccess(
        [{ ...grant, expires_at: null }],
        'aluno-a',
        'robotica-basico',
        start + 100000,
      ),
    ).toBe(true);
  });
});
describe('progresso a partir da configuração', () => {
  const course = {
    id: 'robotica-basico',
    lessonIds: ['aula-1', 'aula-2', 'aula-3'],
  };
  it('não conta aulas removidas, duplicadas ou pertencentes a outro curso', () => {
    const result = calculateProgress(course, [
      { course_id: course.id, lesson_id: 'aula-1', completed: true },
      { course_id: course.id, lesson_id: 'aula-1', completed: true },
      { course_id: course.id, lesson_id: 'removida', completed: true },
      { course_id: 'outro', lesson_id: 'aula-2', completed: true },
      { course_id: course.id, lesson_id: 'aula-2', completed: false },
    ]);
    expect(result).toEqual({
      completed: 1,
      total: 3,
      percent: 33,
      nextLessonId: 'aula-2',
    });
  });
  it('retoma a primeira pendente e retorna à primeira após completar o curso', () => {
    expect(calculateProgress(course, []).nextLessonId).toBe('aula-1');
    expect(
      calculateProgress(
        course,
        course.lessonIds.map((lesson_id) => ({
          course_id: course.id,
          lesson_id,
          completed: true,
        })),
      ),
    ).toEqual({ completed: 3, total: 3, percent: 100, nextLessonId: 'aula-1' });
  });
});
