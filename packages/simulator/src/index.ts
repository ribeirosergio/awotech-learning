import type { DigitalValue, SimulationEvent } from '@awotech/arduino-runtime';

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
