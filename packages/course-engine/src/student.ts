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

/** Conta somente aulas que ainda pertencem à configuração atual do curso. */
export function calculateProgress(
  course: { id: string; lessonIds: string[] },
  records: ProgressRecord[],
) {
  const completedIds = new Set(
    records
      .filter((row) => row.course_id === course.id && row.completed)
      .map((row) => row.lesson_id),
  );
  const completed = course.lessonIds.filter((id) =>
    completedIds.has(id),
  ).length;
  const total = course.lessonIds.length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    nextLessonId:
      course.lessonIds.find((id) => !completedIds.has(id)) ??
      course.lessonIds[0],
  };
}
