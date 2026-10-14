import type { PropsWithChildren } from 'react';

export function Badge({ children }: PropsWithChildren) {
  return (
    <span className="inline-flex rounded-full border border-current/20 px-3 py-1 text-xs font-semibold tracking-wide">
      {children}
    </span>
  );
}

export function YouTubeVideo({
  videoId,
  title,
  isPlaceholder = false,
  purpose = 'lesson',
}: {
  videoId: string;
  title: string;
  isPlaceholder?: boolean;
  purpose?: 'preview' | 'lesson';
}) {
  return (
    <figure className="lesson-video">
      <iframe
        className="aspect-video w-full rounded-2xl border-0"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
        title={`${purpose === 'preview' ? 'Prévia em vídeo' : 'Videoaula'}: ${title}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <figcaption>
        {isPlaceholder && (
          <p>
            <strong>Vídeo temporário.</strong>{' '}
            {purpose === 'preview'
              ? 'Este vídeo será substituído pela apresentação desta aula.'
              : 'Este vídeo ocupa o espaço da futura videoaula e não corresponde ao conteúdo desta aula.'}
          </p>
        )}
        <a
          href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir vídeo no YouTube <span className="sr-only">(nova aba)</span> ↗
        </a>
      </figcaption>
    </figure>
  );
}
