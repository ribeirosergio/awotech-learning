import type { CircuitTerminal } from './CircuitBoard';

export function electricTerminals(hasButton: boolean): CircuitTerminal[] {
  return [
    {
      componentId: 'battery',
      terminalId: 'positive',
      x: 210,
      y: 140,
      label: 'Bateria positivo (+)',
    },
    {
      componentId: 'battery',
      terminalId: 'negative',
      x: 210,
      y: 210,
      label: 'Bateria negativo (−)',
    },
    ...[
      { id: 'p1', x: 310, y: 80, label: 'Protoboard positivo 1' },
      { id: 'p2', x: 350, y: 80, label: 'Protoboard positivo 2' },
      { id: 'n1', x: 310, y: 320, label: 'Protoboard negativo 1' },
      { id: 'n2', x: 780, y: 320, label: 'Protoboard negativo 2' },
    ].map((t) => ({
      componentId: 'breadboard',
      terminalId: t.id,
      x: t.x,
      y: t.y,
      label: t.label,
    })),
    ...[400, 550, 760].flatMap((x, index) =>
      ['a', 'b', 'c'].map((row, i) => ({
        componentId: 'breadboard',
        terminalId: `${row}${index + 1}`,
        x,
        y: [130, 150, 170][i]!,
        label: `Protoboard grupo ${index + 1} ${row.toUpperCase()}`,
      })),
    ),
    ...(hasButton
      ? [
          {
            componentId: 'switch',
            terminalId: 'a',
            x: 410,
            y: 335,
            label: 'Botão terminal A',
          },
          {
            componentId: 'switch',
            terminalId: 'b',
            x: 490,
            y: 335,
            label: 'Botão terminal B',
          },
        ]
      : []),
  ];
}

export function ElectricBoard({
  hasButton,
  buttonClosed,
  onToggleButton,
}: {
  hasButton: boolean;
  buttonClosed: boolean;
  onToggleButton: () => void;
}) {
  return (
    <>
      <rect
        x="270"
        y="45"
        width="540"
        height="300"
        rx="12"
        fill="#f4f1e9"
        stroke="#c8c9bd"
        strokeWidth="2"
      />
      <text x="280" y="30" fontSize="15" fill="#344c3b">
        Protoboard · grupos de contatos
      </text>
      <g className="lab-breadboard-holes" aria-hidden="true">
        {Array.from({ length: 49 }, (_, column) => 300 + column * 10).map(
          (x) => (
            <g key={x}>
              {[
                80, 95, 130, 150, 170, 190, 210, 245, 260, 275, 290, 305, 320,
              ].map((y) => (
                <g key={y}>
                  <circle cx={x} cy={y} r="3" fill="#d0d1c9" />
                  <circle cx={x} cy={y - 0.4} r="1.7" fill="#747b71" />
                </g>
              ))}
            </g>
          ),
        )}
        <rect x="287" y="222" width="507" height="14" rx="5" fill="#d6d5ce" />
        <path
          d="M291 224 H790 M291 236 H790"
          stroke="#bebeb5"
          strokeWidth="1.5"
        />
      </g>
      <path d="M290 65 H795" stroke="#bb4a3e" strokeWidth="3" />
      <text x="310" y="103" textAnchor="middle" fill="#a8372b" fontSize="12">
        1
      </text>
      <text x="350" y="103" textAnchor="middle" fill="#a8372b" fontSize="12">
        2
      </text>
      <text x="786" y="91" fill="#a8372b" fontSize="20">
        +
      </text>
      <path d="M290 338 H795" stroke="#415a70" strokeWidth="3" />
      <text x="310" y="307" textAnchor="middle" fill="#415a70" fontSize="12">
        1
      </text>
      <text x="780" y="307" textAnchor="middle" fill="#415a70" fontSize="12">
        2
      </text>
      <text x="290" y="326" fill="#415a70" fontSize="20">
        −
      </text>
      {[400, 550, 760].map((x, index) => (
        <g key={x}>
          <rect
            x={x - 20}
            y="114"
            width="40"
            height="104"
            rx="12"
            fill={['#e7d5a8', '#cee1c8', '#d2dde8'][index]}
            opacity="0.65"
          />
          <path
            d={`M${x} 130 V210`}
            stroke="#9aa98e"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          <text x={x} y="111" textAnchor="middle" fill="#344c3b" fontSize="13">
            G{index + 1}
          </text>
          {[190, 210].map((y) => (
            <circle key={y} cx={x} cy={y} r="3" fill="#a7ab9d" />
          ))}
          {[130, 150, 170].map((y, i) => (
            <text
              key={`label-${y}`}
              x={x - 25}
              y={y + 4}
              textAnchor="end"
              fill="#344c3b"
              fontSize="12"
            >
              {['A', 'B', 'C'][i]}
            </text>
          ))}
        </g>
      ))}
      <path
        d="M550 150 H590 V260 H660 M720 260 H785 V130 H760"
        fill="none"
        stroke="#8b9487"
        strokeWidth="4"
      />
      <g>
        <rect x="30" y="95" width="165" height="170" rx="10" fill="#303b39" />
        <rect x="135" y="95" width="60" height="170" rx="8" fill="#bd894d" />
        <text x="72" y="178" fontSize="30" fill="white" fontWeight="700">
          9 V
        </text>
        <path
          d="M195 140 H210 M195 210 H210"
          stroke="#8b9487"
          strokeWidth="8"
        />
        <text x="168" y="145" fill="white" fontSize="22">
          +
        </text>
        <text x="168" y="216" fill="white" fontSize="22">
          −
        </text>
        <text x="110" y="290" textAnchor="middle" fontSize="15" fill="#344c3b">
          Bateria
        </text>
      </g>
      {hasButton && (
        <g>
          <path
            d="M410 335 H422 M478 335 H490"
            stroke="#8b9487"
            strokeWidth="5"
          />
          <g
            role="button"
            tabIndex={0}
            className="lab-circuit-switch"
            aria-label={
              buttonClosed
                ? 'Abrir botão do circuito'
                : 'Fechar botão do circuito'
            }
            aria-pressed={buttonClosed}
            onClick={onToggleButton}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggleButton();
              }
            }}
          >
            <title>
              Clique para {buttonClosed ? 'abrir' : 'fechar'} o circuito. Também
              funciona com Enter ou Espaço.
            </title>
            <rect
              x="422"
              y="312"
              width="56"
              height="42"
              rx="5"
              fill="#c5ccc5"
              stroke="#536355"
            />
            <circle
              cx="450"
              cy="333"
              r="14"
              fill={buttonClosed ? '#49773e' : '#37453a'}
            />
            <circle
              cx="450"
              cy={buttonClosed ? '335' : '330'}
              r="9"
              fill={buttonClosed ? '#769567' : '#64705f'}
              pointerEvents="none"
            />
          </g>
          <text
            x="450"
            y="366"
            textAnchor="middle"
            fontSize="13"
            fill="#344c3b"
          >
            {buttonClosed
              ? 'Fechado · clique para abrir'
              : 'Aberto · clique para fechar'}
          </text>
        </g>
      )}
    </>
  );
}
