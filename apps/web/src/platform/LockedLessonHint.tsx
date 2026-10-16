import {
  useEffect,
  useId,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { createPortal } from 'react-dom';

function hintPosition(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  return {
    left: Math.max(16, Math.min(rect.left, window.innerWidth - 276)),
    top:
      rect.bottom + 80 < window.innerHeight
        ? rect.bottom + 8
        : Math.max(8, rect.top - 76),
  };
}

export default function LockedLessonHint({
  children,
  className,
  as: Element = 'span',
}: PropsWithChildren<{ className: string; as?: 'span' | 'div' }>) {
  const id = useId();
  const anchor = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  function show(target: HTMLElement) {
    anchor.current = target;
    setPosition(hintPosition(target));
  }
  useEffect(() => {
    if (!position) return;
    const reposition = () =>
      setPosition(
        anchor.current === document.activeElement && anchor.current
          ? hintPosition(anchor.current)
          : null,
      );
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [position]);
  return (
    <>
      <Element
        className={className}
        tabIndex={0}
        aria-disabled="true"
        aria-describedby={id}
        onMouseEnter={(event) => show(event.currentTarget)}
        onMouseLeave={(event) => {
          if (event.currentTarget !== document.activeElement) setPosition(null);
        }}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setPosition(null)}
        onClick={(event) => show(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            setPosition(null);
          }
        }}
      >
        {children}
      </Element>
      {createPortal(
        <span
          id={id}
          role="tooltip"
          className="locked-lesson-tooltip"
          hidden={!position}
          style={position ?? undefined}
        >
          Conclua as aulas anteriores para liberar esta aula.
        </span>,
        document.body,
      )}
    </>
  );
}
