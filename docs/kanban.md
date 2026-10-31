# Quadro Kanban da Sprint — AgendaPet Web (Patinhas & Cia)

**Período:** 16/10/2026 a 30/10/2026  
**Responsável:** Miguel Corrêa  
**Repositório:** [https://github.com/miguelcoaristimunha/agendapet-web](https://github.com/miguelcoaristimunha/agendapet-web)  
**Tamanho Total Planejado:** 41 Story Points (Fibonacci)  
**Tamanho Entregue:** 41 Story Points (100% de conclusão)

---

## Colunas do Quadro Kanban

```
┌─────────────────┐    ┌─────────────┐    ┌──────────────────┐    ┌─────────────────────────┐    ┌─────────────────┐
│     Backlog     │ ─► │   A Fazer   │ ─► │   Em Andamento   │ ─► │ Em Revisão (PR Aberto)  │ ─► │    Concluído    │
└─────────────────┘    └─────────────┘    └──────────────────┘    └─────────────────────────┘    └─────────────────┘
```

---

## Cartões da Sprint (Histórico de Conclusão)

### Coluna: CONCLUÍDO (12/12)

#### 1. [US01] Estrutura semântica e acessível da página
- **Estimativa:** 3 pontos | **Prioridade:** Alta
- **Branch:** `feat/US01-estrutura-semantica`
- **Pull Request:** [#1 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/1)
- **Critérios:** Landmarks (header, nav, main, section, aside, footer), skip link, h1 único, sem div soup.

#### 2. [US02] Catálogo de serviços com fetch e três estados
- **Estimativa:** 3 pontos | **Prioridade:** Alta
- **Branch:** `feat/US02-catalogo-servicos`
- **Pull Request:** [#2 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/2)
- **Critérios:** Leitura de `servicos.json`, estados de carregamento, erro com retry e sucesso; alimenta select do form.

#### 3. [US03] Formulário de novo agendamento com validação
- **Estimativa:** 5 pontos | **Prioridade:** Alta
- **Branch:** `feat/US03-formulario-agendamento`
- **Pull Request:** [#3 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/3)
- **Critérios:** Submit com preventDefault, validação de campos, telefone, horário comercial, foco no primeiro erro, sem alert.

#### 4. [US04] Endereço automático por CEP via API pública
- **Estimativa:** 3 pontos | **Prioridade:** Média
- **Branch:** `feat/US04-endereco-cep`
- **Pull Request:** [#4 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/4)
- **Critérios:** Consulta ViaCEP aos 8 dígitos, tratamento de CEP inexistente, formato inválido e offline.

#### 5. [US05] Alerta de feriados nacionais com cache de 30 dias
- **Estimativa:** 3 pontos | **Prioridade:** Média
- **Branch:** `feat/US05-alerta-feriados`
- **Pull Request:** [#5 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/5)
- **Critérios:** Consulta BrasilAPI, cache no localStorage com timestamp, confirmação obrigatória para agendar em feriado.

#### 6. [US06] Agenda do dia: lista dinâmica, busca, filtros e atalhos
- **Estimativa:** 5 pontos | **Prioridade:** Alta
- **Branch:** `feat/US06-agenda-dia`
- **Pull Request:** [#6 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/6)
- **Critérios:** Manipulação segura com createElement/textContent (sem innerHTML), busca em tempo real, atalhos N, / e Esc.

#### 7. [US07] Regras de negócio, POO e fechamento do dia
- **Estimativa:** 5 pontos | **Prioridade:** Alta
- **Branch:** `feat/US07-regras-fechamento`
- **Pull Request:** [#7 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/7)
- **Critérios:** Classes Agendamento e AgendamentoDomiciliar com herança e this, closure de protocolo, conflito de horário, 4 métodos de array e laço for.

#### 8. [US08] Persistência e exportação dos dados (localStorage)
- **Estimativa:** 3 pontos | **Prioridade:** Alta
- **Branch:** `feat/US08-persistencia-exportacao`
- **Pull Request:** [#8 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/8)
- **Critérios:** Prefixo agendapet:, restauração pós-F5, try/catch para dados corrompidos, exportação em modal e download JSON.

#### 9. [US09] Relógio em tempo real e lembretes de atendimento
- **Estimativa:** 3 pontos | **Prioridade:** Média
- **Branch:** `feat/US09-relogio-lembretes`
- **Pull Request:** [#9 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/9)
- **Critérios:** setInterval para relógio e cálculo de próximo atendimento, alerta <=15 min e atrasados, pausa com clearInterval, toast com setTimeout.

#### 10. [US10] Layout responsivo, Flexbox e identidade visual
- **Estimativa:** 3 pontos | **Prioridade:** Alta
- **Branch:** `feat/US10-layout-responsivo`
- **Pull Request:** [#10 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/10)
- **Critérios:** Mobile-first, breakpoints em 360px, 768px e 1280px, sem scroll horizontal, sem !important, sem seletores de ID, contraste WCAG.

#### 11. [US11] Projeto Node.js, scripts CLI e ESM vs CommonJS
- **Estimativa:** 3 pontos | **Prioridade:** Alta
- **Branch:** `feat/US11-scripts-node`
- **Pull Request:** [#11 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/11)
- **Critérios:** package.json com "type": "module", scripts start, fechamento (ESM) e validar (CommonJS com process.exit), dependência local http-server.

#### 12. [US12] Depuração com VS Code e relatório de bug
- **Estimativa:** 2 pontos | **Prioridade:** Média
- **Branch:** `fix/US12-depuracao-bug`
- **Pull Request:** [#12 Integrado](https://github.com/miguelcoaristimunha/agendapet-web/pull/12)
- **Critérios:** launch.json funcional, depuração com breakpoints e watch, documentação BUG-001 em docs/bug-report.md e print.

---

## Métricas da Sprint

- **Total de Histórias:** 12
- **Pontos Planejados:** 41 SP
- **Pontos Entregues:** 41 SP
- **Taxa de Conclusão:** 100%
- **Bônus Implementados:**
  - [OK] Testes unitários com `node --test` (+0,25)
  - [OK] Download do arquivo de backup `.json` (+0,15)
  - [OK] Folha de estilos para impressão `@media print` (+0,15)
  - [OK] Suporte completo a Dark Mode / Light Mode
