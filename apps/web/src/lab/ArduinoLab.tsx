import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { LessonDefinition } from '@awotech/content-types';
import { compileArduino } from '@awotech/arduino-runtime';
import {
  createLedCircuit,
  SimulationEngine,
  terminalKey,
  validateLedCircuit,
  type SimulationState,
  type TerminalReference,
  type WireConnection,
} from '@awotech/simulator';
import { useCodeDraft } from '../platform/useCodeDraft';
import { useActivityEvidence } from '../platform/useActivityEvidence';
import CircuitBoard from './CircuitBoard';
import './lab.css';

const CodeEditor = lazy(() => import('../components/CodeEditor'));
const editorOptions = { wordWrap: 'on' as const };
const stopped = (): SimulationState => ({
  digitalPins: {},
  elapsedMilliseconds: 0,
  running: false,
});

export default function AwotechLab({
  lesson,
  userId,
}: {
  lesson: LessonDefinition;
  userId: string;
}) {
  const lab = lesson.lab;
  if (lab?.kind !== 'blink-led')
    throw new Error('Configuração de LED Arduino ausente.');
  const config = lab;
  const circuit = useMemo(
    () => createLedCircuit(config.signalPin),
    [config.signalPin],
  );
  const key = `awotech:workspace:${userId}:${lesson.courseId}:${lesson.id}`;
  const { value, change, storageError } = useCodeDraft(
    `${key}:code`,
    lesson.code?.starterCode ?? '',
  );
  const [wireStorageError, setWireStorageError] = useState(false);
  const [wires, setWires] = useState<WireConnection[]>(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(`${key}:wires`) ?? '[]',
      );
      if (!Array.isArray(stored) || stored.length > 12) return [];
      const valid = stored.every((wire) => {
        if (
          !wire ||
          typeof wire !== 'object' ||
          typeof wire.id !== 'string' ||
          !wire.from ||
          !wire.to
        )
          return false;
        return [wire.from, wire.to].every((endpoint) =>
          circuit.components.some(
            (c) =>
              c.id === endpoint.componentId &&
              c.terminals.includes(endpoint.terminalId),
          ),
        );
      });
      return valid && new Set(stored.map((w) => w.id)).size === stored.length
        ? stored
        : [];
    } catch {
      return [];
    }
  });
  const [state, setState] = useState<SimulationState>(stopped);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [error, setError] = useState('');
  const engine = useRef<SimulationEngine | null>(null);
  const running = state.running;
  const [passed, setPassed] = useState(false);
  const proof = useActivityEvidence(lesson, 'blink-led', passed);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous: number | undefined;
    function tick(timestamp: number) {
      try {
        const delta =
          previous === undefined ? 0 : Math.min(timestamp - previous, 250);
        previous = timestamp;
        const next = engine.current!.advance(delta);
        setState(next);
        if (next.running) frame = requestAnimationFrame(tick);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Não foi possível continuar a simulação.',
        );
        setState(engine.current?.getState() ?? stopped());
      }
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      engine.current?.stop();
    };
  }, [running]);

  function saveWires(next: WireConnection[]) {
    setWires(next);
    setFeedback([]);
    setError('');
    try {
      localStorage.setItem(`${key}:wires`, JSON.stringify(next));
      setWireStorageError(false);
    } catch {
      setWireStorageError(true);
    }
  }
  function connect(from: TerminalReference, to: TerminalReference) {
    if (running) return;
    const pair = [terminalKey(from), terminalKey(to)].sort().join('|');
    if (from.componentId === to.componentId) {
      setError('Ligue terminais de componentes diferentes.');
      return;
    }
    if (
      wires.some(
        (wire) =>
          [terminalKey(wire.from), terminalKey(wire.to)].sort().join('|') ===
          pair,
      )
    ) {
      setError('Esses terminais já estão conectados.');
      return;
    }
    if (wires.length >= 6) {
      setError(
        'Remova fios extras antes de continuar. Este circuito precisa de três fios.',
      );
      return;
    }
    saveWires([
      ...wires,
      {
        id: crypto.randomUUID(),
        from: { componentId: from.componentId, terminalId: from.terminalId },
        to: { componentId: to.componentId, terminalId: to.terminalId },
      },
    ]);
  }
  function verify() {
    const result = validateLedCircuit(circuit, wires, config.signalPin);
    setFeedback(result.messages);
    setError('');
    return result.valid;
  }
  function run() {
    engine.current?.stop();
    setState(stopped());
    setError('');
    if (!verify()) return;
    const compiled = compileArduino(value);
    if (!compiled.ok) {
      setError(
        compiled.diagnostics
          .map((d) => `Linha ${d.line}, coluna ${d.column}: ${d.message}`)
          .join('\n'),
      );
      return;
    }
    try {
      let previous: 'HIGH' | 'LOW' | undefined,
        previousTime = 0,
        transitions = 0;
      const delayTotal = (instructions: typeof compiled.program.loop) =>
        instructions.reduce(
          (total, i) => total + (i.type === 'delay' ? i.milliseconds : 0),
          0,
        );
      const minimumRunTime =
        delayTotal(compiled.program.setup) +
        delayTotal(compiled.program.loop) * 2;
      const next = new SimulationEngine(compiled.program, (snapshot, event) => {
        if (event.type !== 'DIGITAL_WRITE' || event.pin !== config.signalPin)
          return;
        if (previous !== undefined && event.value !== previous)
          transitions =
            snapshot.elapsedMilliseconds - previousTime >= 100
              ? transitions + 1
              : 0;
        if (event.value !== previous) {
          previous = event.value;
          previousTime = snapshot.elapsedMilliseconds;
        }
        if (transitions >= 3 && snapshot.elapsedMilliseconds >= minimumRunTime)
          setPassed(true);
      });
      engine.current = next;
      setState(next.advance(0));
      setFeedback([
        'Simulação em execução. Observe o LED e experimente outros tempos em delay.',
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a simulação.',
      );
      setState(stopped());
    }
  }
  function reset() {
    engine.current?.stop();
    engine.current = null;
    setState(stopped());
    setError('');
    setFeedback([
      'Simulação reiniciada. Seu código e sua montagem foram mantidos.',
    ]);
  }
  const example = `void setup() {\n  pinMode(${config.signalPin}, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(${config.signalPin}, HIGH);\n  delay(1000);\n  digitalWrite(${config.signalPin}, LOW);\n  delay(1000);\n}\n`;
  const ledOn = running && state.digitalPins[config.signalPin] === 'HIGH';
  return (
    <section
      className="awotech-lab practice-section"
      aria-label="AWOTech Lab"
      data-running={running}
    >
      <header className="lab-heading">
        <div>
          <p className="eyebrow">MONTE · PROGRAME · EXPERIMENTE</p>
          <h2>AWOTech Lab</h2>
          <p>Atividade 1 · Piscando um LED com Arduino</p>
        </div>
        <span className={`lab-status ${running ? 'is-running' : ''}`}>
          {running ? 'Em execução' : 'Simulação parada'}
        </span>
      </header>
      <div className="lab-instructions">
        <h3>Feche o caminho da energia</h3>
        <ol>
          <li>
            Conecte <strong>D{config.signalPin}</strong> a um terminal do
            resistor de {config.resistorOhms} Ω.
          </li>
          <li>
            Ligue o outro terminal do resistor ao <strong>ânodo (+)</strong> do
            LED.
          </li>
          <li>
            Conecte o <strong>cátodo (−)</strong> do LED ao <strong>GND</strong>{' '}
            do Arduino.
          </li>
        </ol>
        <p>
          Depois, programe a sequência: acender, esperar, apagar e esperar
          novamente. O resistor protege o LED; seu sentido de ligação é
          indiferente. Para registrar a atividade, execute pelo menos dois
          ciclos completos, com o LED aceso e apagado por pelo menos 100 ms em
          cada estado.
        </p>
      </div>
      <div className="lab-workspace">
        <div className="lab-panel">
          <h3>Montagem</h3>
          <CircuitBoard
            circuit={circuit}
            wires={wires}
            ledOn={ledOn}
            running={running}
            pin={config.signalPin}
            resistorOhms={config.resistorOhms}
            onConnect={connect}
            onRemove={(id) => saveWires(wires.filter((w) => w.id !== id))}
          />
          <div className="lab-readings">
            <span data-led={ledOn ? 'on' : 'off'}>
              LED: <strong>{ledOn ? 'aceso' : 'apagado'}</strong>
            </span>
            <span>
              D{config.signalPin}:{' '}
              {state.digitalPins[config.signalPin] ?? 'LOW'}
            </span>
            <span>
              Tempo: {(state.elapsedMilliseconds / 1000).toFixed(1)} s
            </span>
          </div>
          <button
            className="lab-text-button"
            type="button"
            disabled={running || !wires.length}
            onClick={() => saveWires([])}
          >
            Limpar fios
          </button>
        </div>
        <div className="lab-panel lab-code-panel">
          <div className="lab-code-heading">
            <h3>Código Arduino</h3>
            <button
              className="lab-text-button"
              disabled={running}
              type="button"
              onClick={() => {
                change(example);
                setError('');
                setFeedback([
                  'Exemplo carregado no editor. Sua montagem foi mantida.',
                ]);
              }}
            >
              Carregar exemplo
            </button>
          </div>
          <Suspense fallback={<p role="status">Carregando editor…</p>}>
            <CodeEditor
              value={value}
              onChange={(next) => {
                change(next);
                setError('');
              }}
              language="arduino"
              readOnly={running}
              height={380}
              options={editorOptions}
            />
          </Suspense>
          <details className="lab-language-help">
            <summary>Comandos disponíveis nesta atividade</summary>
            <p>
              <code>pinMode(pino, OUTPUT)</code> configura a saída.{' '}
              <code>digitalWrite(pino, HIGH)</code> liga; <code>LOW</code>{' '}
              desliga. <code>delay(1000)</code> espera um segundo.
            </p>
            <p>
              Use <code>setup</code> uma vez e <code>loop</code> para repetir.
              São aceitos números inteiros, comentários e declarações globais{' '}
              <code>int</code> ou <code>const int</code>, usadas como
              constantes. Inclua um delay maior que zero em loop. Condicionais,
              atribuições, bibliotecas e outras funções ainda não estão
              disponíveis.
            </p>
          </details>
        </div>
      </div>
      <div className="lab-toolbar">
        <button
          className="button button-secondary"
          disabled={running}
          type="button"
          onClick={verify}
        >
          Verificar montagem
        </button>
        {running ? (
          <button
            className="button"
            type="button"
            onClick={() => {
              engine.current?.stop();
              setState(engine.current?.getState() ?? stopped());
              setFeedback([
                'Simulação parada. Você pode editar o código e os fios.',
              ]);
            }}
          >
            Parar simulação
          </button>
        ) : (
          <button className="button" type="button" onClick={run}>
            Executar
          </button>
        )}
        <button
          className="button button-secondary"
          type="button"
          onClick={reset}
        >
          Reiniciar simulação
        </button>
      </div>
      {feedback.length > 0 && (
        <div className="lab-feedback" role="status">
          {feedback.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      {error && (
        <p className="form-error lab-error" role="alert">
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
      <p className="muted">
        {storageError || wireStorageError
          ? 'Não foi possível salvar o rascunho neste navegador. Copie seu código antes de sair.'
          : 'Código e montagem salvos neste navegador, separados por aluno e aula.'}
      </p>
      <p className="muted">
        Simulação guiada do comportamento digital. A conclusão da aula continua
        manual. A atividade de semáforo será adicionada em outra etapa.
      </p>
    </section>
  );
}
