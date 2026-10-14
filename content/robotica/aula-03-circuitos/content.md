## Energia para fazer o robô funcionar

Para que um robô funcione, ele precisa de **energia**. Um circuito elétrico é o caminho por onde a corrente elétrica pode circular. Para que isso aconteça, esse caminho precisa estar completo, ou seja, **fechado**.

## Circuito fechado e circuito aberto

Quando o circuito está fechado, a corrente pode circular e os componentes funcionam. Quando o circuito está aberto, o caminho fica interrompido: a corrente não consegue percorrê-lo e o componente deixa de funcionar.

Podemos comparar isso com a luz da sua casa:

- Ao apertar o interruptor para ligar, fechamos o circuito e a lâmpada acende.
- Ao desligar o interruptor, abrimos o circuito e a luz apaga.

![Três esquemas da apostila: bateria ligada por um fio sem aparelho, fio interrompido e circuito com uma lâmpada acesa.](./assets/circuito-aberto-fechado.png 'Comparação da apostila entre um caminho contínuo, uma interrupção no fio e um circuito com lâmpada.')

> **Como ler a figura:** o quadro (b) mostra a interrupção do caminho e o quadro (c) mostra a lâmpada em um circuito fechado. No quadro (a), o fio liga diretamente os polos da bateria, sem um componente limitando a corrente: isso representa um curto-circuito e não é uma montagem para reproduzir. Use a imagem para comparar os caminhos.

## Conhecendo os componentes

### LED: uma pequena luz

Nesta aula, vamos trabalhar com um componente chamado **LED**. Ele é uma pequena luz que acende quando a corrente passa por ele nas condições adequadas.

Para que ele funcione corretamente, precisamos montar um circuito fechado usando fios e um resistor.

### Resistor: proteção para o LED

O **resistor** serve para proteger o LED, limitando a corrente que passa pelo circuito. Ele faz parte da montagem e não deve ser simplesmente retirado para ligar o LED diretamente à fonte de energia.

### Interruptor ou botão: abrir e fechar o caminho

Também vamos usar um **interruptor (switch)**, que funciona como o botão de luz da casa. Ele permite abrir e fechar o circuito quando quisermos. Assim, podemos controlar quando a luz acende e quando ela apaga.

### Protoboard, fios e fonte de energia

As atividades usam uma **protoboard** para organizar as conexões, fios para ligar os componentes e uma bateria como fonte de energia. Nos desenhos da apostila, essa bateria está identificada como **9 V**.

Observe como esses elementos formam um caminho que sai da fonte, passa pelos componentes e retorna à fonte.

## Atividades da aula

### Atividade em aula 1 — Circuito humano

A primeira atividade proposta na apostila é o **circuito humano**, realizada com a turma. Relacione a experiência com a ideia desta aula: um caminho contínuo representa o circuito fechado; uma interrupção representa o circuito aberto.

### Atividade em aula 2 — Ligando um LED com a protoboard

Observe a montagem apresentada na apostila. Identifique a bateria, a protoboard, o LED, o resistor e os fios de conexão.

![Bateria de 9 V conectada a uma protoboard, com LED, resistor e fios formando o circuito.](./assets/led-protoboard.png 'Montagem original da atividade: ligando um LED com a protoboard.')

O objetivo é relacionar o caminho fechado ao funcionamento do LED. Acompanhe as conexões no desenho e reconheça o papel do resistor na montagem.

### Atividade em aula 3 — Ligando um LED com um botão

Agora observe a segunda montagem. Ela inclui um botão junto do LED e do resistor, permitindo controlar a continuidade do caminho.

![Montagem com bateria de 9 V, protoboard, resistor, LED e botão inserido no circuito.](./assets/led-botao.png 'Montagem original da atividade: ligando um LED com um botão.')

Relacione o funcionamento do botão com o interruptor de luz: ao fechar o caminho, o LED pode acender; ao interrompê-lo, ele apaga.

> Os desenhos acima reproduzem o material da aula. Para a montagem física, confirme com o professor o valor do resistor e os terminais dos componentes; a apostila não informa esses detalhes em texto. O resistor de 220 Ω mostrado mais adiante, na aula com Arduino, não deve ser adotado automaticamente nestes circuitos de 9 V.

## Conectando com a próxima aula

Nesta aula, o controle acontece ao abrir e fechar um circuito. Na próxima, vamos conhecer o Arduino e usar um programa para controlar quando um LED acende e apaga.
