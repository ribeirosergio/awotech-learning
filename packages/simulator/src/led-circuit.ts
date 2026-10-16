import type {
  CircuitDefinition,
  CircuitValidationResult,
  TerminalReference,
  WireConnection,
} from './index';

export const terminalKey = (terminal: TerminalReference) =>
  `${terminal.componentId}:${terminal.terminalId}`;
const ref = (componentId: string, terminalId: string): TerminalReference => ({
  componentId,
  terminalId,
});

export function createLedCircuit(pin: number): CircuitDefinition {
  const components = [
    {
      id: 'arduino',
      sku: 'arduino-uno-compatible',
      position: { x: 50, y: 70 },
      terminals: [`D${pin}`, `D${pin === 12 ? 13 : 12}`, 'GND'],
    },
    {
      id: 'resistor',
      sku: 'resistor-220',
      position: { x: 425, y: 120 },
      terminals: ['a', 'b'],
    },
    {
      id: 'led',
      sku: 'led-red',
      position: { x: 690, y: 150 },
      terminals: ['anode', 'cathode'],
    },
  ];
  const terminals = components.flatMap((component) =>
    component.terminals.map((id) => ref(component.id, id)),
  );
  const allowedConnections = terminals.flatMap((from, i) =>
    terminals
      .slice(i + 1)
      .filter((to) => to.componentId !== from.componentId)
      .map((to) => ({ from, to })),
  );
  return {
    components,
    allowedConnections,
    expectedConnections: [
      { from: ref('arduino', `D${pin}`), to: ref('resistor', 'a') },
      { from: ref('resistor', 'b'), to: ref('led', 'anode') },
      { from: ref('led', 'cathode'), to: ref('arduino', 'GND') },
    ],
  };
}

/** Validação topológica guiada. Resistor em qualquer lado do LED e em ambas as orientações. */
export function validateLedCircuit(
  circuit: CircuitDefinition,
  wires: WireConnection[],
  pin: number,
): CircuitValidationResult {
  const fail = (message: string) => ({ valid: false, messages: [message] });
  const terminals = new Set(
    circuit.components.flatMap((c) =>
      c.terminals.map((t) => terminalKey(ref(c.id, t))),
    ),
  );
  const graph = new Map<string, Set<string>>();
  function edge(a: string, b: string) {
    if (!graph.has(a)) graph.set(a, new Set());
    if (!graph.has(b)) graph.set(b, new Set());
    graph.get(a)!.add(b);
    graph.get(b)!.add(a);
  }
  const unique = new Set<string>();
  for (const wire of wires) {
    const a = terminalKey(wire.from),
      b = terminalKey(wire.to),
      key = [a, b].sort().join('|');
    if (
      !terminals.has(a) ||
      !terminals.has(b) ||
      wire.from.componentId === wire.to.componentId ||
      unique.has(key)
    )
      return fail(
        'Remova conexões inválidas ou repetidas. Ligue terminais de componentes diferentes.',
      );
    unique.add(key);
    edge(a, b);
  }
  if (wires.length !== 3)
    return fail(
      'Monte um caminho com três fios: saída digital, resistor, LED e retorno ao GND.',
    );
  edge('resistor:a', 'resistor:b');
  edge('led:anode', 'led:cathode');
  const start = `arduino:D${pin}`,
    end = 'arduino:GND';
  for (const terminal of [
    start,
    end,
    'resistor:a',
    'resistor:b',
    'led:anode',
    'led:cathode',
  ]) {
    if (
      graph.get(terminal)?.size !==
      (terminal === start || terminal === end ? 1 : 2)
    )
      return fail(
        `Confira a ligação: D${pin} → resistor → ânodo (+) do LED; cátodo (−) → GND. O resistor também pode ficar no retorno.`,
      );
  }
  let previous = '',
    current = start;
  const visited = new Set<string>();
  while (current !== end) {
    if (visited.has(current))
      return fail('O circuito deve formar um único caminho até o GND.');
    visited.add(current);
    const next = [...(graph.get(current) ?? [])].find((t) => t !== previous);
    if (!next) return fail('O caminho até o GND está interrompido.');
    if (current === 'led:cathode' && next === 'led:anode')
      return fail(
        'O LED está invertido. O ânodo (+) deve ficar voltado para a saída digital.',
      );
    previous = current;
    current = next;
  }
  visited.add(end);
  if (visited.size !== graph.size)
    return fail(
      'Há componentes fora do caminho. Inclua LED e resistor em série.',
    );
  return {
    valid: true,
    messages: [
      'Montagem correta: LED e resistor em série, com retorno ao GND.',
    ],
  };
}
