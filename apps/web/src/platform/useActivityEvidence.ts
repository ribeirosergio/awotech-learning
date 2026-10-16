import { useEffect, useRef, useState } from 'react';
import type { LessonDefinition } from '@awotech/content-types';
import { useStudent } from './StudentProvider';

export function useActivityEvidence(
  lesson: LessonDefinition,
  activity: string,
  passed: boolean,
) {
  const { recordEvidence, evidence } = useStudent();
  const sent = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const saved = evidence.some(
    (e) =>
      e.course_id === lesson.courseId &&
      e.lesson_id === lesson.id &&
      e.activities.includes(activity),
  );
  useEffect(() => {
    if (!passed || saved || sent.current) return;
    sent.current = true;
    void recordEvidence(lesson.courseId, lesson.id, { activity })
      .then(() => setError(''))
      .catch(() => {
        sent.current = false;
        setError(
          'A atividade passou, mas não foi possível salvar a aprovação.',
        );
      });
  }, [
    activity,
    lesson.courseId,
    lesson.id,
    passed,
    saved,
    recordEvidence,
    attempt,
  ]);
  return { error, retry: () => setAttempt((v) => v + 1) };
}
