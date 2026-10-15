import {
  componentCatalogItemSchema,
  courseSchema,
  lessonSchema,
  lessonPreviewSchema,
  type ComponentCatalogItem,
  type CourseDefinition,
  type LessonDefinition,
  type LessonPreview,
} from '@awotech/content-types';

export { hasCourseAccess, calculateProgress } from './student';

export interface LessonContent {
  definition: LessonDefinition;
  markdown: string;
}

export interface ContentInput {
  courses: unknown[];
  lessons: { definition: unknown; markdown: string | undefined }[];
  components: unknown[];
}

function uniqueIndex<T>(items: T[], key: (item: T) => string, label: string) {
  const result = new Map<string, T>();
  for (const item of items) {
    const value = key(item);
    if (result.has(value)) throw new Error(`ID duplicado (${label}): ${value}`);
    result.set(value, item);
  }
  return result;
}

/** Catálogo público independente dos arquivos do material integral. */
export function createPreviewCatalog(input: {
  courses: unknown[];
  lessons: unknown[];
}) {
  const courses = uniqueIndex(
    input.courses.map((item) => courseSchema.parse(item)),
    (item) => item.id,
    'Curso',
  );
  const lessons = uniqueIndex(
    input.lessons.map((item) => lessonPreviewSchema.parse(item)),
    (item) => item.id,
    'Prévia',
  );
  for (const course of courses.values()) {
    if (new Set(course.lessonIds).size !== course.lessonIds.length)
      throw new Error(`Aula repetida na sequência: ${course.id}`);
    course.lessonIds.forEach((id, index) => {
      const lesson = lessons.get(id);
      if (!lesson || lesson.courseId !== course.id)
        throw new Error(`Referência de prévia inválida: ${id}`);
      if (lesson.order !== index + 1)
        throw new Error(`Ordem de prévia inválida: ${id}`);
    });
  }
  for (const lesson of lessons.values()) {
    if (!courses.get(lesson.courseId)?.lessonIds.includes(lesson.id))
      throw new Error(`Prévia sem curso correspondente: ${lesson.id}`);
  }
  return {
    listCourses: () => [...courses.values()],
    getCourse: (courseId: string) => courses.get(courseId),
    listLessons: (courseId: string): LessonPreview[] =>
      (courses.get(courseId)?.lessonIds ?? []).map((id) => lessons.get(id)!),
    getLesson(courseId: string, lessonId: string) {
      const lesson = lessons.get(lessonId);
      return lesson?.courseId === courseId ? lesson : undefined;
    },
    getNavigation(courseId: string, lessonId: string) {
      const ids = courses.get(courseId)?.lessonIds ?? [];
      const index = ids.indexOf(lessonId);
      return index < 0
        ? { previous: undefined, next: undefined }
        : { previous: ids[index - 1], next: ids[index + 1] };
    },
  };
}

/** Valida conteúdo na entrada; não conhece React, Vite ou o sistema de arquivos. */
export function createCourseCatalog(input: ContentInput) {
  const courses = uniqueIndex(
    input.courses.map((item) => courseSchema.parse(item)),
    (item) => item.id,
    'Curso',
  );
  const components = uniqueIndex(
    input.components.map((item) => componentCatalogItemSchema.parse(item)),
    (item) => item.sku,
    'Componente',
  );
  const lessons = uniqueIndex(
    input.lessons.map(({ definition, markdown }) => {
      const lesson = lessonSchema.parse(definition);
      if (!markdown?.trim()) throw new Error(`Texto ausente: ${lesson.id}`);
      return { definition: lesson, markdown };
    }),
    (item) => item.definition.id,
    'Aula',
  );

  for (const course of courses.values()) {
    if (new Set(course.lessonIds).size !== course.lessonIds.length) {
      throw new Error(`Aula repetida na sequência: ${course.id}`);
    }
    course.lessonIds.forEach((lessonId, index) => {
      const lesson = lessons.get(lessonId)?.definition;
      if (!lesson || lesson.courseId !== course.id)
        throw new Error(`Referência de aula inválida: ${lessonId}`);
      if (lesson.order !== index + 1)
        throw new Error(`Ordem de aula inválida: ${lessonId}`);
    });
  }
  for (const { definition: lesson } of lessons.values()) {
    if (!courses.get(lesson.courseId)?.lessonIds.includes(lesson.id)) {
      throw new Error(`Aula sem curso correspondente: ${lesson.id}`);
    }
    for (const sku of lesson.requiredComponents) {
      if (!components.has(sku))
        throw new Error(`Componente desconhecido em ${lesson.id}: ${sku}`);
    }
  }

  function getLesson(
    courseId: string,
    lessonId: string,
  ): LessonContent | undefined {
    const lesson = lessons.get(lessonId);
    return lesson?.definition.courseId === courseId ? lesson : undefined;
  }

  return {
    listCourses: (): CourseDefinition[] => [...courses.values()],
    getCourse: (courseId: string) => courses.get(courseId),
    getLesson,
    listLessons: (courseId: string): LessonDefinition[] =>
      (courses.get(courseId)?.lessonIds ?? []).map(
        (lessonId) => lessons.get(lessonId)!.definition,
      ),
    getComponent: (sku: string): ComponentCatalogItem | undefined =>
      components.get(sku),
    getNavigation(courseId: string, lessonId: string) {
      const ids = courses.get(courseId)?.lessonIds ?? [];
      const index = ids.indexOf(lessonId);
      if (index === -1) return { previous: undefined, next: undefined };
      return { previous: ids[index - 1], next: ids[index + 1] };
    },
  };
}
