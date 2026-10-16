import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalog } from '../content';
import teacherPhoto from '../../../../content/images/sergio-ribeiro.jpg';

// Preencher com os dados públicos aprovados pela equipe, sem usar dados de contas.
const team = {
  name: 'Sérgio Ribeiro',
  bio: 'Engenheiro de Software, especialista em programação e robótica.',
  email: 'sergioribeiro.sjr@gmail.com',
  phone: '(24) 99902-1787',
  whatsapp: '5524999021787',
};

const projects = [
  {
    title: 'Pequeno circuito. Grande descoberta.',
    label: '01 / ELETRÔNICA',
    text: 'Uma fonte, um resistor e um LED. Descubra como uma conexão transforma energia em luz.',
    kind: 'circuit',
    color: '#d4f477',
  },
  {
    title: 'Sua lógica ganha movimento.',
    label: '02 / PROGRAMAÇÃO',
    text: 'Organize instruções, explore repetições e entenda como o código controla um projeto.',
    kind: 'code',
    color: '#c5b5f4',
  },
  {
    title: 'O primeiro robô começa com uma ideia.',
    label: '03 / ROBÓTICA',
    text: 'Conheça a trilha que conecta circuitos, sensores e motores ao projeto de um robô autônomo.',
    kind: 'robot',
    color: '#ffb58c',
  },
] as const;

function ProjectImage({ kind }: { kind: string }) {
  const gridId = useId();
  return (
    <svg
      viewBox="0 0 640 400"
      role="img"
      aria-label={
        kind === 'circuit'
          ? 'Ilustração de um circuito com placa, resistor e LED'
          : kind === 'code'
            ? 'Ilustração de código com um comando para acender um LED'
            : 'Ilustração de um robô de duas rodas com sensor frontal'
      }
    >
      <defs>
        <pattern
          id={gridId}
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.4" fill="#153d34" opacity=".17" />
        </pattern>
      </defs>
      <rect width="640" height="400" fill={`url(#${gridId})`} />
      <circle
        cx="320"
        cy="200"
        r="155"
        fill="none"
        stroke="#173e34"
        strokeOpacity=".12"
      />
      {kind === 'circuit' ? (
        <g>
          <path
            d="M270 130H455V190M270 290H455V235"
            fill="none"
            stroke="#163e35"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <rect
            x="115"
            y="80"
            width="180"
            height="250"
            rx="22"
            fill="#205c50"
            stroke="#12362e"
            strokeWidth="3"
          />
          <rect x="175" y="65" width="65" height="50" rx="6" fill="#e9eee5" />
          <rect x="165" y="160" width="80" height="100" rx="8" fill="#102e29" />
          {[135, 165, 195, 225, 255, 285].map((y) => (
            <g key={y}>
              <circle cx="132" cy={y} r="5" fill="#d4f477" />
              <circle cx="278" cy={y} r="5" fill="#d4f477" />
            </g>
          ))}
          <rect
            x="345"
            y="117"
            width="55"
            height="26"
            rx="7"
            fill="#f4dab0"
            stroke="#163e35"
            strokeWidth="3"
          />
          <path d="M360 119V141M380 119V141" stroke="#b76540" strokeWidth="5" />
          <circle cx="455" cy="205" r="62" fill="#fff" opacity=".3" />
          <path
            d="M425 222V195a30 30 0 0 1 60 0v27Z"
            fill="#ff784f"
            stroke="#163e35"
            strokeWidth="4"
          />
          <path d="M442 223V246M468 223V246" stroke="#163e35" strokeWidth="5" />
          <text
            x="180"
            y="217"
            fill="#d4f477"
            fontSize="27"
            fontFamily="monospace"
          >
            01
          </text>
        </g>
      ) : kind === 'code' ? (
        <g>
          <rect x="75" y="70" width="490" height="270" rx="20" fill="#173e34" />
          <path d="M75 120H565" stroke="#5e7c68" />
          {[100, 122, 144].map((x) => (
            <circle key={x} cx={x} cy="95" r="5" fill="#c5b5f4" />
          ))}
          <g fontFamily="monospace" fontSize="22" fill="#f5f5e9">
            <text x="110" y="165" fill="#c5b5f4">
              void loop() {'{'}
            </text>
            <text x="135" y="207">
              digitalWrite(13, HIGH);
            </text>
            <text x="135" y="249" fill="#d4f477">
              delay(1000);
            </text>
            <text x="110" y="291">
              {'}'}
            </text>
          </g>
        </g>
      ) : (
        <g stroke="#173e34" strokeWidth="4">
          <rect
            x="130"
            y="185"
            width="65"
            height="155"
            rx="24"
            fill="#173e34"
          />
          <rect
            x="445"
            y="185"
            width="65"
            height="155"
            rx="24"
            fill="#173e34"
          />
          <path d="M175 180L235 100H405L465 180V300H175Z" fill="#faf4de" />
          <rect
            x="220"
            y="135"
            width="200"
            height="85"
            rx="18"
            fill="#205c50"
          />
          <circle cx="270" cy="177" r="27" fill="#d4f477" />
          <circle cx="370" cy="177" r="27" fill="#d4f477" />
          <circle cx="270" cy="177" r="12" fill="#173e34" />
          <circle cx="370" cy="177" r="12" fill="#173e34" />
          <path d="M285 250H355M320 100V65" />
          <circle cx="320" cy="55" r="12" fill="#c5b5f4" />
        </g>
      )}
    </svg>
  );
}

function ProjectCarousel() {
  const [index, setIndex] = useState(0);
  const project = projects[index] ?? projects[0];
  return (
    <section
      className="project-carousel"
      aria-roledescription="carrossel"
      aria-label="Ideias para explorar na trilha"
    >
      <div className="project-art" style={{ background: project.color }}>
        <span className="project-tag">IDEIA → EXPERIMENTO</span>
        <ProjectImage kind={project.kind} />
        <span className="art-caption">Ilustração dos temas do curso</span>
      </div>
      <div className="project-caption" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">{project.label}</p>
        <h2>{project.title}</h2>
        <p>{project.text}</p>
      </div>
      <div className="carousel-controls">
        <div className="carousel-dots">
          {projects.map((item, position) => (
            <button
              key={item.kind}
              aria-label={`Mostrar imagem ${position + 1}: ${item.label}`}
              aria-pressed={index === position}
              onClick={() => setIndex(position)}
            />
          ))}
        </div>
        <span className="mono">0{index + 1} / 03</span>
        <div>
          <button
            aria-label="Imagem anterior"
            onClick={() =>
              setIndex((index + projects.length - 1) % projects.length)
            }
          >
            ←
          </button>
          <button
            aria-label="Próxima imagem"
            onClick={() => setIndex((index + 1) % projects.length)}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="public-landing">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> APRENDA. TESTE. FAÇA ACONTECER.
          </p>
          <h1>
            Uma ideia.
            <br />
            Infinitas
            <br />
            <em>possibilidades.</em>
          </h1>
          <p>
            Tire a curiosidade do papel. Explore a lógica, a eletrônica e a
            programação criando seus primeiros projetos de tecnologia.
          </p>
          <br />
          <p className="equipment-note">
            Tudo começa no navegador. Você não precisa comprar placas, sensores
            ou outros componentes para fazer o curso.
          </p>
          <div className="hero-actions">
            <a className="button button-lime" href="#cursos">
              Encontre seu começo <span aria-hidden="true">↗</span>
            </a>
            <a className="hero-secondary" href="#quem-somos">
              Conheça a AWOTech ↓
            </a>
          </div>
          <div className="hero-footnote">
            <span className="mono">DO ZERO À PRIMEIRA CONEXÃO</span>
            <span aria-hidden="true">✳</span>
          </div>
        </div>
        <ProjectCarousel />
      </section>
      <div className="topic-strip" aria-label="Temas de aprendizagem">
        <span>Lógica</span>
        <b aria-hidden="true">✳</b>
        <span>Eletrônica</span>
        <b aria-hidden="true">✳</b>
        <span>Programação</span>
        <b aria-hidden="true">✳</b>
        <span>Robótica</span>
        <b aria-hidden="true">✳</b>
        <span>Suas ideias</span>
      </div>
      <section id="cursos" className="landing-section">
        <div className="landing-heading">
          <div>
            <p className="eyebrow">01 / EXPLORE OS CURSOS</p>
            <h2>Seu próximo “eu consegui!” começa aqui.</h2>
          </div>
          <p>
            Uma trilha para conectar o que você aprende com o que você consegue
            criar.
          </p>
        </div>
        {catalog.listCourses().map((course) => (
          <article className="featured-course" key={course.id}>
            <div className="featured-art">
              <span className="pill">LÓGICA + ELETRÔNICA + CÓDIGO</span>
              <ProjectImage kind="robot" />
            </div>
            <div className="featured-copy">
              <p className="eyebrow">DO CONCEITO À CONSTRUÇÃO</p>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>
                <strong>Componentes físicos são opcionais.</strong> Aprenda com
                o laboratório virtual e, se quiser montar os projetos também na
                bancada, os componentes podem ser adquiridos à parte.
              </p>
              <div className="course-facts">
                <span>
                  <strong>{course.lessonIds.length}</strong> aulas na trilha
                </span>
                <span>
                  <strong>Na prática</strong> circuitos e programação
                </span>
              </div>
              <Link className="button" to={`/cursos/${course.id}`}>
                Conhecer as aulas <span aria-hidden="true">↗</span>
              </Link>
              <p className="course-note">
                Conheça as aulas e explore uma trilha que conecta conceitos,
                experimentos e projetos no AWOTech Lab.
              </p>
            </div>
          </article>
        ))}
      </section>
      <section id="quem-somos" className="landing-section about-section">
        <div>
          <p className="eyebrow">02 / QUEM SOMOS</p>
          <h2>
            Tecnologia não é só
            <br />
            para usar.
            <br />
            <em>É para criar.</em>
          </h2>
        </div>
        <div className="about-copy">
          <p>
            A AWOTech Learning é um espaço de aprendizagem para transformar
            curiosidade em projetos. Nosso ponto de partida é a robótica: um
            encontro entre raciocínio lógico, eletrônica e programação.
          </p>
          <p>
            A proposta é aprender um conceito, experimentar e entender o
            resultado. Do primeiro circuito ao primeiro robô, cada etapa abre
            caminho para a próxima descoberta.
          </p>
          <a className="text-link" href="#como-funciona">
            Conheça nosso jeito de aprender ↗
          </a>
        </div>
        <div id="professores" className="teacher-section">
          <figure className="teacher-photo">
            <img
              src={teacherPhoto}
              alt="Sérgio Ribeiro, professor da AWOTech Learning"
              width={900}
              height={1200}
              loading="lazy"
            />
            <figcaption>EDUCAÇÃO + TECNOLOGIA / AWOTECH</figcaption>
          </figure>
          <div>
            <p className="eyebrow">QUEM ENSINA</p>
            <h3>{team.name}</h3>
            <p>{team.bio}</p>
            <p>
              Conectar teoria e prática é o fio condutor das aulas: compreender
              os conceitos, experimentar e transformar ideias em projetos.
            </p>
            <Link className="text-link" to="/cursos/robotica-basico">
              Explore a proposta do curso ↗
            </Link>
          </div>
        </div>
      </section>
      <section id="como-funciona" className="landing-section">
        <div className="landing-heading">
          <div>
            <p className="eyebrow">03 / MENOS DISTÂNCIA ENTRE SABER E FAZER</p>
            <h2>Aprender é colocar em movimento.</h2>
          </div>
        </div>
        <div className="method-grid">
          {[
            {
              title: 'Entenda a ideia',
              text: 'Vídeos, textos e imagens apresentam os conceitos que você vai usar em cada etapa.',
              symbol: '01 / ↗',
            },
            {
              title: 'Experimente na prática',
              text: 'Monte circuitos no AWOTech Lab e observe o efeito de cada conexão.',
              symbol: '02 / ⚡',
            },
            {
              title: 'Construa seu caminho',
              text: 'Acompanhe seu progresso, conclua as atividades e avance pela trilha, uma descoberta de cada vez.',
              symbol: '03 / ✳',
            },
          ].map((item) => (
            <article key={item.title}>
              <span className="method-symbol">{item.symbol}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-section faq-section">
        <div>
          <p className="eyebrow">ANTES DE COMEÇAR</p>
          <h2>
            Curiosidade é<br />
            um ótimo começo.
          </h2>
        </div>
        <div>
          {[
            {
              q: 'Preciso conhecer programação?',
              a: 'A trilha começa pela introdução à robótica e pelo pensamento computacional, antes de avançar para circuitos e programação.',
            },
            {
              q: 'Como conheço as aulas?',
              a: 'A página do curso apresenta a sequência de aulas e suas prévias. Para estudar o conteúdo completo, você precisa de uma conta e de acesso liberado ao curso.',
            },
            {
              q: 'Preciso comprar componentes para fazer o curso?',
              a: 'Não. Placas, sensores, motores e outros componentes físicos não são necessários para fazer o curso. Você pratica no navegador com o AWOTech Lab, sem precisar montar uma bancada em casa.',
            },
            {
              q: 'E se eu quiser montar os projetos fisicamente?',
              a: 'Você pode adquirir os componentes à parte para experimentar também com montagens físicas. Essa compra é opcional; os materiais de cada atividade ajudam a identificar os componentes utilizados.',
            },
          ].map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section id="contato" className="contact-section">
        <div>
          <p className="eyebrow">04 / VAMOS CONVERSAR</p>
          <h2>
            Boas ideias começam
            <br />
            com uma conexão.
          </h2>
          <p>
            Dúvidas sobre a trilha, sugestões ou interesse em levar tecnologia
            para mais pessoas? Queremos ouvir você.
          </p>
        </div>
        <div className="contact-action">
          <a
            className="button button-lime"
            href={`https://wa.me/${team.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversar no WhatsApp ↗
          </a>
          <a className="contact-detail" href={`tel:+${team.whatsapp}`}>
            {team.phone}
          </a>
          <a className="contact-detail" href={`mailto:${team.email}`}>
            {team.email}
          </a>
        </div>
      </section>
    </div>
  );
}
