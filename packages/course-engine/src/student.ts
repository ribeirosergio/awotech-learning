export interface AccessGrant {
  user_id: string;
  product_id: string;
  starts_at: string;
  expires_at: string | null;
}

export interface ProgressRecord {
  course_id: string;
  lesson_id: string;
  completed: boolean;
}

export function hasCourseAccess(
  grants: AccessGrant[],
  userId: string,
  productId: string,
  now: number,
) {
  return grants.some(
    (grant) =>
      grant.user_id === userId &&
      grant.product_id === productId &&
      Date.parse(grant.starts_at) <= now &&
      (grant.expires_at === null || Date.parse(grant.expires_at) > now),
  );
}

/** Somente o trecho contínuo concluído libera aulas; registros após lacunas são preservados. */
export function getLessonProgression(
  course: { id: string; lessonIds: string[] },
  records: ProgressRecord[],
) {
  const completedIds = new Set(
    records
      .filter((row) => row.course_id === course.id && row.completed)
      .map((row) => row.lesson_id),
  );
  let completed = 0;
  for (const id of course.lessonIds) {
    if (!completedIds.has(id)) break;
    completed++;
  }
  return {
    completedIds: new Set(course.lessonIds.slice(0, completed)),
    unlockedIds: new Set(course.lessonIds.slice(0, completed + 1)),
    reopenableLessonId: course.lessonIds[completed - 1],
    completed,
    nextLessonId: course.lessonIds[completed] ?? course.lessonIds[0],
  };
}

export function calculateProgress(
  course: { id: string; lessonIds: string[] },
  records: ProgressRecord[],
) {
  const { completed, nextLessonId } = getLessonProgression(course, records);
  const total = course.lessonIds.length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    nextLessonId,
  };
}
