# AgendaPet Web — Painel de Agendamentos para Pet Shop

> **Projeto Avaliativo (Avaliação M1.2 — 60% da nota) — Turma Front-End React T4**  
> **Estudante:** Miguel Corrêa (`miguelcoaristimunha@gmail.com`)  
> **Cliente:** Patinhas & Cia (Pet Shop de Bairro)  
> **Repositório GitHub:** [https://github.com/miguelcoaristimunha/agendapet-web](https://github.com/miguelcoaristimunha/agendapet-web)  
> **Quadro Kanban:** [Visualizar docs/kanban.md](docs/kanban.md) • [Planilha CSV](docs/kanban.csv)

---

## 1. Sobre o Projeto: O que o sistema faz e para quem serve?

A **Patinhas & Cia** é um pet shop acolhedor de bairro que realizava o controle dos seus atendimentos (banho, tosa, vacinas, consultas e hospedagem) de maneira manual, usando anotações em papel e conversas soltas no WhatsApp. Essa rotina gerava três problemas graves para o negócio:
1. Agendamentos duplicados no mesmo dia e horário;
2. Visitas domiciliares agendadas sem aviso de feriado ou com endereços anotados incorretamente;
3. Incerteza ao final do expediente sobre o faturamento real do dia e o total de serviços prestados.

Como desenvolvedor júnior contratado para conduzir a sprint de duas semanas, desenvolvi o **AgendaPet Web**: uma aplicação web responsiva voltada para a atendente operar diretamente na bancada física, seja em um smartphone, tablet ou computador de mesa.

O painel centraliza:
- **Cadastro validado de agendamentos** em tempo real com prevenção automática de conflitos de horário;
- **Consulta automática de endereço por CEP** via ViaCEP para atendimentos domiciliares;
- **Verificação antecipada de feriados nacionais** via BrasilAPI com cache de 30 dias para evitar sobrecarga de rede;
- **Agenda dinâmica e interativa** com busca por tutor ou pet, atalhos rápidos de teclado (`N`, `/`, `Esc`) e alteração de status em um clique;
- **Cálculo automático de valores**, aplicando regras de orientação a objetos para somar taxa de deslocamento em atendimentos a domicílio;
- **Fechamento financeiro diário instantâneo** e relatórios operacionais executáveis também via linha de comando no terminal (Node.js).

---

## 2. Como Executar o Projeto Passo a Passo (Do Zero)

### Pré-requisitos
- **Node.js:** Versão 18.0.0 ou superior (testado e homologado no Node.js v24.13.0).
- **Git:** Instalado na máquina para clonagem do repositório.
- **Navegador Web:** Google Chrome, Microsoft Edge, Firefox ou Safari atualizado.

### Passo 1: Clonar o Repositório
Abra o seu terminal (Bash, PowerShell ou Prompt de Comando) e execute:
```bash
git clone https://github.com/miguelcoaristimunha/agendapet-web.git
cd agendapet-web
```

### Passo 2: Instalar as Dependências Locais
Instale a dependência de desenvolvimento configurada (`http-server`):
```bash
npm install
```

### Passo 3: Iniciar o Servidor Local da Aplicação Web
Como o projeto utiliza **ES Modules nativos** (`import` / `export`) e faz requisições `fetch` para arquivos JSON e APIs externas, ele **não deve** ser aberto via duplo clique direto no arquivo (`file://`):
```bash
npm start
```
> O comando iniciará o servidor local na porta `3000` e abrirá automaticamente seu navegador em `http://localhost:3000`. (Você também pode utilizar a extensão *Live Server* do VS Code, se preferir).

### Passo 4: Executar o Fechamento Diário no Terminal (ESM)
Para gerar o relatório financeiro consolidado do dia diretamente no terminal:
```bash
npm run fechamento
```
*(Opcional: você pode passar uma data específica como argumento: `node scripts/fechamento-dia.js 2026-10-30`)*

### Passo 5: Executar o Validador Estrito de Dados (CommonJS)
Para checar a integridade da estrutura dos agendamentos:
```bash
npm run validar
```
Para testar a captura de erros no arquivo propositalmente corrompido:
```bash
node scripts/validar-agenda.cjs data/agenda-invalida.json
```
*(O comando identificará os erros de validação e encerrará o processo com código de saída 1).*

### Passo 6 (Bônus): Executar os Testes Unitários Automatizados
```bash
npm test
```
*(Executa a suíte de testes de POO, closures e regras financeiras com o executor nativo `node --test`).*

---

## 3. Decisões de Negócio

Durante o refinamento com a equipe da Patinhas & Cia, estabelecemos as seguintes regras de negócio:

1. **Horário de Funcionamento:**
   - O pet shop atende de **segunda a sábado, das 08h00 às 19h00**.
   - Qualquer agendamento submetido fora dessa faixa é rejeitado com mensagem explicativa na tela.
2. **Preço e Taxa Domiciliar:**
   - Serviços presenciais cobram estritamente o valor de tabela do catálogo.
   - Atendimentos domiciliares são permitidos apenas para serviços compatíveis (ex: Consulta Veterinária, Vacinação, Adestramento e Tosa Higiênica; banhos completos exigem os equipamentos físicos da loja).
   - Quando marcado como domiciliar, uma **taxa fixa de deslocamento de R$ 30,00** é somada automaticamente ao valor final por meio do método sobrescrito `calcularValor()` da subclasse `AgendamentoDomiciliar`.
3. **Prevenção de Conflitos de Agenda:**
   - Não é permitido marcar dois atendimentos ativos (`status: "Agendado"`) no mesmo dia e horário.
   - Caso um horário já tenha sido cancelado, ele é automaticamente liberado para novos pets.
4. **Resiliência e Cache de Feriados:**
   - Para não consumir a cota da BrasilAPI a cada clique de data, a lista anual de feriados é gravada no `localStorage` com timestamp e **validade de 30 dias**.
   - Se o tutor escolher uma data coincidente com feriado, o sistema exibe o nome do feriado e exige confirmação explícita (*"Agendar mesmo assim"*).
   - Se a API estiver fora do ar, o sistema não trava a recepção: exibe um aviso sutil e permite que o agendamento prossiga normalmente.
5. **Fallback do ViaCEP:**
   - Caso o CEP informado seja inexistente nos Correios ou haja queda de internet, todos os campos de logradouro, número, bairro e cidade permanecem abertos para preenchimento manual pela atendente.

---

## 4. Conceitos do Módulo 01 Aplicados no Projeto

A tabela a seguir documenta como e onde cada conceito ensinado nas 14 semanas foi aplicado no código:

| Conceito Trabalhado | Arquivo Principal | Função / Trecho | Como foi implementado |
| :--- | :--- | :--- | :--- |
| **HTML Semântico e Acessibilidade** | `index.html` | Landmarks | Uso de `<header>`, `<nav>`, `<main id="main-content">`, `<section>`, `<aside>` e `<footer>`, com skip link e hierarquia h1-h2-h3. |
| **CSS Flexbox & Responsividade** | `css/style.css` | `.layout-grid-dashboard` | Estrutura mobile-first fluida, com breakpoints em 768px e 1024px/1280px e alvos de toque >= 44px. |
| **Especificidade CSS Baixa** | `css/style.css` | Global | 100% dos estilos usam classes com 1 classe de profundidade. **Zero `!important` e zero seletores por ID**. |
| **Manipulação Segura do DOM** | `js/ui.js` | `renderizarListaAgendamentos` | Criação de nós com `createElement`, `classList.add` e dados do tutor inseridos estritamente com `textContent` (proteção contra XSS). |
| **Eventos de Mouse e Teclado** | `js/app.js` | `configurarEventosTeclado` | Atalho `N` para o formulário, `/` para focar a barra de busca, `Esc` para limpar, e cliques nos botões de status. |
| **Consumo de APIs com `fetch` / `async`** | `js/api.js` | `consultarCepApi` / `consultarFeriadosAno` | Comunicação assíncrona com ViaCEP e BrasilAPI com tratamento completo dos 3 estados (carregando, erro e sucesso). |
| **Armazenamento no `localStorage`** | `js/storage.js` | `salvarAgendaStorage` / `carregarAgendaStorage` | Persistência da lista de agendamentos, tema e filtros com chaves prefixadas (`agendapet:`) e proteção por `try/catch`. |
| **Timers (`setInterval` / `setTimeout`)** | `js/ui.js` e `js/app.js` | `atualizarRelogioEProximoAtendimento` / `exibirToast` | Atualização do relógio a cada 10s e cálculo de tempo até o próximo pet; toasts com destruição limpa e controle de pausa com `clearInterval`. |
| **Classes, Herança e Polimorfismo** | `js/dominio/agendamento.js` | `Agendamento` e `AgendamentoDomiciliar` | `AgendamentoDomiciliar extends Agendamento`, invocando `super(dados)` e sobrescrevendo `calcularValor()` e `resumo()` usando `this`. |
| **Closure (Funções que guardam estado)** | `js/dominio/agendamento.js` | `criarGeradorProtocolo` | Encapsula o contador numérico em escopo léxico fechado, retornando identificadores `AP-0001` sem variáveis globais. |
| **Funções de Callback (Higher-Order)** | `js/dominio/regras.js` | `filtrarAgendamentos` | Função customizada que recebe um array e uma função de predicado externa para filtrar itens da agenda. |
| **Métodos de Array e Laços** | `js/dominio/fechamento.js` | `calcularFechamentoDia` | Uso integrado de `filter`, `reduce`, `find`, `sort`, `map`, `some`, `every` e repetição com laço `for...of`. |
| **Node.js: ESM vs CommonJS** | `scripts/` | `fechamento-dia.js` vs `validar-agenda.cjs` | Um script usando `import` compartilhando a pasta domínio, e outro usando `require('fs')` e `process.exit(1)`. |

---

## 5. Arquitetura Cliente-Servidor no Projeto

Na computação web, a **arquitetura cliente-servidor** baseia-se na separação entre quem solicita recursos (**Cliente**) e quem armazena e fornece recursos (**Servidor**), comunicando-se pelo protocolo HTTP/HTTPS:

```
┌────────────────────────────────────────────────────────┐
│                   CLIENTE (Front-End)                  │
│       Navegador Web (Chrome / Edge / Firefox)          │
│   • Renderização HTML/CSS     • Validações de Formulário │
│   • Manipulação DOM (ui.js)  • Persistência LocalStorage│
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       1. GET /servicos.json      2. GET /ws/{cep}/json
       3. GET index.html, JS, CSS 4. GET /feriados/v1/{ano}
                │                        │
                ▼                        ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     SERVIDOR LOCAL        │  │     SERVIDORES DE APIs  │
│  http-server (Node.js)    │  │       PÚBLICAS EXTERNAS │
│  • Entrega arquivos estáticos│  │ • ViaCEP (Endereços)    │
│    (HTML, CSS, JS, Imagens│  │ • BrasilAPI (Feriados)  │
│     e data/servicos.json) │  │                         │
└───────────────────────────┘  └─────────────────────────┘
```

### Como ela aparece neste projeto:
1. **Servidor Local (`http-server`):** Ao rodar `npm start`, o Node.js atua como o servidor HTTP local servindo arquivos estáticos e respondendo com `200 OK` para o navegador.
2. **Cliente (Navegador):** Dispara requisições `fetch` assíncronas para o servidor local buscando `data/servicos.json` e monta dinamicamente o catálogo.
3. **Serviços Externos de Terceiros:** Quando o atendente digita um CEP ou escolhe uma data, o cliente faz requisições HTTPS para servidores remotos (`viacep.com.br` e `brasilapi.com.br`), recebe as respostas em JSON e hidrata os campos da tela.

---

## 6. Gerenciamento de Pacotes: Instalação Global vs. Local

| Tipo de Instalação | O que é e Quando Usar? | Onde os arquivos ficam gravados? | Comandos Utilizados |
| :--- | :--- | :--- | :--- |
| **Instalação Local (`--save-dev` ou `--save`)** | **Recomendado para dependências do projeto.** Garante que qualquer pessoa que clonar o repositório tenha exatamente as mesmas versões gravadas no `package.json` e `package-lock.json`. Usamos para o `http-server`. | Na pasta `./node_modules` dentro do diretório do projeto. | `npm install --save-dev http-server`<br>`npm ls` (lista pacotes locais) |
| **Instalação Global (`-g`)** | Indicado apenas para utilitários do sistema operacional de uso frequente em qualquer diretório (ex: CLIs globais, gerenciadores de versão). Não deve ser obrigatório para rodar o projeto de um colega. | No diretório de usuário global do Node no sistema operacional (`%AppData%\npm` no Windows). | `npm install -g http-server`<br>`npm ls -g --depth=0`<br>`npx http-server` (roda temporário sem instalar) |

---

## 7. Tabela Comparativa: CommonJS (.cjs) vs. ES Modules (.mjs / .js)

| Critério | CommonJS (CJS) | ES Modules (ESM) |
| :--- | :--- | :--- |
| **Sintaxe de Importação** | `const modulo = require('./modulo.js');` | `import { modulo } from './modulo.js';` |
| **Sintaxe de Exportação** | `module.exports = { modulo };` | `export { modulo };` ou `export default modulo;` |
| **Extensão de Arquivo** | Arquivos `.cjs` (ou `.js` quando sem `"type": "module"`) | Arquivos `.mjs` (ou `.js` com `"type": "module"` no `package.json`) |
| **Carregamento** | **Síncrono** (bloqueante, em tempo de execução) | **Assíncrono** (otimizado para parsing estático da árvore de módulos) |
| **Uso no Navegador** | Não funciona nativamente (exige empacotadores como Webpack/Vite) | **Nativo** nos navegadores modernos via `<script type="module">` |
| **Uso no Projeto** | Utilizado no validador de terminal [`scripts/validar-agenda.cjs`](scripts/validar-agenda.cjs). | Utilizado no projeto todo (`js/`, `index.html` e [`scripts/fechamento-dia.js`](scripts/fechamento-dia.js)). |

### Por que o projeto adotou ESM como padrão?
Adotamos `"type": "module"` no `package.json` porque o ES Modules é o padrão oficial do ecossistema JavaScript moderno (ECMAScript 2015+). Isso nos permitiu **reutilizar exatamente os mesmos módulos da pasta `js/dominio/`** tanto na aplicação que roda no navegador quanto no script de linha de comando do Node.js, sem duplicação de código nem compiladores adicionais.

---

## 8. Especificidade no CSS: Conflito Real Encontrado e Solução

### O Problema Encontrado:
Durante a estilização dos botões de status dos cartões da agenda (`Concluído` e `Cancelado`), criei a classe genérica `.btn-pequeno` e depois a classe de modificação `.btn-sucesso` e `.btn-perigo`. No entanto, os botões mantinham a cor de fundo padrão neutra dos botões secundários porque em uma regra de layout anterior havia sido declarado:
```css
/* REGRA ANTERIOR COM ESPECIFICIDADE DUPLA ACIDENTAL: */
.card-agendamento .btn {
  background-color: var(--cor-fundo-card);
  color: var(--cor-texto-principal);
}
```
Como `.card-agendamento .btn` possui especificidade `(0, 2, 0)` (duas classes), a regra `.btn-sucesso` com especificidade `(0, 1, 0)` era ignorada pelo navegador, mesmo estando declarada mais abaixo no arquivo CSS.

### A Tentativa Ruim (que evitei):
Eu poderia ter colocado `!important` para forçar a cor verde: `background-color: var(--cor-sucesso) !important;`. Porém, isso fere as boas práticas e os critérios do projeto, criando dívida técnica.

### Como Resolvi Corretamente:
Mantive todas as regras no mesmo nível de especificidade de classe única, agrupando modificadores com encadeamento de baixa especificidade:
```css
/* SOLUÇÃO LIMPA E SEM !IMPORTANT: */
.btn-sucesso {
  background-color: var(--cor-sucesso);
  color: #ffffff;
}

.btn-sucesso:hover {
  background-color: #166534;
}
```
Eliminei o aninhamento desnecessário `.card-agendamento .btn` transformando em classes utilitárias isoladas (`.btn` + `.btn-pequeno` + `.btn-sucesso`), mantendo a pontuação de especificidade baixa e previsível em todo o projeto.

---

## 9. Depuração e Investigação de Bugs

- **Resumo do Defeito:** O cálculo de fechamento somava o valor de agendamentos que já haviam sido cancelados pelos clientes.
- **Ferramenta Utilizada:** Depurador do VS Code com configuração em `.vscode/launch.json`, breakpoints condicionais, inspeção do painel *Variables*, *Watch* e *Call Stack*.
- **Relatório Completo:** Acesse a documentação detalhada com passo a passo de reprodução e prints em:  
  **[`docs/bug-report.md`](docs/bug-report.md)**

---

## 10. Resumo da Sprint e Planejamento

- **Meta da Sprint:** *"Entregar a primeira versão completa, funcional e acessível do painel web AgendaPet para a Patinhas & Cia, garantindo agendamentos sem conflitos, busca de CEP, alerta de feriados, persistência no navegador, fechamento financeiro do dia e relatórios de terminal."*
- **Pontos Planejados:** 41 Story Points (12 histórias estimadas na sequência de Fibonacci).
- **Pontos Entregues:** 41 Story Points (100% de entrega no prazo).
- **O que ficou de fora e por quê?** Nenhuma história do backlog principal foi cortada. Apenas decidimos não implementar mapas interativos por geolocalização no CEP, pois a entrega do endereço formatado com logradouro e bairro já atendia plenamente a demanda da recepção.
- **Documento Completo de Planejamento:** **[`planejamento/sprint-planning.md`](planejamento/sprint-planning.md)**

---

## 11. Retrospectiva da Sprint

Ao final do ciclo de duas semanas, realizei uma reflexão crítica sobre o meu processo de trabalho como desenvolvedor front-end:

### O que Manter (Funcionou muito bem)
- **Separação rigorosa da pasta `js/dominio/`:** Deixar o domínio 100% puro (sem tocar em `document` nem `window`) foi a melhor decisão arquitetural do projeto. Isso permitiu rodar testes unitários e scripts no terminal com reutilização total de código.
- **Uso disciplinado de Conventional Commits e Branches:** Trabalhar uma branch por história (`feat/...`, `fix/...`) facilitou a rastreabilidade e evitou conflitos de merge na `main`.
- **Validação de acessibilidade com teclado desde o dia 1:** Testar a navegação com Tab e foco visível tornou a interface extremamente fluida para a atendente.

### O que Parar de Fazer (Pontos de atrito)
- **Tentar estilizar formulários complexos antes de fechar a validação:** No início perdi tempo ajustando espaçamentos de inputs antes de saber quais mensagens de erro apareceriam. A abordagem correta foi estruturar a validação funcional primeiro e depois polir o layout.
- **Deixar para testar APIs de terceiros só no final da história:** Inicialmente assumi que o ViaCEP sempre responderia com logradouro preenchido, mas descobri que CEPs de cidades pequenas só retornam a cidade. Precisei adicionar tratamento para permitir edição manual.

### O que Começar a Fazer (Melhorias para as próximas sprints)
- **Adicionar testes automatizados logo no primeiro dia (TDD ou Test-First):** Criar os testes unitários de regras de negócio antes de implementar a tela teria acelerado o desenvolvimento da função de fechamento financeiro.
- **Automatizar linters no pré-commit com Git Hooks:** Configurar Husky para impedir commits com erros de sintaxe ou formatação fora do padrão Prettier.

---

## 12. Extensões do VS Code Recomendadas

1. **Live Server** (Ritwick Dey): Servidor de desenvolvimento local com recarregamento em tempo real (*Live Reload*).
2. **ESLint** (Dirk Baeumer): Análise estática de código para identificar más práticas e variáveis não utilizadas.
3. **Prettier - Code formatter** (Prettier): Padronização consistente de indentação, aspas e espaçamento.
4. **GitLens — Git supercharged** (GitKraken): Rastreabilidade de commits linha a linha e visualização do histórico de branches.

---

## 13. Declaração de Uso de Inteligência Artificial

Em conformidade com as diretrizes de integridade e transparência da instituição de ensino:

- **Onde usei IA:**
  1. Criação do conjunto de dados mock inicial com nomes realistas de cães e gatos em `data/agenda-exemplo.json`;
  2. Desenho vetorial das coordenadas dos caminhos SVG da logo e do favicon em `img/logo.svg` e `img/favicon.svg`;
  3. Brainstorming de casos de borda para os testes unitários da camada de domínio.
- **O que foi validado e codificado por mim:**
  1. Toda a lógica de regras de negócio, POO com classes, herança e polimorfismo;
  2. Implementação das manipulações do DOM com `createElement` e proteção estrita contra injeção de HTML malicioso;
  3. Estruturação mobile-first em Flexbox com resolução manual do conflito de especificidade;
  4. Depuração e correção da causa raiz no depurador do VS Code;
  5. Estou plenamente capacitado a explicar e defender cada linha deste repositório na Sprint Review ao vivo.
