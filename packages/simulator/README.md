# Simulador

`SimulationEngine` interpreta instruções, controla saídas digitais e tempo virtual e emite eventos, sem depender de React. `advance(ms)` permite testar delays sem esperar tempo real. Escrita digital exige `pinMode(..., OUTPUT)`. Parar desliga as saídas; uma nova execução cria um estado limpo.

`createLedCircuit` define o circuito guiado de Arduino + resistor + LED. `validateLedCircuit` verifica o caminho em série, polaridade do LED, pino configurado e retorno ao GND. Aceita o resistor em qualquer sentido e em qualquer lado do LED. Não calcula tensão ou corrente. A UI SVG apenas desenha os componentes, conexões e estado fornecidos.

`createElectricCircuit` e `evaluateElectricCircuit` cobrem as duas montagens sem Arduino da aula 3. Unem fios e contatos internos da protoboard e verificam bateria, resistor e LED em série, com botão opcional. A abertura do botão interrompe o caminho, e montagens inválidas não acendem o LED. O resistor não tem valor numérico presumido nessa atividade de 9 V.

Esta versão cobre esses circuitos guiados e LED piscando, sem semáforo, sensores, motores, servo ou montagem genérica de protoboard.
