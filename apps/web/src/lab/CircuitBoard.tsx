import { useRef, useState, type ReactNode } from 'react';
import {
  terminalKey,
  type CircuitDefinition,
  type TerminalReference,
  type WireConnection,
} from '@awotech/simulator';

export interface CircuitTerminal extends TerminalReference {
  x: number;
  y: number;
  label: string;
}
export default function CircuitBoard({
  circuit,
  wires,
  ledOn,
  running,
  pin,
  resistorOhms,
  onConnect,
  onRemove,
  extraVisuals,
  extraTerminals = [],
}: {
  circuit: CircuitDefinition;
  wires: WireConnection[];
  ledOn: boolean;
  running: boolean;
  pin?: number;
  resistorOhms?: number;
  extraVisuals?: ReactNode;
  extraTerminals?: CircuitTerminal[];
  onConnect: (from: TerminalReference, to: TerminalReference) => void;
  onRemove: (id: string) => void;
}) {
  const [selected, setSelected] = useState<TerminalReference | null>(null);
  const drag = useRef<TerminalReference | null>(null);
  const arduino = circuit.components.find((c) => c.id === 'arduino');
  const resistor = circuit.components.find((c) => c.id === 'resistor')!;
  const led = circuit.components.find((c) => c.id === 'led')!;
  const terminals: CircuitTerminal[] = [
    ...extraTerminals,
    ...(arduino?.terminals ?? []).map((terminalId, index) => ({
      componentId: 'arduino',
      terminalId,
      x: arduino!.position.x + 250,
      y: arduino!.position.y + 60 + index * 65,
      label: `Arduino ${terminalId}`,
    })),
    {
      componentId: 'resistor',
      terminalId: 'a',
      x: resistor.position.x - 25,
      y: resistor.position.y + 10,
      label: 'Resistor terminal A',
    },
    {
      componentId: 'resistor',
      terminalId: 'b',
      x: resistor.position.x + 125,
      y: resistor.position.y + 10,
      label: 'Resistor terminal B',
    },
    {
      componentId: 'led',
      terminalId: 'anode',
      x: led.position.x - 30,
      y: led.position.y + 110,
      label: 'LED ânodo (+)',
    },
    {
      componentId: 'led',
      terminalId: 'cathode',
      x: led.position.x + 30,
      y: led.position.y + 110,
      label: 'LED cátodo (−)',
    },
  ];
  function choose(terminal: TerminalReference) {
    if (running) return;
    if (!selected) setSelected(terminal);
    else {
      if (terminalKey(selected) !== terminalKey(terminal))
        onConnect(selected, terminal);
      setSelected(null);
    }
  }
  return (
    <div className="lab-circuit">
      <div className="lab-board-scroll">
        <svg
          className="lab-board"
          viewBox="0 0 860 370"
          role="group"
          aria-label="Bancada de montagem do circuito"
        >
          <defs>
            <pattern
              id="lab-grid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#c7d1c0" />
            </pattern>
            <filter id="led-glow">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <rect width="860" height="370" fill="url(#lab-grid)" rx="12" />
          {extraVisuals}
          {arduino && (
            <g
              transform={`translate(${arduino.position.x},${arduino.position.y})`}
            >
              <rect
                width="250"
                height="235"
                rx="18"
                fill="#126b72"
                stroke="#0d4d54"
                strokeWidth="3"
              />
              <rect
                x="-12"
                y="24"
                width="50"
                height="65"
                rx="5"
                fill="#c7cfd1"
              />
              <rect
                x="72"
                y="92"
                width="60"
                height="88"
                rx="4"
                fill="#25383a"
              />
              <path
                d="M38 146 H65 M132 130 H194 M132 152 H180 M100 68 V87"
                stroke="#6aa19b"
                strokeWidth="3"
              />
              <circle cx="20" cy="210" r="7" fill="#e6ebdf" />
              <circle cx="215" cy="210" r="7" fill="#e6ebdf" />
              <text x="68" y="36" fill="white" fontSize="17" fontWeight="700">
                ARDUINO UNO
              </text>
              <text x="70" y="211" fill="#c7e4db" fontSize="12">
                Saída digital · D{pin}
              </text>
              {arduino.terminals.map((id, index) => (
                <text
                  key={id}
                  x="230"
                  y={65 + index * 65}
                  textAnchor="end"
                  fill="white"
                  fontSize="14"
                >
                  {id}
                </text>
              ))}
            </g>
          )}
          <g
            transform={`translate(${resistor.position.x},${resistor.position.y})`}
          >
            <path d="M-25 10 H125" stroke="#8b9487" strokeWidth="5" />
            <rect
              width="100"
              height="22"
              rx="8"
              fill="#e3c997"
              stroke="#8f7956"
            />
            {resistorOhms !== undefined && (
              <>
                <path
                  d="M20 0 V22 M36 0 V22"
                  stroke="#b03229"
                  strokeWidth="8"
                />
                <path d="M54 0 V22" stroke="#795032" strokeWidth="8" />
                <path d="M82 0 V22" stroke="#ad8a39" strokeWidth="6" />
              </>
            )}
            <text
              x="50"
              y="-18"
              textAnchor="middle"
              fill="#344c3b"
              fontSize="15"
            >
              Resistor {resistorOhms !== undefined ? `${resistorOhms} Ω` : ''}
            </text>
          </g>
          <g transform={`translate(${led.position.x},${led.position.y})`}>
            <path
              d="M-16 5 V75 H-30 V110 M16 5 V65 H30 V110"
              fill="none"
              stroke="#7b8978"
              strokeWidth="5"
            />
            {ledOn && (
              <circle
                cy="-13"
                r="40"
                fill="#ff413b"
                filter="url(#led-glow)"
                opacity="0.65"
              />
            )}
            <path
              d="M-28 10 V-18 A28 28 0 0 1 28 -18 V10 Z"
              fill={ledOn ? '#ff4842' : '#843f3c'}
              stroke="#6b2928"
              strokeWidth="3"
            />
            <ellipse
              cx="-10"
              cy="-24"
              rx="5"
              ry="10"
              fill="#fff"
              opacity={ledOn ? '0.75' : '0.2'}
            />
            <text y="-64" textAnchor="middle" fill="#344c3b" fontSize="15">
              LED vermelho
            </text>
            <text
              x="-30"
              y="139"
              textAnchor="middle"
              fontSize="16"
              fill="#344c3b"
            >
              +
            </text>
            <text
              x="30"
              y="139"
              textAnchor="middle"
              fontSize="16"
              fill="#344c3b"
            >
              −
            </text>
          </g>
          {wires.map((wire) => {
            const from = terminals.find(
              (t) => terminalKey(t) === terminalKey(wire.from),
            );
            const to = terminals.find(
              (t) => terminalKey(t) === terminalKey(wire.to),
            );
            if (!from || !to) return null;
            const ground = from.terminalId === 'GND' || to.terminalId === 'GND';
            return (
              <path
                key={wire.id}
                d={`M${from.x} ${from.y} C${from.x} ${from.y + 80}, ${to.x} ${to.y + 80}, ${to.x} ${to.y}`}
                fill="none"
                stroke={ground ? '#334a42' : '#c3762d'}
                strokeWidth="5"
                strokeLinecap="round"
              />
            );
          })}
          {terminals.map((terminal) => (
            <g
              key={terminalKey(terminal)}
              role="button"
              tabIndex={running ? -1 : 0}
              aria-disabled={running}
              aria-label={terminal.label}
              aria-pressed={
                selected !== null &&
                terminalKey(selected) === terminalKey(terminal)
              }
              className="lab-terminal"
              onPointerDown={(event) => {
                if (!running) {
                  event.preventDefault();
                  drag.current = terminal;
                }
              }}
              onPointerUp={() => {
                if (running) return;
                const origin = drag.current;
                drag.current = null;
                if (origin && terminalKey(origin) !== terminalKey(terminal)) {
                  onConnect(origin, terminal);
                  setSelected(null);
                } else choose(terminal);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  choose(terminal);
                }
                if (event.key === 'Escape') setSelected(null);
              }}
            >
              <title>{terminal.label}</title>
              <circle
                cx={terminal.x}
                cy={terminal.y}
                r="16"
                fill="transparent"
              />
              <circle
                cx={terminal.x}
                cy={terminal.y}
                r="8"
                fill={
                  selected && terminalKey(selected) === terminalKey(terminal)
                    ? '#e4ab42'
                    : '#fff'
                }
                stroke="#345b3d"
                strokeWidth="3"
              />
            </g>
          ))}
        </svg>
      </div>
      <p className="lab-connection-hint" role="status">
        {running
          ? 'Pare a simulação para alterar os fios.'
          : selected
            ? `Origem: ${terminals.find((t) => terminalKey(t) === terminalKey(selected))?.label}. Escolha o destino ou selecione a origem para cancelar.`
            : 'Selecione dois terminais para ligar um fio. Você também pode arrastar entre eles ou usar Tab e Enter.'}
      </p>
      <ul className="lab-wire-list" aria-label="Conexões montadas">
        {wires.map((wire) => (
          <li key={wire.id}>
            <span>
              {
                terminals.find((t) => terminalKey(t) === terminalKey(wire.from))
                  ?.label
              }{' '}
              ↔{' '}
              {
                terminals.find((t) => terminalKey(t) === terminalKey(wire.to))
                  ?.label
              }
            </span>
            <button
              type="button"
              disabled={running}
              onClick={() => {
                setSelected(null);
                onRemove(wire.id);
              }}
              aria-label={`Remover fio ${wire.id}`}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
