# Site público

A página inicial e `/cursos` usam `apps/web/src/public/LandingPage.tsx`.
Os estilos estão em `apps/web/src/public/public.css`, carregados depois dos
estilos gerais. A área do aluno mantém seu próprio layout.

- Menu: cursos, quem somos, como funciona, contato e área do aluno.
- Cabeçalho acompanha a rolagem com `sticky`. Em telas até 1050 px, um botão
  expande a navegação; escolher um link fecha o menu e Escape devolve o foco
  ao botão. Os atalhos reservam espaço acima das seções para o cabeçalho.
- Links com fragmentos funcionam também a partir das páginas de curso e login.
- Carrossel manual com três ilustrações SVG locais, controles acessíveis e
  identificação da imagem atual. Não há reprodução automática.
- Seções de curso, quem somos (incluindo o professor), metodologia, dúvidas e contato,
  com fundos, bordas e espaçamentos que demarcam as transições.
- O catálogo continua vindo da configuração existente. Não se importam materiais
  completos das aulas para a página inicial.

## Professor e contato

O objeto `team` no início de `LandingPage.tsx` reúne os dados públicos fornecidos
por Sérgio Ribeiro: apresentação, e-mail, telefone e WhatsApp. Os links abrem os
canais correspondentes; não há formulário nem envio automático de mensagens.
A foto publicada é `content/images/sergio-ribeiro.jpg`, convertida do original
`IMG_2541.HEIC` para compatibilidade com navegadores. O original é preservado.

O botão de cadastro leva ao cadastro existente; criar uma conta não concede
acesso automático aos cursos. Os textos públicos apresentam o curso e o laboratório
com linguagem permanente, sem avisos sobre o estágio de desenvolvimento.

## Conferência visual

Verificar a página inicial em celular e desktop, avançar e voltar as três imagens,
usar os links do menu a partir de um curso e conferir cadastro e login. As
ilustrações são demonstrativas, não fotografias de projetos ou professores reais.
