import type { DigitalValue, SimulationEvent } from '@awotech/arduino-runtime';
import { ArduinoRuntime, type ArduinoProgram } from '@awotech/arduino-runtime';

/** Estado lógico independente dos componentes React e de animações. */
export interface TerminalReference {
  componentId: string;
  terminalId: string;
}

export interface WireConnection {
  id: string;
  from: TerminalReference;
  to: TerminalReference;
}

export interface ComponentInstance {
  id: string;
  sku: string;
  position: { x: number; y: number };
  terminals: string[];
}

export interface CircuitDefinition {
  components: ComponentInstance[];
  allowedConnections: Omit<WireConnection, 'id'>[];
  expectedConnections: Omit<WireConnection, 'id'>[];
}

export interface SimulationState {
  digitalPins: Record<number, DigitalValue>;
  elapsedMilliseconds: number;
  running: boolean;
}

export interface CircuitValidationResult {
  valid: boolean;
  messages: string[];
}

export type SimulationListener = (
  state: SimulationState,
  event: SimulationEvent,
) => void;

export {
  createLedCircuit,
  validateLedCircuit,
  terminalKey,
} from './led-circuit';
export {
  createElectricCircuit,
  evaluateElectricCircuit,
} from './electric-circuit';
export type {
  ElectricCircuitDefinition,
  ElectricCircuitResult,
} from './electric-circuit';

/** Relógio determinístico: a UI fornece o tempo, delays nunca bloqueiam a thread. */
export class SimulationEngine {
  private runtime: ArduinoRuntime;
  private due = 0;
  private modes: Record<number, 'INPUT' | 'OUTPUT'> = {};
  private state: SimulationState = {
    digitalPins: {},
    elapsedMilliseconds: 0,
    running: true,
  };
  constructor(
    program: ArduinoProgram,
    private readonly listener?: SimulationListener,
  ) {
    this.runtime = new ArduinoRuntime(program);
  }
  getState(): SimulationState {
    return { ...this.state, digitalPins: { ...this.state.digitalPins } };
  }
  stop() {
    this.state.running = false;
    this.state.digitalPins = {};
  }
  advance(milliseconds: number): SimulationState {
    if (
      !Number.isFinite(milliseconds) ||
      milliseconds < 0 ||
      milliseconds > 60_000
    )
      throw new Error('Intervalo de simulação inválido.');
    if (!this.state.running) return this.getState();
    const target = this.state.elapsedMilliseconds + milliseconds;
    let budget = 10_000;
    try {
      while (this.due <= target) {
        if (--budget < 0)
          throw new Error(
            'Limite de instruções atingido. Aumente o delay do programa.',
          );
        const instruction = this.runtime.step();
        if (!instruction) {
          this.stop();
          break;
        }
        this.state.elapsedMilliseconds = this.due;
        let event: SimulationEvent;
        if (instruction.type === 'delay') {
          event = { type: 'DELAY', milliseconds: instruction.milliseconds };
          this.due += instruction.milliseconds;
        } else if (instruction.type === 'pinMode') {
          this.modes[instruction.pin] = instruction.mode;
          if (instruction.mode === 'INPUT')
            delete this.state.digitalPins[instruction.pin];
          event = {
            type: 'PIN_MODE',
            pin: instruction.pin,
            mode: instruction.mode,
          };
        } else {
          if (this.modes[instruction.pin] !== 'OUTPUT')
            throw new Error(
              `Configure o pino ${instruction.pin} como OUTPUT com pinMode antes de digitalWrite.`,
            );
          this.state.digitalPins[instruction.pin] = instruction.value;
          event = {
            type: 'DIGITAL_WRITE',
            pin: instruction.pin,
            value: instruction.value,
          };
        }
        this.listener?.(this.getState(), event);
      }
      this.state.elapsedMilliseconds = target;
      return this.getState();
    } catch (error) {
      this.stop();
      throw error;
    }
  }
}
