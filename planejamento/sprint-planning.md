# Planejamento da Sprint — AgendaPet Web (Patinhas & Cia)

**Período da Sprint:** 16/10/2026 a 30/10/2026 (2 semanas)  
**Desenvolvedor:** Miguel Corrêa  
**Mentoria / Módulo:** Módulo 01 — Semanas 13 e 14 (Turma T4 Front-End React)  
**Quadro Kanban:** [Ver documentação em docs/kanban.md](../docs/kanban.md) | [Exportação CSV](../docs/kanban.csv)

---

## Meta da Sprint (Sprint Goal)

> *"Entregar a primeira versão completa, funcional e acessível do painel web AgendaPet para a Patinhas & Cia, garantindo agendamentos sem conflitos, busca automática de CEP, verificação de feriados, persistência no navegador, fechamento financeiro do dia e relatórios de terminal via Node.js."*

---

## Ordem de Execução e Justificativa Técnica

Adotamos uma abordagem incremental com base na arquitetura de camadas e nas dependências de cada história:

1. **Fundação e Estrutura (US01, US10, US02):**
   - *Por quê:* Antes de programar comportamentos complexos, precisamos da casca semântica HTML e do layout CSS flexível para bancada (mobile/tablet/desktop). O catálogo de serviços (`servicos.json`) é a fonte da verdade de preços e tipos de atendimento, que alimentará o formulário.
2. **Entrada de Dados e Integrações Externas (US03, US04, US05):**
   - *Por quê:* O coração da recepção é registrar o cliente. Precisamos validar os inputs no cliente (telefone, horário da loja), conectar ViaCEP para agendamento domiciliar e consultar feriados via BrasilAPI (com cache para resiliência).
3. **Núcleo de Negócio e Visualização (US06, US07):**
   - *Por quê:* Com agendamentos criados, precisamos da listagem com manipulação segura de DOM (`createElement`/`textContent`), filtros, classes com herança (`Agendamento` e `AgendamentoDomiciliar`), validação de choque de horário e as métricas do fechamento financeiro diário com métodos de array.
4. **Persistência, Tempo e Experiência do Usuário (US08, US09):**
   - *Por quê:* Atendente não pode perder dados ao recarregar (F5). Centralizamos o `localStorage` com tratamento de exceções, criamos o relógio em tempo real, lembretes de 15 minutos e controle de pausa com `clearInterval`.
5. **Ferramental Node.js, Qualidade e Apresentação (US11, US12 e Review):**
   - *Por quê:* Finalizamos o módulo criando os scripts utilitários de fechamento (ESM) e validação (CommonJS), configuramos o depurador do VS Code (`launch.json`), catalogamos e corrigimos o bug do relatório e ensaiamos a Sprint Review de 15 minutos.

---

## Estimativas das Histórias de Usuário (Escala Fibonacci)

| Ticket | História de Usuário | Prioridade | Pontos (SP) | Branch de Trabalho | PR Associado |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **US01** | Estrutura semântica e acessível da página | Alta | **3** | `feat/US01-estrutura-semantica` | [#1](https://github.com/miguelcoaristimunha/agendapet-web/pull/1) |
| **US02** | Catálogo de serviços com fetch e 3 estados | Alta | **3** | `feat/US02-catalogo-servicos` | [#2](https://github.com/miguelcoaristimunha/agendapet-web/pull/2) |
| **US03** | Formulário de novo agendamento com validação | Alta | **5** | `feat/US03-formulario-agendamento` | [#3](https://github.com/miguelcoaristimunha/agendapet-web/pull/3) |
| **US04** | Endereço automático por CEP (ViaCEP) | Média | **3** | `feat/US04-endereco-cep` | [#4](https://github.com/miguelcoaristimunha/agendapet-web/pull/4) |
| **US05** | Alerta de feriados nacionais com cache (BrasilAPI) | Média | **3** | `feat/US05-alerta-feriados` | [#5](https://github.com/miguelcoaristimunha/agendapet-web/pull/5) |
| **US06** | Agenda do dia: lista, busca, filtros e atalhos | Alta | **5** | `feat/US06-agenda-dia` | [#6](https://github.com/miguelcoaristimunha/agendapet-web/pull/6) |
| **US07** | Regras de negócio, POO e fechamento do dia | Alta | **5** | `feat/US07-regras-fechamento` | [#7](https://github.com/miguelcoaristimunha/agendapet-web/pull/7) |
| **US08** | Persistência e exportação de dados (localStorage) | Alta | **3** | `feat/US08-persistencia-exportacao` | [#8](https://github.com/miguelcoaristimunha/agendapet-web/pull/8) |
| **US09** | Relógio, timers e lembretes de atendimento | Média | **3** | `feat/US09-relogio-lembretes` | [#9](https://github.com/miguelcoaristimunha/agendapet-web/pull/9) |
| **US10** | Layout responsivo, Flexbox e identidade visual | Alta | **3** | `feat/US10-layout-responsivo` | [#10](https://github.com/miguelcoaristimunha/agendapet-web/pull/10) |
| **US11** | Projeto Node.js, scripts CLI (ESM vs CommonJS) | Alta | **3** | `feat/US11-scripts-node` | [#11](https://github.com/miguelcoaristimunha/agendapet-web/pull/11) |
| **US12** | Depuração com debugger VS Code e Bug Report | Média | **2** | `fix/US12-depuracao-bug` | [#12](https://github.com/miguelcoaristimunha/agendapet-web/pull/12) |
| **TOTAL** | **12 Histórias de Usuário** | — | **41 pts** | — | — |

---

## Matriz de Riscos e Planos de Mitigação

| Risco Identificado | Probabilidade | Impacto | Estratégia de Mitigação |
| :--- | :---: | :---: | :--- |
| **ViaCEP ou BrasilAPI fora do ar ou com lentidão** | Média | Alto | Implementação de fallback imediato: liberação do preenchimento manual dos campos de endereço e continuação do agendamento com aviso visual amigável. Cache de 30 dias em localStorage para feriados. |
| **Corrupção de dados no localStorage do navegador** | Baixa | Alto | Envolver todas as operações de `JSON.parse` em blocos `try/catch`. Caso haja erro de sintaxe, o sistema carrega o mock inicial de emergência sem travar a aplicação. |
| **Conflito de horários duplicados por atendente desatenta** | Média | Médio | Validação síncrona na submissão contra todos os agendamentos ativos (`Agendado`). Se houver choque de data e hora, bloqueia com aviso explicativo e mantém os dados intactos no form. |
| **Dificuldade na apresentação de 15 minutos (Live Coding)** | Média | Alto | Elaboração de um roteiro minucioso com cronômetro por etapa e ensaios prévios com o navegador e VS Code já abertos e dependências instaladas. |

---

## Plano de Contingência (O que cortar se faltar tempo?)

Caso houvesse imprevistos de cronograma, os seguintes itens bônus e secundários seriam temporariamente congelados, preservando 100% dos critérios obrigatórios da entrega:

1. **Estilo de impressão `@media print`:** dispensável para o funcionamento da recepção, embora seja um ótimo bônus.
2. **Download direto do JSON como arquivo `.json`:** a exibição formatada para cópia já atende plenamente o requisito de exportação.
3. **Atalhos avançados de teclado secundários (`/` e `Esc`):** os campos continuariam totalmente acessíveis via mouse e Tabulação regular.
4. **Testes unitários automatizados com `node --test`:** manteríamos a validação pelos scripts de terminal `npm run fechamento` e `npm run validar`.

---

## Definição de Pronto (Definition of Done — DoD)
Um ticket só é considerado **"Concluído"** no Kanban após:
1. Todos os cenários de aceite (Dado/Quando/Então) testados e aprovados;
2. Código implementado em branch isolada com commits padronizados (Conventional Commits);
3. Pull Request aberto, preenchido com template e integrado à branch `main`;
4. Sem erros vermelhos no console do navegador e no terminal;
5. Testes de responsividade (360px, 768px, 1280px) e acessibilidade de teclado validados.
