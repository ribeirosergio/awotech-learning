import { lazy, Suspense, useState } from 'react';
import type { LessonDefinition } from '@awotech/content-types';

const CodeEditor = lazy(() => import('../components/CodeEditor'));

export default function CodePractice({
  lesson,
  userId,
}: {
  lesson: LessonDefinition;
  userId: string;
}) {
  const config = lesson.code;
  const key = `awotech:workspace:${userId}:${lesson.courseId}:${lesson.id}:code`;
  const [storageError, setStorageError] = useState(false);
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? config?.starterCode ?? '';
    } catch {
      return config?.starterCode ?? '';
    }
  });
  if (!config) return null;
  function change(next: string) {
    setValue(next);
    try {
      localStorage.setItem(key, next);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  return (
    <section className="practice-section" aria-label="Prática de código">
      <h2>Seu espaço de código</h2>
      <p>
        Escreva e organize suas ideias. O editor está disponível para edição; a
        execução fará parte do AWOTech Lab.
      </p>
      <Suspense fallback={<p role="status">Carregando o editor…</p>}>
        <CodeEditor
          value={value}
          onChange={change}
          language={config.language}
          height={360}
          readOnly={false}
        />
      </Suspense>
      <p className="muted" role="status">
        {storageError
          ? 'Não foi possível salvar o rascunho neste navegador. Copie seu código antes de sair.'
          : 'Rascunho salvo somente neste navegador, separado por aluno e aula.'}
      </p>
    </section>
  );
}
