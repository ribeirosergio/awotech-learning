import { z } from 'zod';

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sourceSchema = z.object({
  file: z.string().min(1),
  section: z.string().min(1),
});

export const courseSchema = z.object({
  id,
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['draft', 'published']),
  lessonIds: z.array(id).min(1),
  source: sourceSchema,
});

export const lessonSchema = z.object({
  id,
  courseId: id,
  title: z.string().min(1),
  order: z.number().int().positive(),
  summary: z.string().min(1),
  contentStatus: z.enum(['draft', 'outline', 'published']),
  objectives: z.array(z.string().min(1)),
  activities: z.array(z.string().min(1)),
  activitiesInContent: z.boolean().optional(),
  requiredComponents: z.array(id),
  labStatus: z.enum(['not-applicable', 'planned']),
  video: z
    .object({
      provider: z.literal('youtube'),
      videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
      isPlaceholder: z.boolean().optional(),
    })
    .optional(),
  source: sourceSchema,
});

/** Contrato público sem exercícios, texto integral ou imagens da aula. */
export const lessonPreviewSchema = lessonSchema
  .pick({
    id: true,
    courseId: true,
    title: true,
    order: true,
    summary: true,
    contentStatus: true,
    video: true,
  })
  .strict();

export type LessonPreview = z.infer<typeof lessonPreviewSchema>;

export const componentCatalogItemSchema = z.object({
  sku: id,
  name: z.string().min(1),
  category: z.enum([
    'controller',
    'connection',
    'output',
    'input',
    'passive',
    'power',
    'driver',
  ]),
  notes: z.string().min(1),
});

export const productSchema = z.object({
  id,
  type: z.enum(['course', 'course_with_kit', 'kit', 'subscription']),
  name: z.string().min(1),
  courseIds: z.array(id),
  kitId: id.optional(),
  accessMonths: z.number().int().positive().optional(),
  active: z.boolean(),
});

export const kitSchema = z.object({
  id,
  name: z.string().min(1),
  courseId: id,
  version: z.string().min(1),
  components: z
    .array(
      z.object({
        sku: id,
        quantity: z.number().int().positive(),
        optional: z.boolean().optional(),
        notes: z.string().optional(),
      }),
    )
    .min(1),
});

export type CourseDefinition = z.infer<typeof courseSchema>;
export type LessonDefinition = z.infer<typeof lessonSchema>;
export type ComponentCatalogItem = z.infer<typeof componentCatalogItemSchema>;
export type ProductDefinition = z.infer<typeof productSchema>;
export type KitDefinition = z.infer<typeof kitSchema>;
