# Plataforma do aluno

`StudentApp.tsx` monta o layout autenticado. `CourseGuard.tsx` valida o entitlement antes de carregar `CourseLearning.tsx`. `content.ts` carrega o conteúdo completo e `LessonMaterial.tsx` apresenta Markdown, imagens, exercícios e componentes. Esses módulos são carregados sob demanda na área do aluno; o site público utiliza seu catálogo de prévias.

O material original fica em `content/robotica/*/{lesson.json,content.md,assets/}`. A prévia pública usa somente `course.json` e `preview.json`, com um parágrafo e vídeo de apresentação. Cada aula real possui vídeo independente em `lesson.json`. Temporariamente, as dez aulas usam `hcuA5wkgUNA` com `isPlaceholder: true`, por solicitação do responsável; substitua cada ID pelo vídeo completo correspondente quando disponível.

`StudentProvider.tsx` carrega concessões e progresso do usuário atual, usando o horário do banco para vigência. `CodePractice.tsx` integra o Monaco e rascunhos locais por usuário/aula, sem execução. Consulte `docs/plataforma-supabase.md` para configuração do Cloud, RLS, acesso manual e testes. O conteúdo continua estático no build, conforme o trade-off do handoff; RLS protege os dados do aluno, não constitui DRM para os assets.
