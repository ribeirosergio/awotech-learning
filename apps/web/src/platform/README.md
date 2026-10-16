# Plataforma do aluno

`StudentApp.tsx` monta o layout autenticado. `CourseGuard.tsx` valida o entitlement antes de carregar `CourseLearning.tsx`. `content.ts` carrega o conteúdo completo e `LessonMaterial.tsx` apresenta Markdown, imagens, exercícios e componentes. Esses módulos são carregados sob demanda na área do aluno; o site público utiliza seu catálogo de prévias.

O material original fica em `content/robotica/*/{lesson.json,content.md,assets/}`. A prévia pública usa somente `course.json` e `preview.json`, com um parágrafo e vídeo de apresentação. Cada aula real possui vídeo independente em `lesson.json`. Temporariamente, as dez aulas usam `hcuA5wkgUNA` com `isPlaceholder: true`, por solicitação do responsável; substitua cada ID pelo vídeo completo correspondente quando disponível.

`StudentProvider.tsx` carrega concessões, progresso e evidências do usuário atual, usando o horário do banco para vigência. As gravações de evidências são serializadas e vinculadas ao usuário da sessão que iniciou o relato. `TrackedLessonVideo.tsx` mede intervalos de reprodução pela API oficial do YouTube. `useActivityEvidence.ts` registra as práticas aprovadas pelo simulador. `CourseLearning.tsx` exibe o checklist e só permite novas conclusões com requisitos satisfeitos, também exigidos pelo trigger no banco.

`CodePractice.tsx` integra Monaco e rascunhos locais nas aulas ainda sem runtime; os labs disponíveis são carregados sob demanda. Consulte `docs/plataforma-supabase.md` e `docs/requisitos-conclusao.md` para Cloud, RLS e limites dos relatos client-side. O conteúdo continua estático no build; RLS protege os dados do aluno, não constitui DRM para os assets.
