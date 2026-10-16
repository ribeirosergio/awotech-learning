import type {
  CircuitDefinition,
  TerminalReference,
  WireConnection,
} from './index';
import { terminalKey } from './led-circuit';

export interface ElectricCircuitDefinition extends CircuitDefinition {
  internalConnections: { from: TerminalReference; to: TerminalReference }[];
  hasButton: boolean;
}
const ref = (componentId: string, terminalId: string) => ({
  componentId,
  terminalId,
});
const link = (a: string, b: string) => {
  const [ac, at] = a.split(':'),
    [bc, bt] = b.split(':');
  return { from: ref(ac!, at!), to: ref(bc!, bt!) };
};

/** Recorte guiado da protoboard: três grupos isolados e dois barramentos. */
export function createElectricCircuit(
  hasButton: boolean,
): ElectricCircuitDefinition {
  const components = [
    {
      id: 'battery',
      sku: 'battery-9v',
      position: { x: 30, y: 90 },
      terminals: ['positive', 'negative'],
    },
    {
      id: 'breadboard',
      sku: 'breadboard',
      position: { x: 270, y: 45 },
      terminals: [
        'p1',
        'p2',
        'n1',
        'n2',
        'a1',
        'b1',
        'c1',
        'a2',
        'b2',
        'c2',
        'a3',
        'b3',
        'c3',
      ],
    },
    {
      id: 'resistor',
      sku: 'resistor',
      position: { x: 425, y: 120 },
      terminals: ['a', 'b'],
    },
    {
      id: 'led',
      sku: 'led-red',
      position: { x: 690, y: 150 },
      terminals: ['anode', 'cathode'],
    },
    ...(hasButton
      ? [
          {
            id: 'switch',
            sku: 'switch',
            position: { x: 440, y: 300 },
            terminals: ['a', 'b'],
          },
        ]
      : []),
  ];
  const internalConnections = [
    link('breadboard:p1', 'breadboard:p2'),
    link('breadboard:n1', 'breadboard:n2'),
    ...[1, 2, 3].flatMap((n) => [
      link(`breadboard:a${n}`, `breadboard:b${n}`),
      link(`breadboard:b${n}`, `breadboard:c${n}`),
    ]),
    link('resistor:a', 'breadboard:a1'),
    link('resistor:b', 'breadboard:a2'),
    link('led:anode', 'breadboard:b2'),
    link('led:cathode', 'breadboard:a3'),
  ];
  const expectedConnections = [
    link('battery:positive', 'breadboard:p1'),
    link('battery:negative', 'breadboard:n1'),
    link('breadboard:p2', 'breadboard:c1'),
    ...(hasButton
      ? [link('breadboard:c3', 'switch:a'), link('switch:b', 'breadboard:n2')]
      : [link('breadboard:c3', 'breadboard:n2')]),
  ];
  const terminals = components.flatMap((c) =>
    c.terminals.map((t) => ref(c.id, t)),
  );
  const allowedConnections = terminals.flatMap((from, i) =>
    terminals
      .slice(i + 1)
      .filter(
        (to) =>
          from.componentId !== to.componentId ||
          from.componentId === 'breadboard',
      )
      .map((to) => ({ from, to })),
  );
  return {
    components,
    internalConnections,
    expectedConnections,
    allowedConnections,
    hasButton,
  };
}

export interface ElectricCircuitResult {
  valid: boolean;
  ledOn: boolean;
  closed: boolean;
  message: string;
}

/** Une fios/contatos da protoboard e verifica um caminho em série orientado pela bateria. */
export function evaluateElectricCircuit(
  circuit: ElectricCircuitDefinition,
  wires: WireConnection[],
  buttonClosed: boolean,
): ElectricCircuitResult {
  const fail = (message: string): ElectricCircuitResult => ({
    valid: false,
    closed: false,
    ledOn: false,
    message,
  });
  const parents = new Map<string, string>();
  for (const c of circuit.components)
    for (const t of c.terminals) {
      const k = terminalKey(ref(c.id, t));
      parents.set(k, k);
    }
  function root(key: string): string {
    const parent = parents.get(key)!;
    return parent === key ? key : root(parent);
  }
  function join(from: TerminalReference, to: TerminalReference) {
    parents.set(root(terminalKey(from)), root(terminalKey(to)));
  }
  for (const connection of circuit.internalConnections)
    join(connection.from, connection.to);
  const unique = new Set<string>();
  for (const wire of wires) {
    const a = terminalKey(wire.from),
      b = terminalKey(wire.to),
      key = [a, b].sort().join('|');
    if (!parents.has(a) || !parents.has(b) || a === b || unique.has(key))
      return fail('Remova conexões inválidas ou repetidas.');
    unique.add(key);
    join(wire.from, wire.to);
  }
  const positive = root('battery:positive'),
    negative = root('battery:negative');
  if (positive === negative)
    return fail(
      'Os polos da bateria estão ligados diretamente. Separe os barramentos positivo e negativo.',
    );
  const edges = [
    { id: 'resistor', a: root('resistor:a'), b: root('resistor:b') },
    { id: 'led', a: root('led:anode'), b: root('led:cathode') },
    ...(circuit.hasButton
      ? [{ id: 'switch', a: root('switch:a'), b: root('switch:b') }]
      : []),
  ];
  if (edges.some((e) => e.a === e.b))
    return fail(
      'Um componente foi desviado por um fio ou colocado no mesmo grupo. LED, resistor e botão precisam ficar em série.',
    );
  let current = positive;
  const used = new Set<string>();
  while (current !== negative) {
    const choices = edges.filter(
      (e) => !used.has(e.id) && (e.a === current || e.b === current),
    );
    if (choices.length !== 1)
      return fail(
        'O caminho está interrompido ou tem uma ligação extra. Confira os polos, os barramentos e os grupos da protoboard.',
      );
    const edge = choices[0]!;
    if (edge.id === 'led' && edge.b === current)
      return fail(
        'O LED está invertido. Ligue o ânodo (+) para o lado positivo e o cátodo (−) para o retorno.',
      );
    used.add(edge.id);
    current = edge.a === current ? edge.b : edge.a;
  }
  if (used.size !== edges.length)
    return fail(
      'Inclua todos os componentes em série; o resistor protege o LED e o botão deve controlar o caminho.',
    );
  const closed = !circuit.hasButton || buttonClosed;
  return {
    valid: true,
    closed,
    ledOn: closed,
    message: closed
      ? 'Circuito fechado: o LED está aceso.'
      : 'Montagem correta. O botão está aberto: o LED fica apagado. Feche o botão para completar o caminho.',
  };
}
