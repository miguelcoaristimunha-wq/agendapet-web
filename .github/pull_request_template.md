### Descricao das Alteracoes
Finalizacao das funcionalidades centrais da agenda do pet shop Patinhas & Cia, integrando o cadastro de clientes, regras de negocio, prevencao de conflitos de horario e calculo do fechamento financeiro do dia.

- **Ticket / Historia Relacionada:** US06 e US07 (Agenda do dia e Regras de negocio)
- **Tipo de alteracao:** feat

---

### O que mudou?
- [x] Criacao das classes Agendamento e AgendamentoDomiciliar com heranca e polimorfismo para calculo automatico da taxa de deslocamento (R$ 30,00).
- [x] Implementacao da closure para geracao deterministica e isolada de protocolos sequenciais (AP-0001, AP-0002) sem poluir o escopo global.
- [x] Validacao estrita de horarios no expediente oficial (08:00 as 19:00) e bloqueio preventivo de agendamentos duplicados no mesmo horario.
- [x] Painel de fechamento financeiro do dia com consolidacao de faturamento considerando estritamente atendimentos com status Concluido.
- [x] Barra de busca no topo da agenda com busca em tempo real, debounce de 200ms e atalhos ergonomicos (/ para focar, Esc para limpar e N para novo cadastro).
- [x] Filtro rapido de status (Todos, Agendados, Concluidos e Cancelados) e seletor de datas com opcao de visualizar todos os agendamentos.

---

### Como testar?
1. Faca o checkout desta branch: `git checkout feat/US06-agenda-dia`
2. Inicie o servidor local da aplicacao:
   ```bash
   npm start
   ```
   (ou de um duplo clique no arquivo `iniciar-site.bat` no Windows).
3. Abra `http://localhost:3000` no navegador.
4. **Cenarios testados e validados:**
   - **Cadastro comum e a domicilio:** Selecione servico presencial e depois domiciliar com CEP para conferir o preenchimento automatico do endereco e o acrescimo de R$ 30,00.
   - **Prevencao de conflito:** Tente marcar dois pets no mesmo dia e horario; o sistema recusa e exibe mensagem de alerta na tela.
   - **Mudanca de status e caixa:** Clique em Concluir em um agendamento e confira o faturamento subindo instantaneamente no painel da direita.
   - **Testes automatizados:** Execute `npm test` para rodar a suite de testes unitarios da camada de dominio.

---

### Evidencias
- Captura de tela da sessao de depuracao do VS Code: `docs/depuracao.png`
- Relatorio do bug resolvido: `docs/bug-report.md`
- Quadro Kanban com todos os 12 tickets detalhados: `docs/kanban.md`

---

### Checklist da Definicao de Pronto (DoD)
- [x] Todos os cenarios de aceite testados e aprovados.
- [x] Codigo desenvolvido em branch propria no padrao Git Flow.
- [x] Commits organizados no padrao Conventional Commits.
- [x] Zero erros ou avisos vermelhos no console do navegador e no terminal.
- [x] Navegacao completa por teclado conferida (Tab, Enter, Espaco e atalhos).
- [x] Responsividade testada nos breakpoints de 360px, 768px e 1280px.
- [x] Camada de dominio pura (sem dependencias de DOM, window ou Node) compartilhada com testes e scripts CLI.
