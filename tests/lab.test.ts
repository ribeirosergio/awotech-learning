import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  compileArduino,
  type ArduinoProgram,
} from '../packages/arduino-runtime/src';
import {
  createLedCircuit,
  SimulationEngine,
  validateLedCircuit,
  type WireConnection,
} from '../packages/simulator/src';
import { lessonSchema } from '../packages/content-types/src';

const blink = `void setup() {pinMode(13, OUTPUT);} void loop() {digitalWrite(13,HIGH);delay(1000);digitalWrite(13,LOW);delay(1000);}`;
function program(source = blink): ArduinoProgram {
  const result = compileArduino(source);
  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  return result.program;
}
const circuit = createLedCircuit(13);
const correct: WireConnection[] = circuit.expectedConnections.map(
  (wire, i) => ({ ...wire, id: String(i) }),
);

describe('gramática mínima Arduino', () => {
  it('compila o exemplo da apostila e resolve constantes sem executar texto da fonte', () => {
    expect(program().setup).toEqual([
      { type: 'pinMode', pin: 13, mode: 'OUTPUT' },
    ]);
    expect(
      program(
        `// comentário\nconst int led = LED_BUILTIN; /* espera */ int tempo=500; ${blink.replaceAll('13', 'led').replaceAll('1000', 'tempo')}`,
      ).loop[1],
    ).toEqual({ type: 'delay', milliseconds: 500 });
  });
  it.each([
    ['ponto e vírgula ausente', blink.replace('delay(1000);', 'delay(1000)')],
    ['setup ausente', 'void loop(){delay(100);}'],
    ['loop duplicado', blink + 'void loop(){delay(10);}'],
    [
      'laço sem passagem de tempo',
      'void setup(){}void loop(){digitalWrite(13,HIGH);}',
    ],
    ['delay zero', blink.replaceAll('1000', '0')],
    ['pino inválido', blink.replaceAll('13', '14')],
    ['tempo fora do limite', blink.replaceAll('1000', '60001')],
    [
      'comando desconhecido',
      blink.replace('digitalWrite(13,HIGH)', 'alert(13,HIGH)'),
    ],
    ['JavaScript', 'globalThis.fetch("https://example.com")'],
    [
      'condicional fora do subconjunto',
      blink.replace(
        'digitalWrite(13,HIGH);',
        'if(true){digitalWrite(13,HIGH);}',
      ),
    ],
    ['comentário não fechado', blink + '/*'],
    ['constante não declarada', blink.replaceAll('13', 'led')],
  ])('rejeita %s com diagnóstico posicionado', (_name, source) => {
    const result = compileArduino(source);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.diagnostics[0]).toMatchObject({
        line: expect.any(Number),
        column: expect.any(Number),
        message: expect.any(String),
      });
  });
  it('limita tamanho e quantidade de instruções', () => {
    expect(compileArduino(' '.repeat(20_001)).ok).toBe(false);
    expect(
      compileArduino(`void setup(){}void loop(){${'delay(1);'.repeat(513)}}`)
        .ok,
    ).toBe(false);
  });
});

describe('relógio e execução digital', () => {
  it('respeita HIGH, LOW, delay e repete loop sem repetir setup', () => {
    let setups = 0;
    const engine = new SimulationEngine(program(), (_state, event) => {
      if (event.type === 'PIN_MODE') setups++;
    });
    expect(engine.advance(0).digitalPins[13]).toBe('HIGH');
    expect(engine.advance(999).digitalPins[13]).toBe('HIGH');
    expect(engine.advance(1).digitalPins[13]).toBe('LOW');
    expect(engine.advance(1000).digitalPins[13]).toBe('HIGH');
    expect(engine.getState().elapsedMilliseconds).toBe(2000);
    expect(setups).toBe(1);
  });
  it('mudar delay e pino muda o comportamento observado', () => {
    const engine = new SimulationEngine(
      program(blink.replaceAll('1000', '250').replaceAll('13', '12')),
    );
    expect(engine.advance(0).digitalPins[13]).toBeUndefined();
    expect(engine.advance(250).digitalPins[12]).toBe('LOW');
    expect(engine.advance(250).digitalPins[12]).toBe('HIGH');
  });
  it('não permite escrever sem OUTPUT e para com mensagem útil', () => {
    const engine = new SimulationEngine(
      program(blink.replace('pinMode(13, OUTPUT);', '')),
    );
    expect(() => engine.advance(0)).toThrow('OUTPUT');
    expect(engine.getState().running).toBe(false);
  });
  it('para, apaga saídas e impede relógio de continuar; snapshots são isolados', () => {
    const engine = new SimulationEngine(program());
    const state = engine.advance(50);
    state.digitalPins[13] = 'LOW';
    expect(engine.getState().digitalPins[13]).toBe('HIGH');
    engine.stop();
    expect(engine.advance(1000)).toEqual({
      running: false,
      digitalPins: {},
      elapsedMilliseconds: 50,
    });
    expect(() => engine.advance(-1)).toThrow();
  });
  it('limita execução mesmo com IR inválida que não tenha delay', () => {
    const engine = new SimulationEngine({
      setup: [],
      loop: [{ type: 'pinMode', pin: 13, mode: 'OUTPUT' }],
    });
    expect(() => engine.advance(0)).toThrow('Limite de instruções');
    expect(engine.getState().running).toBe(false);
  });
});

describe('montagem do LED com resistor em série', () => {
  it('aceita fios em qualquer direção e resistor invertido', () => {
    expect(validateLedCircuit(circuit, correct, 13).valid).toBe(true);
    const reversed = correct.map((w) => ({ id: w.id, from: w.to, to: w.from }));
    expect(validateLedCircuit(circuit, reversed, 13).valid).toBe(true);
    const flipped = structuredClone(correct);
    for (const wire of flipped)
      for (const endpoint of [wire.from, wire.to])
        if (endpoint.componentId === 'resistor')
          endpoint.terminalId = endpoint.terminalId === 'a' ? 'b' : 'a';
    expect(validateLedCircuit(circuit, flipped, 13).valid).toBe(true);
  });
  it('aceita resistor no retorno ao GND', () => {
    const wires: WireConnection[] = [
      {
        id: '1',
        from: { componentId: 'arduino', terminalId: 'D13' },
        to: { componentId: 'led', terminalId: 'anode' },
      },
      {
        id: '2',
        from: { componentId: 'led', terminalId: 'cathode' },
        to: { componentId: 'resistor', terminalId: 'a' },
      },
      {
        id: '3',
        from: { componentId: 'resistor', terminalId: 'b' },
        to: { componentId: 'arduino', terminalId: 'GND' },
      },
    ];
    expect(validateLedCircuit(circuit, wires, 13).valid).toBe(true);
  });
  it('rejeita circuito aberto, LED invertido, pino errado e resistor ausente', () => {
    expect(validateLedCircuit(circuit, correct.slice(1), 13).valid).toBe(false);
    const inverted = structuredClone(correct);
    for (const w of inverted)
      for (const e of [w.from, w.to])
        if (e.componentId === 'led')
          e.terminalId = e.terminalId === 'anode' ? 'cathode' : 'anode';
    expect(validateLedCircuit(circuit, inverted, 13).messages[0]).toContain(
      'invertido',
    );
    const wrongPin = structuredClone(correct);
    wrongPin[0]!.from.terminalId = 'D12';
    expect(validateLedCircuit(circuit, wrongPin, 13).valid).toBe(false);
    expect(
      validateLedCircuit(circuit, [correct[0]!, correct[0]!, correct[2]!], 13)
        .valid,
    ).toBe(false);
  });
  it('alinha a primeira atividade à configuração da aula 4, sem liberar as demais', () => {
    const lesson = lessonSchema.parse(
      JSON.parse(
        readFileSync(
          'content/robotica/aula-04-controlando-circuitos/lesson.json',
          'utf8',
        ),
      ),
    );
    expect(lesson.lab).toEqual({
      kind: 'blink-led',
      signalPin: 13,
      resistorOhms: 220,
    });
    expect(lesson.hasLab).toBe(true);
    expect(lesson.labStatus).toBe('available');
  });
});
