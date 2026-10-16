/** Subconjunto Arduino interpretado, sem executar JavaScript ou C++ nativo. */
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
  | { type: 'PIN_MODE'; pin: number; mode: 'INPUT' | 'OUTPUT' }
  | { type: 'DIGITAL_WRITE'; pin: number; value: DigitalValue }
  | { type: 'DELAY'; milliseconds: number };

export { compileArduino } from './parser';

/** setup roda uma vez; loop se repete. O relógio pertence ao SimulationEngine. */
export class ArduinoRuntime {
  private position = 0;
  private setupDone = false;
  constructor(private readonly program: ArduinoProgram) {}
  step(): ArduinoInstruction | undefined {
    if (!this.setupDone) {
      const instruction = this.program.setup[this.position++];
      if (instruction) return instruction;
      this.setupDone = true;
      this.position = 0;
    }
    if (!this.program.loop.length) return undefined;
    const instruction = this.program.loop[this.position];
    this.position = (this.position + 1) % this.program.loop.length;
    return instruction;
  }
}
