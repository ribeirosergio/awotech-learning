import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          setMenuOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <Link
        className="brand"
        to="/"
        aria-label="AWOTech Learning, início"
        onClick={() => setMenuOpen(false)}
      >
        <span className="brand-icon" aria-hidden="true">
          a<span>↗</span>
        </span>
        <span>
          AWOTech <small>LEARNING</small>
        </span>
      </Link>
      <button
        ref={toggle}
        className="site-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="public-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        {menuOpen ? 'Fechar' : 'Menu'}
      </button>
      <nav
        id="public-navigation"
        className={menuOpen ? 'is-open' : ''}
        aria-label="Navegação principal"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) setMenuOpen(false);
        }}
      >
        <Link to="/#cursos">Cursos</Link>
        <Link to="/#quem-somos">Quem somos</Link>
        <Link to="/#como-funciona">Como funciona</Link>
        <Link to="/#contato">Contato</Link>
        <Link className="student-nav-link" to="/app">
          Área do aluno <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </header>
  );
}
