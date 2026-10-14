# Material reservado para a plataforma

`content.ts` carrega o conteúdo completo e `LessonMaterial.tsx` apresenta Markdown, imagens, exercícios e componentes. Esses módulos estão preservados, mas não são importados pelas rotas públicas.

O material original fica em `content/robotica/*/{lesson.json,content.md,assets/}`. A prévia pública usa somente `course.json` e `preview.json`, com resumo e vídeo de apresentação. Não conectar este renderer a uma rota pública; integrar a futura área do aluno após implementar autenticação e verificação de acesso.

`preview.json.video` é independente de `lesson.json.video`. Atualizar um trailer não substitui a videoaula completa. A separação atual evita incluir material integral no build público; não implementa ainda autenticação ou proteção da futura plataforma.
