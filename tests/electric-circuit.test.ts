import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  createElectricCircuit,
  evaluateElectricCircuit,
  type WireConnection,
} from '../packages/simulator/src';
import { lessonSchema } from '../packages/content-types/src';

const circuit = createElectricCircuit(false),
  buttonCircuit = createElectricCircuit(true);
const wires = (source = circuit): WireConnection[] =>
  structuredClone(
    source.expectedConnections.map((w, i) => ({ ...w, id: String(i) })),
  );
describe('circuitos da aula 3, sem Arduino', () => {
  it('fecha o circuito com bateria, resistor e LED pelos contatos da protoboard', () => {
    expect(evaluateElectricCircuit(circuit, wires(), false)).toMatchObject({
      valid: true,
      closed: true,
      ledOn: true,
    });
    expect(circuit.components.some((c) => c.id === 'arduino')).toBe(false);
  });
  it('usa continuidade interna dos barramentos e grupos, sem unir grupos diferentes', () => {
    const sameGroup = wires();
    sameGroup[2]!.to.terminalId = 'b1';
    sameGroup[3]!.from.terminalId = 'b3';
    expect(evaluateElectricCircuit(circuit, sameGroup, false).ledOn).toBe(true);
    sameGroup[2]!.to.terminalId = 'c2';
    expect(evaluateElectricCircuit(circuit, sameGroup, false).ledOn).toBe(
      false,
    );
  });
  it('apaga ao remover qualquer fio do circuito', () => {
    for (let i = 0; i < wires().length; i++)
      expect(
        evaluateElectricCircuit(
          circuit,
          wires().filter((_, index) => index !== i),
          false,
        ).ledOn,
      ).toBe(false);
  });
  it('detecta inversão dos polos e desvio do resistor', () => {
    const reversed = wires();
    reversed[0]!.from.terminalId = 'negative';
    reversed[1]!.from.terminalId = 'positive';
    expect(evaluateElectricCircuit(circuit, reversed, false).message).toContain(
      'invertido',
    );
    const shorted = wires();
    shorted.push({
      id: 'bypass',
      from: { componentId: 'breadboard', terminalId: 'b1' },
      to: { componentId: 'breadboard', terminalId: 'b2' },
    });
    expect(evaluateElectricCircuit(circuit, shorted, false)).toMatchObject({
      valid: false,
      ledOn: false,
    });
  });
  it('rejeita curto da bateria, terminal inexistente e fio repetido', () => {
    const shorted = wires();
    shorted.push({
      id: 'short',
      from: { componentId: 'breadboard', terminalId: 'p2' },
      to: { componentId: 'breadboard', terminalId: 'n2' },
    });
    expect(evaluateElectricCircuit(circuit, shorted, false).message).toContain(
      'polos',
    );
    const unknown = wires();
    unknown[0]!.to.terminalId = 'nao-existe';
    expect(evaluateElectricCircuit(circuit, unknown, false).valid).toBe(false);
    expect(
      evaluateElectricCircuit(circuit, [...wires(), wires()[0]!], false).valid,
    ).toBe(false);
  });
  it('abre e fecha o caminho pelo botão sem alterar os fios', () => {
    const assembly = wires(buttonCircuit);
    expect(
      evaluateElectricCircuit(buttonCircuit, assembly, false),
    ).toMatchObject({ valid: true, closed: false, ledOn: false });
    expect(
      evaluateElectricCircuit(buttonCircuit, assembly, true),
    ).toMatchObject({ valid: true, closed: true, ledOn: true });
    expect(evaluateElectricCircuit(buttonCircuit, assembly, false).ledOn).toBe(
      false,
    );
    expect(assembly).toEqual(wires(buttonCircuit));
  });
  it('não permite acender com botão omitido ou desviado', () => {
    expect(evaluateElectricCircuit(buttonCircuit, wires(), true).valid).toBe(
      false,
    );
    const bypass = wires(buttonCircuit);
    bypass.push({
      id: 'bypass',
      from: { componentId: 'switch', terminalId: 'a' },
      to: { componentId: 'switch', terminalId: 'b' },
    });
    expect(evaluateElectricCircuit(buttonCircuit, bypass, true).ledOn).toBe(
      false,
    );
  });
  it('configura a aula 3 sem código, preservando o cenário Arduino da aula 4', () => {
    const lesson = lessonSchema.parse(
      JSON.parse(
        readFileSync('content/robotica/aula-03-circuitos/lesson.json', 'utf8'),
      ),
    );
    expect(lesson.lab).toEqual({ kind: 'electric-circuits' });
    expect(lesson.code).toBeUndefined();
    const arduino = lessonSchema.parse(
      JSON.parse(
        readFileSync(
          'content/robotica/aula-04-controlando-circuitos/lesson.json',
          'utf8',
        ),
      ),
    );
    expect(arduino.lab?.kind).toBe('blink-led');
  });
});
