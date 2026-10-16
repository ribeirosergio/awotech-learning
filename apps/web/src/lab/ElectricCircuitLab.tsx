import { useMemo, useState, useRef, useEffect } from 'react';
import { useActivityEvidence } from '../platform/useActivityEvidence';
import type { LessonDefinition } from '@awotech/content-types';
import {
  createElectricCircuit,
  evaluateElectricCircuit,
  terminalKey,
  type TerminalReference,
  type WireConnection,
} from '@awotech/simulator';
import CircuitBoard from './CircuitBoard';
import { ElectricBoard, electricTerminals } from './ElectricBoard';
import './lab.css';

export default function ElectricCircuitLab(props: {
  lesson: LessonDefinition;
  userId: string;
}) {
  const [hasButton, setHasButton] = useState(false);
  return (
    <section
      className="awotech-lab practice-section"
      aria-label="AWOTech Lab"
      data-lab="electric-circuits"
    >
      <header className="lab-heading">
        <div>
          <p className="eyebrow">MONTE · CONECTE · OBSERVE</p>
          <h2>AWOTech Lab</h2>
          <p>Circuitos elétricos · sem programação</p>
        </div>
      </header>
      <div
        className="lab-toolbar"
        role="group"
        aria-label="Atividades de circuitos"
      >
        <button
          className="button button-secondary"
          type="button"
          aria-pressed={!hasButton}
          onClick={() => setHasButton(false)}
        >
          LED com protoboard
        </button>
        <button
          className="button button-secondary"
          type="button"
          aria-pressed={hasButton}
          onClick={() => setHasButton(true)}
        >
          LED com botão
        </button>
      </div>
      <ElectricWorkspace
        key={String(hasButton)}
        {...props}
        hasButton={hasButton}
      />
    </section>
  );
}

function ElectricWorkspace({
  lesson,
  userId,
  hasButton,
}: {
  lesson: LessonDefinition;
  userId: string;
  hasButton: boolean;
}) {
  const circuit = useMemo(() => createElectricCircuit(hasButton), [hasButton]);
  const key = `awotech:workspace:${userId}:${lesson.courseId}:${lesson.id}:${hasButton ? 'button' : 'battery'}:wires`;
  const [storageError, setStorageError] = useState(false);
  const [wires, setWires] = useState<WireConnection[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (!Array.isArray(stored) || stored.length > 16) return [];
      const known = new Set(
        circuit.components.flatMap((c) =>
          c.terminals.map((t) =>
            terminalKey({ componentId: c.id, terminalId: t }),
          ),
        ),
      );
      return stored.every(
        (w) =>
          w &&
          typeof w.id === 'string' &&
          w.from &&
          w.to &&
          known.has(terminalKey(w.from)) &&
          known.has(terminalKey(w.to)),
      ) && new Set(stored.map((w) => w.id)).size === stored.length
        ? stored
        : [];
    } catch {
      return [];
    }
  });
  const [buttonClosed, setButtonClosed] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);
  const result = evaluateElectricCircuit(circuit, wires, buttonClosed);
  const observed = useRef<{ wires: string; closed: boolean }>({
    wires: '',
    closed: false,
  });
  const [passed, setPassed] = useState(false);
  const wireKey = JSON.stringify(wires);
  useEffect(() => {
    if (observed.current.wires !== wireKey)
      observed.current = { wires: wireKey, closed: false };
    if (!result.valid) return;
    if (result.ledOn) observed.current.closed = true;
    if (
      (!hasButton && result.ledOn) ||
      (hasButton && observed.current.closed && !result.closed)
    )
      setPassed(true);
  }, [wireKey, result.valid, result.ledOn, result.closed, hasButton]);
  const proof = useActivityEvidence(
    lesson,
    hasButton ? 'button-led' : 'battery-led',
    passed,
  );
  function save(next: WireConnection[]) {
    setWires(next);
    setError('');
    setChecked(false);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  function connect(from: TerminalReference, to: TerminalReference) {
    const pair = [terminalKey(from), terminalKey(to)].sort().join('|');
    if (terminalKey(from) === terminalKey(to)) return;
    if (
      from.componentId === to.componentId &&
      from.componentId !== 'breadboard'
    ) {
      setError('Conecte os componentes pela protoboard.');
      return;
    }
    if (
      wires.some(
        (w) =>
          [terminalKey(w.from), terminalKey(w.to)].sort().join('|') === pair,
      )
    ) {
      setError('Esses contatos já estão ligados.');
      return;
    }
    if (wires.length >= 16) {
      setError('Remova fios extras para continuar.');
      return;
    }
    save([
      ...wires,
      {
        id: crypto.randomUUID(),
        from: { componentId: from.componentId, terminalId: from.terminalId },
        to: { componentId: to.componentId, terminalId: to.terminalId },
      },
    ]);
  }
  return (
    <>
      <div className="lab-instructions">
        <h3>
          {hasButton
            ? 'Atividade 3 · Ligando um LED com um botão'
            : 'Atividade 2 · Ligando um LED com a protoboard'}
        </h3>
        <p>
          LED e resistor já estão encaixados. Os contatos A, B e C de cada grupo
          colorido estão unidos por dentro; grupos diferentes são isolados. Os
          dois contatos de cada barramento (+ ou −) também estão unidos.
        </p>
        <ol>
          <li>
            Ligue <strong>bateria (+)</strong> ao <strong>positivo 1</strong> e{' '}
            <strong>bateria (−)</strong> ao <strong>negativo 1</strong> da
            protoboard.
          </li>
          <li>
            Conecte <strong>positivo 2</strong> ao <strong>grupo 1 C</strong>. O
            resistor liga o grupo 1 ao 2; o LED liga o grupo 2 (+) ao 3 (−).
          </li>
          <li>
            {hasButton ? (
              <>
                Ligue <strong>grupo 3 C</strong> ao <strong>botão A</strong>;
                depois, <strong>botão B</strong> ao <strong>negativo 2</strong>.
              </>
            ) : (
              <>
                Ligue <strong>grupo 3 C</strong> ao <strong>negativo 2</strong>{' '}
                para fechar o caminho.
              </>
            )}
          </li>
        </ol>
        <p>
          {hasButton
            ? 'Clique no botão desenhado no circuito para fechar e abrir o caminho: o LED deve acender e apagar. Você também pode usar Tab e Enter ou Espaço.'
            : 'Ao completar as ligações, o LED acende. Remova um fio para abrir o circuito e observe o LED apagar.'}
        </p>
      </div>
      <div className="lab-panel">
        <CircuitBoard
          key={wires.length === 0 ? 'empty' : 'wired'}
          circuit={circuit}
          wires={wires}
          running={false}
          ledOn={result.ledOn}
          extraVisuals={
            <ElectricBoard
              hasButton={hasButton}
              buttonClosed={buttonClosed}
              onToggleButton={() => setButtonClosed((v) => !v)}
            />
          }
          extraTerminals={electricTerminals(hasButton)}
          onConnect={connect}
          onRemove={(id) => save(wires.filter((w) => w.id !== id))}
        />
        <div className="lab-readings">
          <span data-led={result.ledOn ? 'on' : 'off'}>
            LED: <strong>{result.ledOn ? 'aceso' : 'apagado'}</strong>
          </span>
          <span data-circuit={result.closed ? 'closed' : 'open'}>
            {result.closed ? 'Circuito fechado' : 'Circuito aberto'}
          </span>
        </div>
        <div className="lab-toolbar">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              setChecked(true);
              setError('');
            }}
          >
            Verificar montagem
          </button>
          <button
            className="lab-text-button"
            disabled={!wires.length}
            type="button"
            onClick={() => {
              save([]);
              setButtonClosed(false);
            }}
          >
            Limpar fios
          </button>
        </div>
        {(checked || result.valid) && (
          <div className="lab-feedback" role="status">
            {result.message}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {proof.error && (
          <p role="alert">
            {proof.error}{' '}
            <button type="button" onClick={proof.retry}>
              Salvar aprovação novamente
            </button>
          </p>
        )}
      </div>
      <p className="muted">
        {storageError
          ? 'Não foi possível salvar a montagem neste navegador.'
          : 'Montagem salva neste navegador, separada por aluno e atividade. Ao reabrir, o botão começa aberto.'}
      </p>
      <p className="muted">
        Protoboard simplificada para observar continuidade e polaridade. O botão
        representa um contato que você abre ou fecha. A simulação não calcula
        corrente ou tensão; confirme com o professor o resistor adequado para a
        montagem física com bateria de 9 V.
      </p>
    </>
  );
}
