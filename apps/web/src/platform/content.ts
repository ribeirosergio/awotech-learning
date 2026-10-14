import { createCourseCatalog } from '@awotech/course-engine';
import type { LessonDefinition } from '@awotech/content-types';
import components from '../../../../content/components/catalog.json';

const courses = import.meta.glob('../../../../content/*/course.json', {
  eager: true,
  import: 'default',
});
const lessons = import.meta.glob<LessonDefinition>(
  '../../../../content/*/*/lesson.json',
  {
    eager: true,
    import: 'default',
  },
);

const images = import.meta.glob<string>(
  '../../../../content/*/*/assets/*.{png,jpg,jpeg,webp,svg}',
  { eager: true, query: '?url', import: 'default' },
);

const lessonDirectories = new Map(
  Object.entries(lessons).map(([path, lesson]) => [
    lesson.id,
    path.replace(/\/lesson\.json$/, ''),
  ]),
);

/** Resolve somente imagens versionadas ao lado do Markdown da própria aula. */
export function resolveLessonImage(lessonId: string, source: string) {
  return images[
    `${lessonDirectories.get(lessonId)}/${source.replace(/^\.\//, '')}`
  ];
}
const markdown = import.meta.glob<string>(
  '../../../../content/*/*/content.md',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
);

export const catalog = createCourseCatalog({
  courses: Object.values(courses),
  lessons: Object.entries(lessons).map(([path, definition]) => ({
    definition,
    markdown: markdown[path.replace(/lesson\.json$/, 'content.md')],
  })),
  components,
});
