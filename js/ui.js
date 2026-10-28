/**
 * js/ui.js
 * Gerenciador de interface do usuário, manipulação segura do DOM, eventos e renderização.
 * Conforme US06: Dados do usuário são SEMPRE inseridos com textContent (proteção contra XSS).
 */

import { verificarConflitoHorario, filtrarAgendamentos } from './dominio/regras.js';
import { criarAgendamento } from './dominio/agendamento.js';
import { calcularFechamentoDia } from './dominio/fechamento.js';
import { exportarAgendaJsonFormatado, baixarArquivoAgendaJson, limparDadosProjeto } from './storage.js';

let toastTimeoutId = null;

/**
 * Exibe uma mensagem flutuante (Toast) com temporizador seguro sem acúmulo de timers.
 * Utiliza setTimeout e role="status" / aria-live="polite" para acessibilidade.
 * 
 * @param {string} mensagem
 * @param {'sucesso'|'erro'|'aviso'} [tipo='sucesso']
 * @param {number} [duracaoMs=4000]
 */
export function exibirToast(mensagem, tipo = 'sucesso', duracaoMs = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
    toastTimeoutId = null;
  }

  container.textContent = '';
  container.className = `toast-container toast-${tipo}`;

  const icone = document.createElement('span');
  icone.className = 'toast-icon';
  icone.setAttribute('aria-hidden', 'true');
  icone.textContent = tipo === 'sucesso' ? '✓' : tipo === 'erro' ? '⚠' : 'ℹ';

  const texto = document.createElement('span');
  texto.className = 'toast-text';
  texto.textContent = mensagem;

  container.appendChild(icone);
  container.appendChild(texto);
  container.hidden = false;

  toastTimeoutId = setTimeout(() => {
    container.hidden = true;
    container.textContent = '';
    toastTimeoutId = null;
  }, duracaoMs);
}

/**
 * Renderiza o catálogo de serviços na seção informativa e atualiza o <select> do formulário.
 * Atende aos 3 estados da US02: Carregando, Erro (com botão) e Sucesso.
 * 
 * @param {Array<Object>} servicos
 * @param {string} servicoSelecionadoAtual
 */
export function renderizarCatalogoServicos(servicos, servicoSelecionadoAtual = '') {
  const container = document.getElementById('catalogo-servicos-container');
  const selectServico = document.getElementById('servico');

  if (!container || !selectServico) return;

  // 1. Limpa container e select
  container.textContent = '';
  selectServico.textContent = '';

  const opcaoPadrao = document.createElement('option');
  opcaoPadrao.value = '';
  opcaoPadrao.textContent = '-- Selecione um serviço do catálogo --';
  selectServico.appendChild(opcaoPadrao);

  if (!servicos || servicos.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'msg-vazia';
    vazio.textContent = 'Nenhum serviço disponível no momento.';
    container.appendChild(vazio);
    return;
  }

  // 2. Cria cards informativos do catálogo
  servicos.forEach(servico => {
    const card = document.createElement('article');
    card.className = 'card-servico';
    card.tabIndex = 0;

    const titulo = document.createElement('h3');
    titulo.className = 'card-servico-titulo';
    titulo.textContent = servico.nome;

    const duracao = document.createElement('span');
    duracao.className = 'badge badge-duracao';
    const duracaoTexto = servico.duracaoMinutos >= 60
      ? `${(servico.duracaoMinutos / 60).toFixed(0)}h`
      : `${servico.duracaoMinutos} min`;
    duracao.textContent = `⏱ ${duracaoTexto}`;

    const preco = document.createElement('p');
    preco.className = 'card-servico-preco';
    preco.textContent = `R$ ${Number(servico.preco).toFixed(2)}`;

    const descricao = document.createElement('p');
    descricao.className = 'card-servico-desc';
    descricao.textContent = servico.descricao;

    const footer = document.createElement('div');
    footer.className = 'card-servico-footer';

    const tagDomicilio = document.createElement('span');
    tagDomicilio.className = servico.aceitaDomicilio ? 'tag tag-domicilio-sim' : 'tag tag-domicilio-nao';
    tagDomicilio.textContent = servico.aceitaDomicilio ? '✓ Atende a domicílio' : '✕ Apenas na loja';
    footer.appendChild(tagDomicilio);

    const btnSelecionar = document.createElement('button');
    btnSelecionar.type = 'button';
    btnSelecionar.className = 'btn-link-acao';
    btnSelecionar.textContent = 'Agendar este';
    btnSelecionar.addEventListener('click', () => {
      selectServico.value = servico.id;
      selectServico.dispatchEvent(new Event('change'));
      const inputTutor = document.getElementById('tutor');
      if (inputTutor) inputTutor.focus();
      exibirToast(`Serviço selecionado: ${servico.nome}`, 'aviso', 2500);
    });
    footer.appendChild(btnSelecionar);

    card.appendChild(titulo);
    card.appendChild(duracao);
    card.appendChild(preco);
    card.appendChild(descricao);
    card.appendChild(footer);
    container.appendChild(card);

    // Adiciona ao <select>
    const option = document.createElement('option');
    option.value = servico.id;
    option.textContent = `${servico.nome} — R$ ${Number(servico.preco).toFixed(2)} (${duracaoTexto})`;
    if (servico.id === servicoSelecionadoAtual) {
      option.selected = true;
    }
    selectServico.appendChild(option);
  });
}

/**
 * Renderiza o estado de erro no catálogo de serviços com botão "Tentar novamente".
 * @param {string} mensagemErro
 * @param {() => void} callbackTentarNovamente
 */
export function renderizarErroCatalogo(mensagemErro, callbackTentarNovamente) {
  const container = document.getElementById('catalogo-servicos-container');
  if (!container) return;

  container.textContent = '';
  const boxErro = document.createElement('div');
  boxErro.className = 'alerta-erro-box';
  boxErro.setAttribute('role', 'alert');

  const icone = document.createElement('span');
  icone.className = 'alerta-erro-icone';
  icone.textContent = '⚠️';

  const texto = document.createElement('p');
  texto.textContent = `Não foi possível carregar os serviços: ${mensagemErro}`;

  const btnReintentar = document.createElement('button');
  btnReintentar.type = 'button';
  btnReintentar.className = 'btn btn-primario';
  btnReintentar.textContent = 'Tentar novamente';
  btnReintentar.addEventListener('click', callbackTentarNovamente);

  boxErro.appendChild(icone);
  boxErro.appendChild(texto);
  boxErro.appendChild(btnReintentar);
  container.appendChild(boxErro);
}

/**
 * Renderiza o estado de carregamento do catálogo (Skeleton/Spinner).
 */
export function renderizarCarregandoCatalogo() {
  const container = document.getElementById('catalogo-servicos-container');
  if (!container) return;

  container.textContent = '';
  const loadingBox = document.createElement('div');
  loadingBox.className = 'loading-box';
  loadingBox.setAttribute('aria-live', 'polite');

  const spinner = document.createElement('div');
  spinner.className = 'spinner';

  const texto = document.createElement('p');
  texto.textContent = 'Carregando serviços da Patinhas & Cia...';

  loadingBox.appendChild(spinner);
  loadingBox.appendChild(texto);
  container.appendChild(loadingBox);
}

/**
 * Renderiza a lista de agendamentos no painel da US06.
 * Utiliza estritamente createElement, textContent e classList.
 * 
 * @param {Array<Object>} agendamentos
 * @param {Object} opcoes
 * @param {string} opcoes.termoBusca
 * @param {string} opcoes.filtroStatus
 * @param {string} opcoes.dataSelecionada
 * @param {(id: string, novoStatus: string) => void} opcoes.aoAlterarStatus
 */
export function renderizarListaAgendamentos(agendamentos, { termoBusca = '', filtroStatus = 'Todos', dataSelecionada = '', aoAlterarStatus }) {
  const container = document.getElementById('lista-agendamentos');
  const contador = document.getElementById('contador-agendamentos');

  if (!container) return;
  container.textContent = '';

  // 1. Filtragem por data (se houver data selecionada)
  let filtrados = agendamentos;
  if (dataSelecionada) {
    filtrados = filtrados.filter(item => item.data === dataSelecionada);
  }

  // 2. Filtragem por status com callback (atendendo US07)
  if (filtroStatus !== 'Todos') {
    filtrados = filtrarAgendamentos(filtrados, item => item.status === filtroStatus);
  }

  // 3. Busca em tempo real por tutor ou pet
  if (termoBusca && termoBusca.trim() !== '') {
    const termo = termoBusca.trim().toLowerCase();
    filtrados = filtrados.filter(item => {
      const tutor = (item.tutor || '').toLowerCase();
      const pet = (item.pet || '').toLowerCase();
      const protocolo = (item.protocolo || '').toLowerCase();
      return tutor.includes(termo) || pet.includes(termo) || protocolo.includes(termo);
    });
  }

  // 4. Ordenação cronológica por horário
  filtrados.sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));

  // 5. Atualiza contador acessível
  if (contador) {
    const plural = filtrados.length === 1 ? 'agendamento' : 'agendamentos';
    contador.textContent = `${filtrados.length} ${plural}`;
  }

  // 6. Estado de lista vazia amigável
  if (filtrados.length === 0) {
    const cardVazio = document.createElement('div');
    cardVazio.className = 'card-vazio';
    cardVazio.setAttribute('role', 'status');

    const icone = document.createElement('div');
    icone.className = 'card-vazio-icone';
    icone.textContent = '🐾';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Nenhum agendamento encontrado';

    const subtitulo = document.createElement('p');
    subtitulo.textContent = termoBusca || filtroStatus !== 'Todos'
      ? 'Tente ajustar os filtros ou limpar o campo de busca (pressione Esc).'
      : 'Não há atendimentos para esta data. Use o formulário ao lado para agendar um pet!';

    cardVazio.appendChild(icone);
    cardVazio.appendChild(titulo);
    cardVazio.appendChild(subtitulo);
    container.appendChild(cardVazio);
    return;
  }

  // 7. Renderização dos cards de agendamento
  const agora = new Date();
  const horaAtualString = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  const dataHojeString = agora.toISOString().slice(0, 10);

  filtrados.forEach(item => {
    const instancia = criarAgendamento(item);
    const card = document.createElement('article');
    card.className = `card-agendamento status-${item.status.toLowerCase()}`;
    card.tabIndex = 0;
    card.dataset.id = item.id;

    // Cabeçalho do Card
    const header = document.createElement('div');
    header.className = 'card-header';

    const horarioBadge = document.createElement('span');
    horarioBadge.className = 'badge badge-horario';
    horarioBadge.textContent = `⏰ ${item.horario}`;
    header.appendChild(horarioBadge);

    const protocoloSpan = document.createElement('span');
    protocoloSpan.className = 'badge badge-protocolo';
    protocoloSpan.textContent = item.protocolo;
    header.appendChild(protocoloSpan);

    const statusBadge = document.createElement('span');
    statusBadge.className = `badge badge-status badge-${item.status.toLowerCase()}`;
    statusBadge.textContent = item.status;
    header.appendChild(statusBadge);

    // Alerta de atraso ou atendimento próximo (US09)
    if (item.status === 'Agendado' && item.data === dataHojeString) {
      if (item.horario < horaAtualString) {
        const badgeAtraso = document.createElement('span');
        badgeAtraso.className = 'badge badge-atrasado';
        badgeAtraso.textContent = '⚠️ Horário Passou';
        header.appendChild(badgeAtraso);
      } else {
        const partesAg = item.horario.split(':').map(Number);
        const minutosAg = partesAg[0] * 60 + partesAg[1];
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
        const diferencaMinutos = minutosAg - minutosAgora;

        if (diferencaMinutos >= 0 && diferencaMinutos <= 15) {
          const badgeProximo = document.createElement('span');
          badgeProximo.className = 'badge badge-em-breve';
          badgeProximo.textContent = `🔔 Em ${diferencaMinutos} min!`;
          header.appendChild(badgeProximo);
        }
      }
    }

    card.appendChild(header);

    // Corpo do Card: Informações do Pet e Tutor
    const corpo = document.createElement('div');
    corpo.className = 'card-corpo';

    const infoPet = document.createElement('h3');
    infoPet.className = 'card-pet-nome';
    infoPet.textContent = `${item.pet} `;

    const especieBadge = document.createElement('span');
    especieBadge.className = 'badge badge-especie';
    especieBadge.textContent = item.especie;
    infoPet.appendChild(especieBadge);
    corpo.appendChild(infoPet);

    const infoTutor = document.createElement('p');
    infoTutor.className = 'card-info-tutor';
    infoTutor.textContent = `Tutor: ${item.tutor} • ${item.telefone}`;
    corpo.appendChild(infoTutor);

    const infoServico = document.createElement('p');
    infoServico.className = 'card-info-servico';
    infoServico.textContent = `Serviço: ${item.servicoNome}`;
    corpo.appendChild(infoServico);

    // Atendimento domiciliar (US04 / US07)
    if (item.tipo === 'domiciliar' && item.endereco) {
      const infoEndereco = document.createElement('p');
      infoEndereco.className = 'card-info-endereco';
      const end = item.endereco;
      const textoEnd = `🏠 Domicílio: ${end.logradouro || ''}, ${end.numero || ''} ${end.complemento ? '(' + end.complemento + ')' : ''} - ${end.bairro || ''}, ${end.cidade || ''}/${end.uf || ''} (Taxa +R$ ${Number(item.taxaDeslocamento || 30).toFixed(2)})`;
      infoEndereco.textContent = textoEnd;
      corpo.appendChild(infoEndereco);
    }

    if (item.observacoes && item.observacoes.trim() !== '') {
      const obs = document.createElement('p');
      obs.className = 'card-observacoes';
      obs.textContent = `Obs: ${item.observacoes}`;
      corpo.appendChild(obs);
    }

    card.appendChild(corpo);

    // Rodapé com valor e botões de ação (US06)
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const valorSpan = document.createElement('div');
    valorSpan.className = 'card-valor';
    valorSpan.textContent = `Total: R$ ${instancia.calcularValor().toFixed(2)}`;
    footer.appendChild(valorSpan);

    const grupoAcoes = document.createElement('div');
    grupoAcoes.className = 'card-acoes';

    if (item.status === 'Agendado') {
      const btnConcluir = document.createElement('button');
      btnConcluir.type = 'button';
      btnConcluir.className = 'btn btn-pequeno btn-sucesso';
      btnConcluir.textContent = '✓ Concluir';
      btnConcluir.setAttribute('aria-label', `Concluir atendimento de ${item.pet}`);
      btnConcluir.addEventListener('click', () => aoAlterarStatus(item.id, 'Concluído'));
      grupoAcoes.appendChild(btnConcluir);

      const btnCancelar = document.createElement('button');
      btnCancelar.type = 'button';
      btnCancelar.className = 'btn btn-pequeno btn-perigo';
      btnCancelar.textContent = '✕ Cancelar';
      btnCancelar.setAttribute('aria-label', `Cancelar atendimento de ${item.pet}`);
      btnCancelar.addEventListener('click', () => aoAlterarStatus(item.id, 'Cancelado'));
      grupoAcoes.appendChild(btnCancelar);
    } else {
      const btnReabrir = document.createElement('button');
      btnReabrir.type = 'button';
      btnReabrir.className = 'btn btn-pequeno btn-secundario';
      btnReabrir.textContent = '↺ Reabrir';
      btnReabrir.setAttribute('aria-label', `Reabrir agendamento de ${item.pet}`);
      btnReabrir.addEventListener('click', () => aoAlterarStatus(item.id, 'Agendado'));
      grupoAcoes.appendChild(btnReabrir);
    }

    footer.appendChild(grupoAcoes);
    card.appendChild(footer);

    // Efeito de seleção com teclado ou mouse
    card.addEventListener('click', () => {
      document.querySelectorAll('.card-agendamento').forEach(c => c.classList.remove('card-selecionado'));
      card.classList.add('card-selecionado');
    });

    container.appendChild(card);
  });
}

/**
 * Renderiza o painel consolidado do fechamento do dia (US07).
 * @param {Array<Object>} agendamentos
 * @param {string} dataAlvo
 */
export function renderizarFechamentoDia(agendamentos, dataAlvo) {
  const container = document.getElementById('conteudo-fechamento');
  if (!container) return;

  const fechamento = calcularFechamentoDia(agendamentos, dataAlvo);
  container.textContent = '';

  const gridResumo = document.createElement('div');
  gridResumo.className = 'grid-metricas';

  // Card 1: Faturamento dos Concluídos
  const cardFat = criarMetricaCard('Faturamento Concluído', `R$ ${fechamento.faturamentoConcluidos.toFixed(2)}`, 'fat-positivo');
  // Card 2: Total Atendimentos
  const cardTot = criarMetricaCard('Total do Dia', `${fechamento.totalAgendamentos} pets`, 'tot-geral');
  // Card 3: Concluídos
  const cardConcl = criarMetricaCard('Concluídos', `${fechamento.totalConcluidos}`, 'badge-concluído');
  // Card 4: Cancelados
  const cardCanc = criarMetricaCard('Cancelados', `${fechamento.totalCancelados}`, 'badge-cancelado');

  gridResumo.appendChild(cardFat);
  gridResumo.appendChild(cardTot);
  gridResumo.appendChild(cardConcl);
  gridResumo.appendChild(cardCanc);
  container.appendChild(gridResumo);

  // Breakdown por Serviço
  const secaoServicos = document.createElement('div');
  secaoServicos.className = 'fechamento-servicos-lista';

  const tituloServicos = document.createElement('h3');
  tituloServicos.textContent = 'Detalhamento por Serviço';
  secaoServicos.appendChild(tituloServicos);

  const listaUl = document.createElement('ul');
  listaUl.className = 'lista-servicos-fechamento';

  const servicosNomes = Object.keys(fechamento.quantidadePorServico);
  if (servicosNomes.length === 0) {
    const liVazio = document.createElement('li');
    liVazio.textContent = 'Nenhum atendimento registrado nesta data.';
    listaUl.appendChild(liVazio);
  } else {
    servicosNomes.forEach(nome => {
      const qtd = fechamento.quantidadePorServico[nome];
      const fat = fechamento.faturamentoPorServico[nome] || 0;
      const li = document.createElement('li');

      const spanNome = document.createElement('span');
      spanNome.className = 'fechamento-srv-nome';
      spanNome.textContent = nome;

      const spanQtd = document.createElement('span');
      spanQtd.className = 'fechamento-srv-qtd';
      spanQtd.textContent = `${qtd}x`;

      const spanFat = document.createElement('span');
      spanFat.className = 'fechamento-srv-fat';
      spanFat.textContent = `R$ ${fat.toFixed(2)}`;

      li.appendChild(spanNome);
      li.appendChild(spanQtd);
      li.appendChild(spanFat);
      listaUl.appendChild(li);
    });
  }

  secaoServicos.appendChild(listaUl);
  container.appendChild(secaoServicos);
}

function criarMetricaCard(rotulo, valor, classeDestaque = '') {
  const div = document.createElement('div');
  div.className = `card-metrica ${classeDestaque}`;

  const label = document.createElement('span');
  label.className = 'metrica-label';
  label.textContent = rotulo;

  const val = document.createElement('span');
  val.className = 'metrica-valor';
  val.textContent = valor;

  div.appendChild(label);
  div.appendChild(val);
  return div;
}

/**
 * Atualiza o relógio digital no cabeçalho e calcula o tempo até o próximo atendimento (US09).
 * @param {Array<Object>} agendamentos
 * @param {string} dataHoje
 */
export function atualizarRelogioEProximoAtendimento(agendamentos, dataHoje) {
  const elRelogio = document.getElementById('relogio-digital');
  const elBadgeProximo = document.getElementById('badge-proximo-atendimento');

  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const segundos = String(agora.getSeconds()).padStart(2, '0');

  if (elRelogio) {
    elRelogio.textContent = `${horas}:${minutos}:${segundos}`;
  }

  if (elBadgeProximo) {
    const horaAtualString = `${horas}:${minutos}`;
    const agendadosHoje = agendamentos.filter(
      item => item.data === dataHoje && item.status === 'Agendado'
    );

    agendadosHoje.sort((a, b) => a.horario.localeCompare(b.horario));
    const proximo = agendadosHoje.find(a => a.horario >= horaAtualString);

    if (!proximo) {
      elBadgeProximo.textContent = 'Sem agendamentos pendentes hoje';
      elBadgeProximo.className = 'badge-header badge-header-neutro';
    } else {
      const partesHora = proximo.horario.split(':').map(Number);
      const minutosProximo = partesHora[0] * 60 + partesHora[1];
      const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();
      const dif = minutosProximo - minutosAtuais;

      if (dif <= 0) {
        elBadgeProximo.textContent = `Próximo: ${proximo.pet} (Agora! ${proximo.horario})`;
        elBadgeProximo.className = 'badge-header badge-header-alerta';
      } else {
        elBadgeProximo.textContent = `Próximo atendimento em ${dif} min (${proximo.pet} às ${proximo.horario})`;
        elBadgeProximo.className = dif <= 15 ? 'badge-header badge-header-alerta' : 'badge-header badge-header-ativo';
      }
    }
  }
}

/**
 * Abre modal com JSON exportado formatado para cópia e download (US08).
 * @param {Array<Object>} agendamentos
 */
export function abrirModalExportacao(agendamentos) {
  const modal = document.getElementById('modal-exportacao');
  const textarea = document.getElementById('textarea-exportacao');
  if (!modal || !textarea) return;

  const json = exportarAgendaJsonFormatado(agendamentos);
  textarea.value = json;
  modal.hidden = false;
  textarea.select();
}

export function fecharModalExportacao() {
  const modal = document.getElementById('modal-exportacao');
  if (modal) modal.hidden = true;
}
