import { createPreviewCatalog } from '@awotech/course-engine';
const courses = import.meta.glob('../../../content/*/course.json', {
  eager: true,
  import: 'default',
});
const lessons = import.meta.glob('../../../content/*/*/preview.json', {
  eager: true,
  import: 'default',
});
// A entrada pública não importa lesson.json, content.md nem assets das aulas.
export const catalog = createPreviewCatalog({
  courses: Object.values(courses),
  lessons: Object.values(lessons),
});
