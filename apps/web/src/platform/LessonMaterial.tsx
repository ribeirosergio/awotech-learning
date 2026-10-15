import { lazy, Suspense } from 'react';
import type { LessonContent } from '@awotech/course-engine';
import { Badge, YouTubeVideo } from '@awotech/ui';
import { catalog, resolveLessonImage } from './content';

const Markdown = lazy(() => import('react-markdown'));

/** Material integral utilizado somente após autenticação e verificação de acesso. */
export function LessonMaterial({ lesson }: { lesson: LessonContent }) {
  const { definition, markdown } = lesson;
  return (
    <>
      {definition.video && (
        <YouTubeVideo
          key={definition.id}
          videoId={definition.video.videoId}
          title={definition.title}
          isPlaceholder={definition.video.isPlaceholder}
        />
      )}
      <div className="prose">
        <Suspense
          fallback={<p role="status">Carregando o conteúdo da aula…</p>}
        >
          <Markdown
            components={{
              img: ({ src, alt, title }) => {
                const imageUrl = resolveLessonImage(definition.id, src ?? '');
                if (!imageUrl)
                  return <span>{alt ?? 'Imagem indisponível'}</span>;
                return (
                  <span
                    className="lesson-image"
                    role="figure"
                    aria-label={title ?? alt}
                  >
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ampliar imagem: ${alt ?? title ?? 'ilustração da aula'} (abre em nova aba)`}
                    >
                      <img
                        src={imageUrl}
                        alt={alt ?? ''}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                    {title && <span className="image-caption">{title}</span>}
                    <span className="image-hint">
                      Selecione a imagem para ampliar.
                    </span>
                  </span>
                );
              },
            }}
          >
            {markdown}
          </Markdown>
        </Suspense>
      </div>
      {definition.objectives.length > 0 && (
        <section className="lesson-section">
          <h2>O que você vai explorar</h2>
          <ul>
            {definition.objectives.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {definition.activities.length > 0 && !definition.activitiesInContent && (
        <section className="lesson-section">
          <h2>Atividades da aula</h2>
          <ol>
            {definition.activities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      )}
      {definition.requiredComponents.length > 0 && (
        <section className="lesson-section">
          <h2>Componentes apresentados</h2>
          <div className="component-tags">
            {definition.requiredComponents.map((sku) => (
              <Badge key={sku}>{catalog.getComponent(sku)!.name}</Badge>
            ))}
          </div>
          <p className="muted">
            Referência do material didático. A lista final do kit será definida
            após a revisão dos projetos.
          </p>
        </section>
      )}
      {definition.hasLab && (
        <div className="lab-notice">
          <span aria-hidden="true">⌘</span>
          <div>
            <h2>Atividade prática · AWOTech Lab</h2>
            <p>Laboratório disponível em breve.</p>
          </div>
        </div>
      )}
    </>
  );
}
