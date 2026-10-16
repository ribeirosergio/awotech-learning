import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  calculateProgress,
  hasCourseAccess,
  getLessonProgression,
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
  const done = (...ids: string[]) =>
    ids.map((lesson_id) => ({
      course_id: course.id,
      lesson_id,
      completed: true,
    }));
  it('libera apenas a primeira aula antes de começar', () => {
    const state = getLessonProgression(course, []);
    expect([...state.unlockedIds]).toEqual(['aula-1']);
    expect(state.completedIds.size).toBe(0);
    expect(state.reopenableLessonId).toBeUndefined();
  });
  it('libera a próxima aula e mantém as anteriores para revisão', () => {
    const state = getLessonProgression(course, done('aula-1', 'aula-2'));
    expect([...state.unlockedIds]).toEqual(course.lessonIds);
    expect([...state.completedIds]).toEqual(['aula-1', 'aula-2']);
    expect(state.reopenableLessonId).toBe('aula-2');
    expect(state.nextLessonId).toBe('aula-3');
  });
  it('preserva registros antigos sem liberar aulas após uma lacuna', () => {
    const records = done('aula-3');
    expect(getLessonProgression(course, records).completed).toBe(0);
    expect([...getLessonProgression(course, records).unlockedIds]).toEqual([
      'aula-1',
    ]);
    expect(
      calculateProgress(course, [...records, ...done('aula-1')]).percent,
    ).toBe(33);
    expect(
      getLessonProgression(course, [...records, ...done('aula-1', 'aula-2')])
        .completed,
    ).toBe(3);
    expect(records).toEqual(done('aula-3'));
  });
  it('volta a bloquear as seguintes ao reabrir a última conclusão', () => {
    const records = [
      ...done('aula-1'),
      { course_id: course.id, lesson_id: 'aula-2', completed: false },
    ];
    const state = getLessonProgression(course, records);
    expect([...state.unlockedIds]).toEqual(['aula-1', 'aula-2']);
    expect(state.reopenableLessonId).toBe('aula-1');
  });
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

it('mantém a sequência de autorização SQL alinhada à configuração do curso', () => {
  const course = JSON.parse(
    readFileSync('content/robotica/course.json', 'utf8'),
  );
  const migration = readFileSync(
    'supabase/migrations/202610150001_sequential_lessons.sql',
    'utf8',
  );
  const definition = migration.split('$sequence$')[1] ?? '';
  expect(
    [...definition.matchAll(/'([^']+)'/g)].map((match) => match[1]),
  ).toEqual([course.id, ...course.lessonIds]);
});
