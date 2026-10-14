/** Contratos da primeira etapa. Parser e executor ainda não implementados. */
export type DigitalValue = 'HIGH' | 'LOW';

export type ArduinoInstruction =
  | { type: 'pinMode'; pin: number; mode: 'INPUT' | 'OUTPUT' }
  | { type: 'digitalWrite'; pin: number; value: DigitalValue }
  | { type: 'delay'; milliseconds: number };

export interface ArduinoProgram {
  setup: ArduinoInstruction[];
  loop: ArduinoInstruction[];
}

export interface RuntimeDiagnostic {
  message: string;
  line: number;
  column: number;
}

export type CompileResult =
  | { ok: true; program: ArduinoProgram }
  | { ok: false; diagnostics: RuntimeDiagnostic[] };

export type SimulationEvent =
  | { type: 'DIGITAL_WRITE'; pin: number; value: DigitalValue }
  | { type: 'DELAY'; milliseconds: number };
