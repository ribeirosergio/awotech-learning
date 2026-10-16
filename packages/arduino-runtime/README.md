# Arduino runtime

Lexer e parser com gramática limitada, diagnósticos de linha/coluna e representação intermediária de instruções. `ArduinoRuntime` percorre `setup` uma vez e repete `loop`; o simulador controla o relógio.

Aceita `void setup()`, `void loop()`, `pinMode`, `digitalWrite`, `delay`, comentários, `LED_BUILTIN` e declarações globais `int`/`const int` usadas como constantes. Não aceita atribuições, expressões, condicionais, loops adicionais, bibliotecas ou C++ completo. Não usa `eval`, `Function` ou execução de código nativo.

Fonte limitada a 20 mil caracteres, 512 instruções por função, pinos 0–13 e delays de 0–60 mil ms. `loop` precisa de pelo menos um delay positivo. O executor é limitado também pelo orçamento de instruções do simulador.
