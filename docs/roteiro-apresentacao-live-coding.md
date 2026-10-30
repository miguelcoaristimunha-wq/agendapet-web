# 🎤 Roteiro Completo para Apresentação em Live Coding (Sprint Review)

**Duração:** 15 minutos  
**Formato:** Compartilhamento de tela (VS Code + Navegador) no Google Meet  
**Apresentador:** Miguel Corrêa  
**Cliente:** Patinhas & Cia  

---

## ⏱️ Divisão do Tempo (15 Minutos)

- **[00:00 - 02:00] Abertura e Contexto:** O problema da Patinhas & Cia e a meta da sprint.
- **[02:00 - 07:00] Demonstração Prática da Aplicação no Navegador (O fluxo completo).**
- **[07:00 - 10:00] O que roda por trás: Node.js, ESM vs CommonJS e Scripts de Terminal.**
- **[10:00 - 12:30] Demonstração do Depurador no VS Code (BUG-001).**
- **[12:30 - 14:00] Processo Ágil: Kanban, Branches, Pull Requests e IA.**
- **[14:00 - 15:00] Retrospectiva e Encerramento.**

---

## 🎬 Passo a Passo do que Falar e Mostrar

### 1. Abertura e Contexto (2 minutos)
- **O que falar:**
  > *"Boa noite, professor e colegas. Hoje apresento o resultado da sprint de duas semanas para a Patinhas & Cia. Eles controlavam os agendamentos em caderno de papel e mensagens do WhatsApp, o que causava choque de horários, erros de endereço em visitas domiciliares e nenhuma visão do fechamento de caixa. Minha meta foi entregar uma solução web completa, acessível na bancada da loja física e resiliente a falhas."*
- **O que mostrar:** A tela inicial do **AgendaPet Web** aberta no navegador (`http://localhost:3000`).

---

### 2. Demonstração Prática na Interface (5 minutos)
Execute os seguintes testes ao vivo explicando o que acontece:

1. **Catálogo e Formulário:**
   - Mostre o catálogo de serviços com preço e duração. Clique em "Agendar este" em um serviço para ver o preenchimento automático.
   - Digite um nome e o telefone (mostre a máscara `(48) 99999-9999` funcionando).
2. **Atendimento Domiciliar e ViaCEP (US04):**
   - Marque a caixa *"Atendimento a Domicílio"*.
   - Digite o CEP `01001-000` ou `88015-100`. Mostre o preenchimento automático de rua, bairro e cidade.
   - Explique: *"Se a internet cair ou o CEP for inválido, o sistema avisa amigavelmente e libera os campos para digitação manual."*
3. **Alerta de Feriado (US05):**
   - Selecione a data `2026-12-25` (Natal).
   - Mostre o alerta de feriado nacional consultado da BrasilAPI e explique o cache de 30 dias em localStorage.
4. **Prevenção de Conflito de Horário (US07):**
   - Tente salvar um agendamento no mesmo dia e horário de um atendimento já ativo. O sistema bloqueia e avisa o choque de horário sem alert chato, com foco no primeiro campo com erro.
5. **Agenda Dinâmica (US06):**
   - Pressione `/` no teclado para focar a busca instantaneamente. Digite "Thor" ou "Pipoca".
   - Pressione `Esc` para limpar a busca.
   - Mude o status de um item clicando em "✓ Concluir" ou "✕ Cancelar".
6. **Fechamento do Caixa em Tempo Real:**
   - Mostre que o card de faturamento soma apenas os atendimentos com status `Concluído`.
7. **Responsividade Mobile:**
   - Pressione `F12` e simule tela de smartphone (360px). Mostre que o layout reorganiza fluidamente sem nenhuma barra de rolagem horizontal.

---

### 3. Terminal e Node.js: ESM vs CommonJS (3 minutos)
- **O que falar:**
  > *"Para operar fora do navegador, configurei o projeto como Node.js com `type: module` no `package.json`. Utilizei o `http-server` como dependência de desenvolvimento local para que qualquer pessoa consiga rodar com um simples `npm install`."*
- **No terminal do VS Code, execute ao vivo:**
  1. `npm run fechamento`
     - Mostre o relatório consolidado impresso no console.
     - Destaque: *"Este script em ES Modules (`scripts/fechamento-dia.js`) importa as mesmas classes e funções de cálculo da pasta `js/dominio/` que rodam na página web, provando a reutilização total do código."*
  2. `npm run validar`
     - Mostre a validação com sucesso do arquivo padrão.
  3. `node scripts/validar-agenda.cjs data/agenda-invalida.json`
     - Mostre os 4 erros identificados e explique: *"Este script foi escrito em CommonJS com `require('fs')` e `path`, e termina com `process.exit(1)` caso a estrutura contenha erros."*

---

### 4. Depuração no VS Code (2 minutos e meio)
- **O que mostrar:**
  - Abra o arquivo `.vscode/launch.json`.
  - Abra [`js/dominio/fechamento.js`](file:///C:/Users/Talita/Desktop/agendapet-web/js/dominio/fechamento.js).
  - Pressione `F5` para iniciar o depurador com a configuração *"Depurar Fechamento do Dia"*.
  - Mostre a execução pausada no breakpoint.
- **O que falar:**
  > *"Identifiquei um bug crítico onde os agendamentos cancelados estavam sendo somados no faturamento do caixa. Em vez de entupir o código com `console.log`, utilizei o depurador nativo do VS Code. Configurei um breakpoint condicional para quando o status fosse 'Cancelado', olhei o painel de variáveis locais onde o acumulador subia indevidamente, e no painel Watch comprovei que a condição `status !== 'Agendado'` deixava passar os cancelados. Corrigi filtrando estritamente por `Concluído` e criei testes automatizados para evitar regressão."*

---

### 5. Git, Kanban e Uso de IA (1 minuto e meio)
- **O que mostrar:**
  - Abra o arquivo `planejamento/sprint-planning.md` ou `docs/kanban.md`.
  - Mostre no terminal com `git log --oneline` o histórico de branches e commits.
- **O que falar:**
  > *"Trabalhei seguindo o GitHub Flow: cada história teve sua branch própria nomeada no padrão `tipo/ticket`, commits padronizados no padrão Conventional Commits com verbos no imperativo, e integrei tudo via Pull Requests com o template documentado. Sobre Inteligência Artificial: declarei no README com total transparência que utilizei IA como copiloto para desenhar as coordenadas das logos SVG e gerar a base inicial de dados fictícios, mas 100% da lógica, da modelagem POO e do CSS foram validados e implementados por mim."*

---

### 6. Retrospectiva e Conclusão (1 minuto)
- **O que falar:**
  > *"Na minha retrospectiva, o que mais funcionou foi manter o domínio totalmente desacoplado do DOM. O que faria diferente numa próxima sprint seria iniciar com testes unitários desde o primeiro dia. O sistema foi homologado com 100% dos cenários de aceite e atendeu todas as expectativas do cliente. Estou à disposição para dúvidas!"*
