# AgendaPet Web
### Painel de Agendamentos e Gestão Operacional para Pet Shop

> **Projeto Avaliativo (Avaliação M1.2 — Módulo 01 Front-End React T4)**  
> **Desenvolvedor:** Miguel Corrêa (`miguelcoaristimunha@gmail.com`)  
> **Cliente:** Patinhas & Cia (Pet Shop de Bairro)  
> **Repositório:** [https://github.com/miguelcoaristimunha-wq/agendapet-web](https://github.com/miguelcoaristimunha-wq/agendapet-web)  
> **Documentos de Apoio:** [Quadro Kanban](docs/kanban.md) &bull; [Planilha CSV](docs/kanban.csv) &bull; [Relatório de Bug](docs/bug-report.md) &bull; [Planejamento da Sprint](planejamento/sprint-planning.md)

---

## Navegação Rápida
- [Visão Geral](#visão-geral)
- [Início Rápido](#início-rápido)
- [Arquitetura & Engenharia de Software](#arquitetura--engenharia-de-software)
- [Regras de Negócio](#regras-de-negócio)
- [Qualidade, Testes & Depuração](#qualidade-testes--depuração)
- [Processo Ágil & Gestão da Sprint](#processo-ágil--gestão-da-sprint)
- [Declaração de Uso de IA](#declaração-de-uso-de-inteligência-artificial)

---

## Visão Geral

A **Patinhas & Cia** é um pet shop acolhedor de bairro que realizava o controle dos seus atendimentos (banho, tosa, vacinas, consultas e hospedagem) de maneira manual, usando anotações em papel e conversas soltas no WhatsApp. Essa rotina gerava três problemas graves para o negócio:

1. **Agendamentos duplicados** no mesmo dia e horário;
2. **Visitas domiciliares** agendadas sem aviso de feriado ou com endereços anotados incorretamente;
3. **Incerteza financeira** ao final do expediente sobre o faturamento real do dia e o total de serviços prestados.

Como desenvolvedor contratado para conduzir a sprint, desenvolvi o **AgendaPet Web**: uma aplicação web responsiva voltada para a atendente operar diretamente na bancada física, seja em um smartphone, tablet ou computador de mesa.

### Principais Recursos
- **Cadastro com Validação Imediata:** Verificação de campos obrigatórios, formatação de telefone e bloqueio automático de colisões de horário.
- **Consulta Automática de CEP:** Integração transparente com a API pública do ViaCEP para preenchimento de endereço em atendimentos domiciliares.
- **Detecção Preventiva de Feriados:** Consulta à BrasilAPI com estratégia de cache local de 30 dias para evitar chamadas redundantes.
- **Agenda Dinâmica e Escaneável:** Filtragem em tempo real por status (`Todos`, `Agendado`, `Concluído`, `Cancelado`), atalhos de teclado ergonômicos (`N`, `/`, `Esc`) e busca com debounce.
- **Orientação a Objetos no Domínio:** Modelagem de entidades com classes, herança e polimorfismo para cálculo de acréscimo de deslocamento domiciliar.
- **Console Operacional e CLI:** Fechamento financeiro diário e validação de consistência executáveis tanto no navegador quanto diretamente no terminal via Node.js.

---

## Início Rápido

### Pré-requisitos
- **Node.js:** Versão 18.0.0 ou superior (testado no Node.js v24.13.0).
- **Git:** Para clonagem e versionamento.
- **Navegador Web:** Chrome, Edge, Firefox ou Safari recente.

---

### Opção 1: Execução em 1 Clique (Windows)
Se você estiver no Windows, basta entrar na pasta do projeto e dar um duplo clique no arquivo:
```text
iniciar-site.bat
```
O script iniciará o servidor local e abrirá o painel automaticamente no seu navegador padrão em `http://localhost:3000`.

---

### Opção 2: Execução via Terminal

#### 1. Clonar e Acessar o Repositório
```bash
git clone https://github.com/miguelcoaristimunha-wq/agendapet-web.git
cd agendapet-web
```

#### 2. Instalar Dependências Locais
```bash
npm install
```

#### 3. Iniciar o Servidor de Desenvolvimento
Como o projeto utiliza **ES Modules nativos** (`import` / `export`) e faz requisições assíncronas `fetch`, ele deve ser servido via protocolo HTTP/HTTPS:
```bash
npm start
```
> O servidor iniciará na porta `3000`. Acesse **`http://localhost:3000`** no seu navegador.

---

### Scripts Utilitários Disponíveis

| Comando | Descrição | Módulo / Runtime |
| :--- | :--- | :--- |
| `npm start` | Inicia o servidor web local com auto-reload | `http-server` (Node.js) |
| `npm test` | Executa a suíte de testes unitários da camada de domínio | `node:test` (Nativo) |
| `npm run fechamento` | Processa o fechamento financeiro diário e próximo atendimento | ES Modules (`scripts/fechamento-dia.js`) |
| `npm run validar` | Valida a consistência estrutural dos agendamentos | CommonJS (`scripts/validar-agenda.cjs`) |

Para testar a captura de erros no script validador com um arquivo corrompido propositalmente:
```bash
node scripts/validar-agenda.cjs data/agenda-invalida.json
```
*(O validador apontará os erros detalhados e encerrará o processo com código de saída 1).*

---

## Arquitetura & Engenharia de Software

### Matriz de Conceitos Aplicados (Módulo 01)

A tabela a seguir documenta como e onde cada fundamento trabalhado ao longo das semanas de mentoria foi implementado no código-fonte:

| Conceito Técnico | Arquivo de Referência | Trecho / Função | Implementação Prática |
| :--- | :--- | :--- | :--- |
| **HTML Semântico & Acessibilidade** | `index.html` | Landmarks | Uso de `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>` e `<footer>`, com skip link e hierarquia de títulos sem div soup. |
| **CSS Flexbox & Responsividade** | `css/style.css` | `.layout-grid-dashboard` | Estrutura mobile-first fluida, adaptativa para telas médias (1024px) e desktops amplos (1280px+). |
| **Baixa Especificidade CSS** | `css/style.css` | Global | 100% dos estilos utilizam classes semânticas. **Zero seletores por ID e zero declarações `!important`**. |
| **Manipulação Segura do DOM** | `js/ui.js` | `renderizarListaAgendamentos` | Nós criados com `createElement` e dados do cliente inseridos exclusivamente com `textContent` (proteção contra XSS). |
| **Eventos de Teclado & Ergonometria** | `js/app.js` | `configurarEventosTeclado` | Atalho `N` para o form, `/` para o campo de busca, `Esc` para limpar a pesquisa/modal. |
| **Consumo de APIs com `fetch`** | `js/api.js` | `consultarCepApi` / `consultarFeriadosAno` | Tratamento assíncrono com feedback visual dos 3 estados (carregando, erro com retry e sucesso). |
| **Persistência em `localStorage`** | `js/storage.js` | `salvarAgendaStorage` / `carregarAgendaStorage` | Armazenamento de dados e preferências com chaves prefixadas (`agendapet:`) e proteção por `try/catch`. |
| **Temporizadores (`setInterval` / `setTimeout`)** | `js/ui.js` e `js/app.js` | `atualizarRelogioEProximoAtendimento` / `exibirToast` | Relógio digital atualizado a cada 10s, contagem regressiva para o próximo pet e toasts flutuantes com destruição limpa. |
| **Classes, Herança & Polimorfismo** | `js/dominio/agendamento.js` | `Agendamento` / `AgendamentoDomiciliar` | `AgendamentoDomiciliar extends Agendamento`, invocando `super(dados)` e aplicando polimorfismo em `calcularValor()`. |
| **Closure (Encapsulamento de Estado)** | `js/dominio/agendamento.js` | `criarGeradorProtocolo` | Encapsula o contador sequencial em escopo léxico fechado, retornando identificadores `AP-0001` sem expor variáveis globais. |
| **Higher-Order Functions & Callbacks** | `js/dominio/regras.js` | `filtrarAgendamentos` | Função pura customizada que recebe um array e uma função de predicado externa para filtragem flexível. |
| **Métodos Funcionais de Array** | `js/dominio/fechamento.js` | `calcularFechamentoDia` | Uso integrado de `filter`, `reduce`, `find`, `sort`, `map`, `some`, `every` e repetição estruturada com laço `for...of`. |
| **Node.js: ESM vs CommonJS** | `scripts/` | `fechamento-dia.js` vs `validar-agenda.cjs` | Um utilitário em ESM compartilhando a camada pura de domínio, e outro em CommonJS com `require` e `process.exit`. |

---

### Arquitetura Cliente-Servidor no Projeto

Na computação web, a separação entre quem solicita (**Cliente**) e quem provê recursos (**Servidor**) garante modularidade, escalabilidade e manutenibilidade:

```text
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

#### No ecossistema do AgendaPet:
1. **Servidor Local (`http-server`):** Ao executar `npm start`, o runtime Node.js atua como servidor HTTP servindo assets estáticos com cabeçalhos adequados e resposta `200 OK`.
2. **Cliente (Navegador):** Dispara chamadas `fetch` assíncronas para carregar o catálogo de serviços (`data/servicos.json`) e constrói dinamicamente a interface.
3. **Serviços de Terceiros (ViaCEP & BrasilAPI):** Chamadas assíncronas externas enriquecem os dados do agendamento sem necessidade de backend intermediário.

---

### Módulos: ES Modules (ESM) vs CommonJS (CJS)

| Aspecto | CommonJS (CJS) | ES Modules (ESM) |
| :--- | :--- | :--- |
| **Sintaxe de Importação** | `const modulo = require('./modulo.js');` | `import { modulo } from './modulo.js';` |
| **Sintaxe de Exportação** | `module.exports = { modulo };` | `export { modulo };` |
| **Extensão Padrão** | `.cjs` (ou `.js` sem `"type": "module"`) | `.mjs` (ou `.js` com `"type": "module"` no `package.json`) |
| **Natureza de Carregamento**| Síncrono (bloqueante, em tempo de execução) | Assíncrono (análise estática da árvore de dependências) |
| **Suporte no Navegador** | Não possui suporte nativo | **Nativo** nos browsers modernos (`<script type="module">`) |
| **Aplicação no Projeto** | Validador estrito de dados ([`scripts/validar-agenda.cjs`](scripts/validar-agenda.cjs)) | Aplicação web principal ([`js/`](js/)) e CLI de fechamento ([`scripts/fechamento-dia.js`](scripts/fechamento-dia.js)) |

> **Decisão de Arquitetura:** Definimos `"type": "module"` na raiz do `package.json` para permitir que toda a lógica pura da pasta `js/dominio/` seja consumida de forma idêntica tanto pelo navegador quanto pelo Node.js, eliminando ferramentas de build adicionais e duplicação de código.

---

### Gerenciamento de Pacotes: Instalação Local vs. Global

| Modo de Instalação | Finalidade Recomendada | Onde os arquivos são salvos? | Comandos Utilizados |
| :--- | :--- | :--- | :--- |
| **Instalação Local (`--save-dev`)** | **Dependências do projeto.** Garante que qualquer membro do time utilize as mesmas versões fixadas no lockfile. | Pasta `./node_modules` no diretório do projeto. | `npm install --save-dev http-server`<br>`npm ls` |
| **Instalação Global (`-g`)** | Ferramentas utilitárias de sistema (CLIs genéricos, geradores). Não deve ser requisito para compilar o código do time. | Diretório global do usuário no sistema operacional. | `npm install -g http-server`<br>`npx http-server` (execução temporária sem instalação permanente) |

---

### Engenharia de Estilos: Resolução de Especificidade sem `!important`

Durante o desenvolvimento dos botões de status (`Concluído` e `Cancelado`), surgiu um conflito de especificidade:
```css
/* Regra anterior com especificidade dupla acidental (0, 2, 0): */
.card-agendamento .btn {
  background-color: var(--cor-fundo-card);
  color: var(--cor-texto-principal);
}
```
Como `.card-agendamento .btn` somava 2 classes, a classe utilitária `.btn-sucesso` (especificidade `0, 1, 0`) não conseguia sobrepor a cor de fundo, mesmo declarada mais abaixo no arquivo.

#### Como foi resolvido com boas práticas:
Em vez de recorrer a `!important` (que quebraria o encapsulamento e geraria dívida técnica), desmembrei o seletor em classes utilitárias isoladas de especificidade única:
```css
/* Solução adotada: especificidade baixa e previsível (0, 1, 0): */
.btn-sucesso {
  background-color: var(--cor-sucesso);
  color: #ffffff;
}

.btn-sucesso:hover {
  background-color: #166534;
}
```
A especificidade de todo o CSS foi mantida previsível, resultando em **zero seletores por ID** e **zero declarações `!important`** em todo o projeto.

---

## Regras de Negócio

1. **Horário de Atendimento:**  
   Expediente de **segunda a sábado, das 08h00 às 19h00**. Agendamentos fora desse intervalo são rejeitados de imediato com aviso visual.
2. **Atendimento Domiciliar & Taxa de Deslocamento:**  
   Banhos completos exigem equipamentos da loja física. Para serviços domiciliares elegíveis (consultas, vacinas, tosa higiênica e adestramento), soma-se automaticamente uma **taxa de deslocamento de R$ 30,00** através da subclasse `AgendamentoDomiciliar`.
3. **Prevenção de Choque de Horários:**  
   Não é permitido cadastrar dois atendimentos com status `Agendado` no mesmo dia e horário. Horários com status `Cancelado` são automaticamente liberados para novos pets.
4. **Cache & Resiliência de Feriados:**  
   A consulta à BrasilAPI possui cache no `localStorage` com validade de 30 dias. Caso uma data coincida com feriado, o sistema alerta o atendente e solicita confirmação explícita.
5. **Fallback Seguro de CEP:**  
   Se o CEP não for localizado ou houver indisponibilidade de rede, os campos de endereço permanecem abertos para digitação manual, garantindo que o atendimento não seja interrompido.

---

## Qualidade, Testes & Depuração

### Testes Unitários Automatizados (`node:test`)
A camada de domínio conta com cobertura completa através do runner nativo do Node.js:
```bash
npm test
```
- **Entidades e POO:** Validação de instanciação e cálculo polimórfico de taxa de deslocamento.
- **Closures:** Teste de geração determinística e isolamento do contador de protocolo.
- **Regras de Negócio:** Validação de telefones com DDD brasileiro, faixa de expediente e prevenção de horários conflitantes.
- **Consolidação Financeira:** Garantia de que atendimentos cancelados não entrem no faturamento efetivado.

---

### Investigação e Resolução do BUG-001 (VS Code Debugger)

- **Problema:** Ao realizar o fechamento do dia, o faturamento somava incorretamente os valores de agendamentos com status `Cancelado`.
- **Procedimento de Depuração:** Utilizou-se o depurador nativo do VS Code configurado em `.vscode/launch.json` com **breakpoint condicional** (`ag.status === 'Cancelado'`). Através dos painéis *Variables*, *Watch* e *Call Stack*, identificou-se que a expressão original `ag.status !== 'Agendado'` considerava cancelados como faturáveis.
- **Correção:** A função `calcularFechamentoDia` foi refatorada com `filter` para isolar estritamente o status `Concluído`.
- **Evidências e Relatório:** Passo a passo completo documentado em **[`docs/bug-report.md`](docs/bug-report.md)** com captura de tela da sessão de depuração.

---

## Processo Ágil & Gestão da Sprint

O ciclo de desenvolvimento seguiu os princípios do Scrum e GitHub Flow:

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Backlog    │ ──► │   A Fazer    │ ──► │ Em Andamento │ ──► │  Em Revisão  │ ──► │  Concluído   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

- **Meta da Sprint:** Entrega de um painel web responsivo e resiliente para recepção de pet shop, com fechamento financeiro e ferramentas de linha de comando.
- **Pontos Planejados e Entregues:** 41 Story Points distribuídos em 12 Histórias de Usuário na escala de Fibonacci (100% de conclusão).
- **Rastreabilidade Git:** Branches dedicadas (`feat/USxx`, `fix/USxx`) integradas via Pull Requests com template padronizado e Conventional Commits.
- **Documentação do Quadro:** Detalhado em **[`docs/kanban.md`](docs/kanban.md)** e exportado em planilha **[`docs/kanban.csv`](docs/kanban.csv)**.

---

### Retrospectiva da Sprint

#### O que Manter (Práticas Positivas)
- **Domínio Puro e Isolado:** A separação de `js/dominio/` sem dependência de browser permitiu compartilhar o código entre o front-end, os scripts Node.js e os testes unitários.
- **Conventional Commits & Branches:** Cada história desenvolvida em branch isolada facilitou a organização e eliminou conflitos de merge.
- **Acessibilidade Contínua:** Validar navegação por teclado e landmarks desde o início acelerou o acabamento da interface.

#### O que Parar de Fazer (Ajustes de Processo)
- **Estilizar antes de validar:** Tentar aplicar CSS antes de definir todas as regras e mensagens de erro do formulário causou retrabalho de layout.
- **Presumir retornos uniformes de APIs externas:** CEPs de municípios menores nem sempre trazem o logradouro completo; prever fallbacks desde o primeiro teste evita surpresas.

#### O que Começar a Fazer (Melhorias Futuras)
- **Test-Driven Development (TDD):** Iniciar as regras de fechamento e cálculos pelos testes antes de codificar a tela pouparia tempo de desenvolvimento.
- **Git Hooks com Husky:** Automatizar validações de formatação e linters antes de cada commit.

---

### Extensões Recomendadas no VS Code
1. **Live Server** (Ritwick Dey): Servidor de desenvolvimento com reload automático.
2. **ESLint** (Dirk Baeumer): Análise estática de código e boas práticas JS.
3. **Prettier - Code formatter** (Prettier): Padronização consistente de código.
4. **GitLens** (GitKraken): Rastreabilidade de commits e histórico de branches.

---

## Declaração de Uso de Inteligência Artificial

Em conformidade com as diretrizes de transparência e integridade acadêmica:

- **Onde ferramentas de IA foram consultadas:**
  1. Criação do conjunto de dados mock inicial de agendamentos em `data/agenda-exemplo.json`;
  2. Traçado dos caminhos vetoriais da logo e do favicon em `img/logo.svg` e `img/favicon.svg`;
  3. Brainstorming de casos de borda para cenários de testes unitários.
- **O que foi desenvolvido, validado e implementado por mim:**
  1. Toda a lógica de negócios, POO, classes com herança, polimorfismo e closures;
  2. Manipulação segura do DOM, consumo de APIs e estratégias de fallback de rede;
  3. Estruturação responsiva com Flexbox, resolução do conflito de especificidade CSS e conformidade WCAG;
  4. Localização da causa raiz no depurador do VS Code e correção do cálculo financeiro;
  5. Estou plenamente capacitado a demonstrar e defender tecnicamente cada decisão deste projeto na Sprint Review ao vivo.
