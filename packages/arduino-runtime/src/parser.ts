import type {
  ArduinoInstruction,
  ArduinoProgram,
  CompileResult,
} from './index';

interface Token {
  text: string;
  line: number;
  column: number;
}
class ParseError extends Error {
  constructor(
    message: string,
    readonly token: Token,
  ) {
    super(message);
  }
}

/** Lexer com posição na fonte; comentários não são confundidos com comandos. */
function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0,
    line = 1,
    column = 1;
  const current = () => source[i] ?? '';
  function advance() {
    if (source[i++] === '\n') {
      line++;
      column = 1;
    } else column++;
  }
  while (i < source.length) {
    if (/\s/.test(current())) {
      advance();
      continue;
    }
    if (source.startsWith('//', i)) {
      while (i < source.length && current() !== '\n') advance();
      continue;
    }
    const start = { text: current(), line, column };
    if (source.startsWith('/*', i)) {
      advance();
      advance();
      while (i < source.length && !source.startsWith('*/', i)) advance();
      if (i === source.length)
        throw new ParseError('Feche o comentário com */.', start);
      advance();
      advance();
      continue;
    }
    if (/[A-Za-z_]/.test(current())) {
      let text = '';
      while (i < source.length && /[A-Za-z0-9_]/.test(current())) {
        text += current();
        advance();
      }
      tokens.push({ ...start, text });
    } else if (/[0-9]/.test(current())) {
      let text = '';
      while (i < source.length && /[0-9]/.test(current())) {
        text += current();
        advance();
      }
      tokens.push({ ...start, text });
    } else if ('(){};,='.includes(current())) {
      tokens.push(start);
      advance();
    } else
      throw new ParseError(
        `Símbolo "${current()}" não suportado neste laboratório.`,
        start,
      );
  }
  tokens.push({ text: '<fim>', line, column });
  return tokens;
}

/** Gramática: declarações globais int/const int + void setup/loop com três APIs. */
export function compileArduino(source: string): CompileResult {
  try {
    if (source.length > 20_000)
      throw new ParseError('O programa excede o limite de 20 mil caracteres.', {
        text: '',
        line: 1,
        column: 1,
      });
    const tokens = tokenize(source);
    let cursor = 0;
    const peek = () => tokens[cursor]!;
    function take(expected?: string): Token {
      const token = peek();
      if (expected && token.text !== expected)
        throw new ParseError(
          `Esperado "${expected}"; encontrado "${token.text}".`,
          token,
        );
      cursor++;
      return token;
    }
    const constants = new Map<string, number>([['LED_BUILTIN', 13]]);
    function number(max: number): number {
      const token = take();
      const value = /^\d+$/.test(token.text)
        ? Number(token.text)
        : constants.get(token.text);
      if (
        value === undefined ||
        !Number.isSafeInteger(value) ||
        value < 0 ||
        value > max
      )
        throw new ParseError(
          `Use um inteiro entre 0 e ${max} ou uma constante declarada.`,
          token,
        );
      return value;
    }
    const functions = new Map<string, ArduinoInstruction[]>();
    while (peek().text !== '<fim>') {
      if (peek().text === 'const' || peek().text === 'int') {
        if (peek().text === 'const') take('const');
        take('int');
        const name = take();
        if (
          !/^[A-Za-z_]\w*$/.test(name.text) ||
          constants.has(name.text) ||
          [
            'setup',
            'loop',
            'pinMode',
            'digitalWrite',
            'delay',
            'HIGH',
            'LOW',
            'INPUT',
            'OUTPUT',
            'int',
            'void',
            'const',
          ].includes(name.text)
        )
          throw new ParseError(
            'Escolha um nome de constante único e válido.',
            name,
          );
        take('=');
        const value = number(60_000);
        take(';');
        constants.set(name.text, value);
        continue;
      }
      take('void');
      const name = take();
      if (!['setup', 'loop'].includes(name.text) || functions.has(name.text))
        throw new ParseError('Defina setup e loop uma única vez.', name);
      take('(');
      take(')');
      take('{');
      const instructions: ArduinoInstruction[] = [];
      while (peek().text !== '}') {
        const call = take();
        if (!['pinMode', 'digitalWrite', 'delay'].includes(call.text))
          throw new ParseError(
            'Nesta versão, use pinMode, digitalWrite e delay dentro das funções.',
            call,
          );
        take('(');
        if (call.text === 'delay')
          instructions.push({ type: 'delay', milliseconds: number(60_000) });
        else {
          const pin = number(13);
          take(',');
          const argument = take();
          if (call.text === 'pinMode') {
            if (argument.text !== 'INPUT' && argument.text !== 'OUTPUT')
              throw new ParseError('Use INPUT ou OUTPUT em pinMode.', argument);
            instructions.push({ type: 'pinMode', pin, mode: argument.text });
          } else {
            if (argument.text !== 'HIGH' && argument.text !== 'LOW')
              throw new ParseError(
                'Use HIGH ou LOW em digitalWrite.',
                argument,
              );
            instructions.push({
              type: 'digitalWrite',
              pin,
              value: argument.text,
            });
          }
        }
        take(')');
        take(';');
        if (instructions.length > 512)
          throw new ParseError(
            'Use no máximo 512 instruções por função.',
            call,
          );
      }
      take('}');
      functions.set(name.text, instructions);
    }
    const setup = functions.get('setup'),
      loop = functions.get('loop');
    if (!setup || !loop)
      throw new ParseError(
        'O programa precisa de void setup() e void loop().',
        peek(),
      );
    if (!loop.some((item) => item.type === 'delay' && item.milliseconds > 0))
      throw new ParseError(
        'Inclua em loop um delay maior que zero para observar a passagem do tempo.',
        peek(),
      );
    const program: ArduinoProgram = { setup, loop };
    return { ok: true, program };
  } catch (error) {
    if (!(error instanceof ParseError)) throw error;
    return {
      ok: false,
      diagnostics: [
        {
          message: error.message,
          line: error.token.line,
          column: error.token.column,
        },
      ],
    };
  }
}
