import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createCourseCatalog,
  createPreviewCatalog,
  type ContentInput,
} from '../packages/course-engine/src';
import {
  lessonPreviewSchema,
  productSchema,
} from '../packages/content-types/src';

const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(resolve(path), 'utf8'));

function repositoryContent(): ContentInput {
  const folders = readdirSync('content/robotica', {
    withFileTypes: true,
  }).filter((item) => item.isDirectory());
  return {
    courses: [readJson('content/robotica/course.json')],
    lessons: folders.map((folder) => ({
      definition: readJson(`content/robotica/${folder.name}/lesson.json`),
      markdown: readFileSync(
        `content/robotica/${folder.name}/content.md`,
        'utf8',
      ),
    })),
    components: readJson('content/components/catalog.json') as unknown[],
  };
}

describe('conteúdo real da apostila', () => {
  it('mantém as prévias alinhadas às aulas sem expor o material integral', () => {
    const input = repositoryContent();
    const lessons = readdirSync('content/robotica', { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((folder) =>
        readJson(`content/robotica/${folder.name}/preview.json`),
      );
    const previews = createPreviewCatalog({ courses: input.courses, lessons });
    const full = createCourseCatalog(input);
    for (const preview of previews.listLessons('robotica-basico')) {
      const original = full.getLesson(preview.courseId, preview.id)!.definition;
      expect(preview.title).toBe(original.title);
      expect(preview.order).toBe(original.order);
      expect(preview).not.toHaveProperty('activities');
      expect(preview).not.toHaveProperty('markdown');
      expect(preview.video?.videoId).toBe('hcuA5wkgUNA');
    }
    const first = previews.listLessons('robotica-basico')[0]!;
    expect(previews.getLesson('outro-curso', first.id)).toBeUndefined();
    expect(
      previews.getNavigation(first.courseId, first.id).previous,
    ).toBeUndefined();
    expect(() =>
      createPreviewCatalog({
        courses: input.courses,
        lessons: lessons.slice(1),
      }),
    ).toThrow('Referência de prévia inválida');
  });

  it('rejeita material integral inserido por engano em um arquivo de prévia', () => {
    const full = repositoryContent().lessons[0]!.definition;
    expect(lessonPreviewSchema.safeParse(full).success).toBe(false);
  });

  it('resolve as imagens locais referenciadas no Markdown e exige descrição acessível', () => {
    const folders = readdirSync('content/robotica', {
      withFileTypes: true,
    }).filter((item) => item.isDirectory());
    for (const folder of folders) {
      const base = `content/robotica/${folder.name}`;
      const markdown = readFileSync(`${base}/content.md`, 'utf8');
      for (const match of markdown.matchAll(
        /!\[([^\]]*)\]\((\.\/assets\/[^\s)]+)(?:\s+"[^"]*")?\)/g,
      )) {
        expect(match[1]?.trim(), `Descrição ausente: ${match[2]}`).toBeTruthy();
        expect(
          existsSync(resolve(base, match[2]!)),
          `Imagem ausente: ${base}/${match[2]}`,
        ).toBe(true);
      }
    }
  });

  it('carrega as dez aulas em ordem, com Markdown e componentes válidos', () => {
    const catalog = createCourseCatalog(repositoryContent());
    const lessons = catalog.listLessons('robotica-basico');
    expect(lessons.map((lesson) => lesson.order)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(
      lessons.slice(7).every((lesson) => lesson.contentStatus === 'outline'),
    ).toBe(true);
    // As aulas reais possuem seu próprio vídeo configurado em lesson.json.
    expect(lessons.every((lesson) => Boolean(lesson.video))).toBe(true);
    expect(catalog.getCourse('robotica-basico')?.productId).toBe(
      'robotica-basico',
    );
    for (const course of catalog.listCourses())
      expect(course.productId).toBe(course.id);
    const products = readJson('content/products/catalog.json') as unknown[];
    for (const raw of products) {
      const product = productSchema.parse(raw);
      expect(product.active).toBe(false);
      for (const id of product.courseIds)
        expect(catalog.getCourse(id)).toBeDefined();
    }
  });

  it('navega entre aulas sem atravessar os limites do curso', () => {
    const catalog = createCourseCatalog(repositoryContent());
    const lessons = catalog.listLessons('robotica-basico');
    const first = lessons[0]!;
    const last = lessons[lessons.length - 1]!;
    expect(catalog.getNavigation(first.courseId, first.id)).toEqual({
      previous: undefined,
      next: lessons[1]!.id,
    });
    expect(catalog.getNavigation(last.courseId, last.id)).toEqual({
      previous: lessons[8]!.id,
      next: undefined,
    });
    expect(catalog.getNavigation(first.courseId, 'nao-existe')).toEqual({
      previous: undefined,
      next: undefined,
    });
    expect(catalog.getLesson('outro-curso', first.id)).toBeUndefined();
    expect(catalog.listLessons('nao-existe')).toEqual([]);
  });

  it('rejeita aula referenciada sem arquivo', () => {
    const input = repositoryContent();
    input.lessons.pop();
    expect(() => createCourseCatalog(input)).toThrow(
      'Referência de aula inválida',
    );
  });

  it('rejeita IDs duplicados', () => {
    const input = repositoryContent();
    input.lessons.push(input.lessons[0]!);
    expect(() => createCourseCatalog(input)).toThrow('ID duplicado (Aula)');
  });

  it('rejeita aula sem texto', () => {
    const input = repositoryContent();
    input.lessons[0]!.markdown = undefined;
    expect(() => createCourseCatalog(input)).toThrow('Texto ausente');
  });

  it('rejeita referência a componente fora do catálogo', () => {
    const input = repositoryContent();
    input.components = [];
    expect(() => createCourseCatalog(input)).toThrow('Componente desconhecido');
  });

  it('rejeita alteração acidental da ordem pedagógica', () => {
    const input = repositoryContent();
    const course = input.courses[0] as { lessonIds: string[] };
    course.lessonIds.reverse();
    expect(() => createCourseCatalog(input)).toThrow('Ordem de aula inválida');
  });
});
