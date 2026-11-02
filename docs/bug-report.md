Relatorio de Investigacao de Bug — BUG-001

Projeto: AgendaPet Web (Patinhas e Cia)
Autor: Miguel Correa
Data: 28/10/2026
Gravidade: Alta (afeta diretamente o fechamento do caixa da loja)
Tickets relacionados: US07 e US12
Status: Resolvido e testado


O Problema Encontrado

Durante os testes de fechamento do dia, percebi uma divergencia seria nos valores: o sistema estava somando o dinheiro de agendamentos cancelados no faturamento final do caixa.

Se um cliente desmarcava uma vacina de 90 reais, o valor continuava entrando como receita ganha, o que geraria um erro grave na contabilidade do pet shop no fim do expediente.


Passos que fiz para reproduzir o erro

1. Abri o painel web em http://localhost:3000 com os dados de exemplo carregados.
2. Marquei um atendimento de Banho e Tosa de 85 reais como Concluido.
3. Marquei outro agendamento de Vacinacao de 90 reais como Cancelado.
4. Fui olhar o painel da direita no Fechamento do Caixa e tambem rodei no terminal o comando npm run fechamento.
5. O sistema mostrou um faturamento de 175 reais, somando os 85 com os 90 do cliente que cancelou.


O que deveria acontecer

O caixa deveria registrar apenas 85 reais, porque cliente cancelado nao foi atendido e nao pagou pelo servico.


Como investiguei a causa raiz no depurador do VS Code

Em vez de encher o codigo de console.log para tentar adivinhar onde estava o erro, configurei o depurador nativo do VS Code pelo arquivo launch.json e segui este passo a passo:

1. Coloquei um breakpoint na linha do calculo de faturamento dentro do arquivo js/dominio/fechamento.js.
2. Como a lista tinha varios itens, criei um breakpoint condicional com a expressao ag.status === 'Cancelado', para a execucao pausar exatamente quando chegasse no agendamento cancelado.
3. No painel lateral do VS Code, olhei a aba Variables e percebi que a variavel acumulador pulava de 85 para 175 reais assim que passava pelo cancelado.
4. Na aba Watch, adicionei a comparacao que estava no codigo: ag.status !== 'Agendado'. O resultado dava true para o status Cancelado, mostrando claramente a falha logica.
5. Na pilha de chamadas (Call Stack), confirmei o fluxo partindo do script de terminal ate a funcao pura de calculo.


Evidencia da sessao de depuracao

Aqui esta o print da minha tela no VS Code pausada no momento exato do breakpoint, mostrando o painel de variaveis, a pilha de chamadas e o Watch ativos:

![Tela do VS Code na sessao de depuracao](depuracao.png)


Como corrigi o codigo

Abri o arquivo js/dominio/fechamento.js e refatorei a logica de soma. Em vez de usar uma condicao negativa duvidosa, separei os atendimentos usando o metodo filter para pegar apenas quem realmente foi concluido:

Antes (com a falha logica):
const faturamento = ordenados.reduce((acc, ag) => {
  if (ag.status !== 'Agendado') return acc + ag.calcularValor();
  return acc;
}, 0);

Depois (corrigido e seguro):
const concluidos = ordenadosPorHorario.filter(ag => ag.status === 'Concluido');
const faturamentoConcluidos = concluidos.reduce((acumulador, ag) => {
  return acumulador + ag.calcularValor();
}, 0);


Como validei que o bug foi 100% resolvido

1. Criei um teste unitario no arquivo tests/dominio.test.js especifico para validar se atendimentos cancelados ficam de fora do faturamento.
2. Rodei o comando npm test e todos os 9 testes passaram com sucesso.
3. Rodei o fechamento no terminal com npm run fechamento e o total calculado bateu certinho em 310 reais, sem nenhum centavo de cancelado entrando no caixa.
4. Fiz o commit com a mensagem fix(US07): impede soma de cancelados no faturamento do fechamento e abri o Pull Request para integrar na branch principal.
