import { verificarConflitoHorario, filtrarAgendamentos } from './dominio/regras.js';
import { criarAgendamento } from './dominio/agendamento.js';
import { calcularFechamentoDia } from './dominio/fechamento.js';
import { exportarAgendaJsonFormatado, baixarArquivoAgendaJson, limparDadosProjeto } from './storage.js';

let toastTimeoutId = null;

/**
 * Exibe uma notificação flutuante sutil e elegante.
 * Utiliza setTimeout e role="status" / aria-live="polite" para acessibilidade.
 * 
 * @param {string} mensagem
 * @param {'sucesso'|'erro'|'aviso'} [tipo='sucesso']
 * @param {number} [duracaoMs=3500]
 */
export function exibirToast(mensagem, tipo = 'sucesso', duracaoMs = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
    toastTimeoutId = null;
  }

  container.textContent = '';
  container.className = `toast-container toast-${tipo}`;

  const indicador = document.createElement('span');
  indicador.className = 'toast-indicador';
  indicador.setAttribute('aria-hidden', 'true');

  const texto = document.createElement('span');
  texto.className = 'toast-mensagem';
  texto.textContent = mensagem;

  container.appendChild(indicador);
  container.appendChild(texto);
  container.hidden = false;

  toastTimeoutId = setTimeout(() => {
    container.hidden = true;
    container.textContent = '';
    toastTimeoutId = null;
  }, duracaoMs);
}

/**
 * Renderiza o catálogo de serviços de forma limpa, compacta e alinhada.
 * Atende aos 3 estados da US02: Carregando, Erro (com botão) e Sucesso.
 * 
 * @param {Array<Object>} servicos
 * @param {string} servicoSelecionadoAtual
 */
export function renderizarCatalogoServicos(servicos, servicoSelecionadoAtual = '') {
  const container = document.getElementById('catalogo-servicos-container');
  const selectServico = document.getElementById('servico');

  if (!container || !selectServico) return;

  container.textContent = '';
  selectServico.textContent = '';

  const opcaoPadrao = document.createElement('option');
  opcaoPadrao.value = '';
  opcaoPadrao.textContent = 'Selecione um serviço do catálogo';
  selectServico.appendChild(opcaoPadrao);

  if (!servicos || servicos.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'msg-vazia';
    vazio.textContent = 'Nenhum serviço disponível no momento.';
    container.appendChild(vazio);
    return;
  }

  // Renderiza como lista tabular limpa
  servicos.forEach(servico => {
    const item = document.createElement('div');
    item.className = 'item-servico-catalogo';
    item.tabIndex = 0;

    const info = document.createElement('div');
    info.className = 'item-servico-info';

    const linhaSuperior = document.createElement('div');
    linhaSuperior.className = 'item-servico-topo';

    const titulo = document.createElement('span');
    titulo.className = 'item-servico-nome';
    titulo.textContent = servico.nome;

    const duracaoTexto = servico.duracaoMinutos >= 60
      ? `${(servico.duracaoMinutos / 60).toFixed(0)}h`
      : `${servico.duracaoMinutos} min`;

    const duracao = document.createElement('span');
    duracao.className = 'item-servico-duracao';
    duracao.textContent = duracaoTexto;

    linhaSuperior.appendChild(titulo);
    linhaSuperior.appendChild(duracao);

    const desc = document.createElement('p');
    desc.className = 'item-servico-desc';
    desc.textContent = servico.descricao;

    const modalidade = document.createElement('span');
    modalidade.className = servico.aceitaDomicilio ? 'tag-modalidade tag-domiciliar' : 'tag-modalidade tag-presencial';
    modalidade.textContent = servico.aceitaDomicilio ? 'Atende a domicílio' : 'Apenas na loja física';

    info.appendChild(linhaSuperior);
    info.appendChild(desc);
    info.appendChild(modalidade);

    const acao = document.createElement('div');
    acao.className = 'item-servico-acao';

    const preco = document.createElement('span');
    preco.className = 'item-servico-preco';
    preco.textContent = `R$ ${Number(servico.preco).toFixed(2)}`;

    const btnSelecionar = document.createElement('button');
    btnSelecionar.type = 'button';
    btnSelecionar.className = 'btn-selecionar-servico';
    btnSelecionar.textContent = 'Selecionar';
    btnSelecionar.addEventListener('click', () => {
      selectServico.value = servico.id;
      selectServico.dispatchEvent(new Event('change'));
      const inputTutor = document.getElementById('tutor');
      if (inputTutor) inputTutor.focus();
      exibirToast(`Serviço selecionado: ${servico.nome}`, 'aviso', 2200);
    });

    acao.appendChild(preco);
    acao.appendChild(btnSelecionar);

    item.appendChild(info);
    item.appendChild(acao);
    container.appendChild(item);

    // Alimenta o <select>
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

  const texto = document.createElement('p');
  texto.textContent = `Não foi possível carregar os serviços: ${mensagemErro}`;

  const btnReintentar = document.createElement('button');
  btnReintentar.type = 'button';
  btnReintentar.className = 'btn btn-secundario btn-compacto';
  btnReintentar.textContent = 'Tentar novamente';
  btnReintentar.addEventListener('click', callbackTentarNovamente);

  boxErro.appendChild(texto);
  boxErro.appendChild(btnReintentar);
  container.appendChild(boxErro);
}

/**
 * Renderiza o estado de carregamento do catálogo de forma limpa.
 */
export function renderizarCarregandoCatalogo() {
  const container = document.getElementById('catalogo-servicos-container');
  if (!container) return;

  container.textContent = '';
  const loadingBox = document.createElement('div');
  loadingBox.className = 'loading-box';
  loadingBox.setAttribute('aria-live', 'polite');

  const spinner = document.createElement('div');
  spinner.className = 'spinner-linear';

  const texto = document.createElement('p');
  texto.textContent = 'Carregando serviços...';

  loadingBox.appendChild(spinner);
  loadingBox.appendChild(texto);
  container.appendChild(loadingBox);
}

/**
 * Renderiza a lista de agendamentos no painel.
 * Design minimalista e profissional: visual tipo tabela/lista moderna, sem poluição.
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

  
  let filtrados = agendamentos;
  if (dataSelecionada) {
    filtrados = filtrados.filter(item => item.data === dataSelecionada);
  }

  
  if (filtroStatus !== 'Todos') {
    filtrados = filtrarAgendamentos(filtrados, item => item.status === filtroStatus);
  }

  
  if (termoBusca && termoBusca.trim() !== '') {
    const termo = termoBusca.trim().toLowerCase();
    filtrados = filtrados.filter(item => {
      const tutor = (item.tutor || '').toLowerCase();
      const pet = (item.pet || '').toLowerCase();
      const protocolo = (item.protocolo || '').toLowerCase();
      return tutor.includes(termo) || pet.includes(termo) || protocolo.includes(termo);
    });
  }

  
  filtrados.sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));

  
  if (contador) {
    const plural = filtrados.length === 1 ? 'agendamento' : 'agendamentos';
    contador.textContent = `${filtrados.length} ${plural}`;
  }

  
  if (filtrados.length === 0) {
    const cardVazio = document.createElement('div');
    cardVazio.className = 'card-vazio';
    cardVazio.setAttribute('role', 'status');

    const titulo = document.createElement('h3');
    titulo.className = 'card-vazio-titulo';
    titulo.textContent = 'Nenhum agendamento encontrado';

    const subtitulo = document.createElement('p');
    subtitulo.className = 'card-vazio-desc';
    subtitulo.textContent = termoBusca || filtroStatus !== 'Todos'
      ? 'Ajuste os filtros ou limpe o campo de busca com a tecla Esc.'
      : 'Não há registros para a data selecionada. Utilize o formulário ao lado.';

    cardVazio.appendChild(titulo);
    cardVazio.appendChild(subtitulo);
    container.appendChild(cardVazio);
    return;
  }

  
  const agora = new Date();
  const horaAtualString = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  const dataHojeString = agora.toISOString().slice(0, 10);

  filtrados.forEach(item => {
    const instancia = criarAgendamento(item);
    const linha = document.createElement('article');
    linha.className = `linha-agendamento status-${item.status.toLowerCase()}`;
    linha.tabIndex = 0;
    linha.dataset.id = item.id;

    // Coluna 1: Horário e Status
    const colTempo = document.createElement('div');
    colTempo.className = 'col-tempo';

    const horarioSpan = document.createElement('span');
    horarioSpan.className = 'hora-agendamento';
    horarioSpan.textContent = item.horario;
    colTempo.appendChild(horarioSpan);

    const badgeStatus = document.createElement('span');
    badgeStatus.className = `status-pill status-pill-${item.status.toLowerCase()}`;
    badgeStatus.textContent = item.status;
    colTempo.appendChild(badgeStatus);

    // Indicador sutil de atraso ou atendimento iminente
    if (item.status === 'Agendado' && item.data === dataHojeString) {
      if (item.horario < horaAtualString) {
        const badgeAtraso = document.createElement('span');
        badgeAtraso.className = 'tag-alerta-tempo tag-tempo-atrasado';
        badgeAtraso.textContent = 'Atrasado';
        colTempo.appendChild(badgeAtraso);
      } else {
        const partesAg = item.horario.split(':').map(Number);
        const minutosAg = partesAg[0] * 60 + partesAg[1];
        const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
        const difMin = minutosAg - minutosAgora;

        if (difMin >= 0 && difMin <= 15) {
          const badgeImediato = document.createElement('span');
          badgeImediato.className = 'tag-alerta-tempo tag-tempo-breve';
          badgeImediato.textContent = `Em ${difMin} min`;
          colTempo.appendChild(badgeImediato);
        }
      }
    }

    linha.appendChild(colTempo);

    // Coluna 2: Informações do Atendimento
    const colInfo = document.createElement('div');
    colInfo.className = 'col-info';

    const topoInfo = document.createElement('div');
    topoInfo.className = 'topo-info';

    const nomePet = document.createElement('strong');
    nomePet.className = 'nome-pet';
    nomePet.textContent = item.pet;

    const especieTag = document.createElement('span');
    especieTag.className = 'especie-tag';
    especieTag.textContent = item.especie;

    const protocoloSpan = document.createElement('span');
    protocoloSpan.className = 'codigo-protocolo';
    protocoloSpan.textContent = item.protocolo;

    topoInfo.appendChild(nomePet);
    topoInfo.appendChild(especieTag);
    topoInfo.appendChild(protocoloSpan);
    colInfo.appendChild(topoInfo);

    const dadosCliente = document.createElement('div');
    dadosCliente.className = 'dados-cliente-meta';

    const tutorTxt = document.createElement('span');
    tutorTxt.textContent = `Tutor: ${item.tutor} • ${item.telefone}`;

    const servicoTxt = document.createElement('span');
    servicoTxt.className = 'servico-nome-meta';
    servicoTxt.textContent = item.servicoNome;

    dadosCliente.appendChild(tutorTxt);
    dadosCliente.appendChild(servicoTxt);
    colInfo.appendChild(dadosCliente);

    // Endereço domiciliar
    if (item.tipo === 'domiciliar' && item.endereco) {
      const end = item.endereco;
      const endLinha = document.createElement('div');
      endLinha.className = 'endereco-domiciliar-meta';
      endLinha.textContent = `Domicílio: ${end.logradouro || ''}, ${end.numero || 'S/N'}${end.complemento ? ' (' + end.complemento + ')' : ''} — ${end.bairro || ''}, ${end.cidade || ''}/${end.uf || ''}`;
      colInfo.appendChild(endLinha);
    }

    if (item.observacoes && item.observacoes.trim() !== '') {
      const obsLinha = document.createElement('p');
      obsLinha.className = 'observacoes-meta';
      obsLinha.textContent = item.observacoes;
      colInfo.appendChild(obsLinha);
    }

    linha.appendChild(colInfo);

    // Coluna 3: Valor e Ações Rápidas
    const colAcoes = document.createElement('div');
    colAcoes.className = 'col-acoes';

    const valorSpan = document.createElement('span');
    valorSpan.className = 'valor-agendamento';
    valorSpan.textContent = `R$ ${instancia.calcularValor().toFixed(2)}`;
    colAcoes.appendChild(valorSpan);

    const botoesArea = document.createElement('div');
    botoesArea.className = 'botoes-acao-linha';

    if (item.status === 'Agendado') {
      const btnConcluir = document.createElement('button');
      btnConcluir.type = 'button';
      btnConcluir.className = 'btn-acao-status btn-status-concluir';
      btnConcluir.textContent = 'Concluir';
      btnConcluir.setAttribute('aria-label', `Concluir atendimento de ${item.pet}`);
      btnConcluir.addEventListener('click', () => aoAlterarStatus(item.id, 'Concluído'));
      botoesArea.appendChild(btnConcluir);

      const btnCancelar = document.createElement('button');
      btnCancelar.type = 'button';
      btnCancelar.className = 'btn-acao-status btn-status-cancelar';
      btnCancelar.textContent = 'Cancelar';
      btnCancelar.setAttribute('aria-label', `Cancelar atendimento de ${item.pet}`);
      btnCancelar.addEventListener('click', () => aoAlterarStatus(item.id, 'Cancelado'));
      botoesArea.appendChild(btnCancelar);
    } else {
      const btnReabrir = document.createElement('button');
      btnReabrir.type = 'button';
      btnReabrir.className = 'btn-acao-status btn-status-reabrir';
      btnReabrir.textContent = 'Reabrir';
      btnReabrir.setAttribute('aria-label', `Reabrir atendimento de ${item.pet}`);
      btnReabrir.addEventListener('click', () => aoAlterarStatus(item.id, 'Agendado'));
      botoesArea.appendChild(btnReabrir);
    }

    colAcoes.appendChild(botoesArea);
    linha.appendChild(colAcoes);

    // Seleção com foco / clique
    linha.addEventListener('click', () => {
      document.querySelectorAll('.linha-agendamento').forEach(c => c.classList.remove('linha-selecionada'));
      linha.classList.add('linha-selecionada');
    });

    container.appendChild(linha);
  });
}

/**
 * Renderiza o painel consolidado do fechamento do dia.
 * Design executivo, limpo e direto.
 * 
 * @param {Array<Object>} agendamentos
 * @param {string} dataAlvo
 */
export function renderizarFechamentoDia(agendamentos, dataAlvo) {
  const container = document.getElementById('conteudo-fechamento');
  if (!container) return;

  const fechamento = calcularFechamentoDia(agendamentos, dataAlvo);
  container.textContent = '';

  
  const gridResumo = document.createElement('div');
  gridResumo.className = 'grid-metricas-executivo';

  gridResumo.appendChild(criarMetricaCard('Receita concluída', `R$ ${fechamento.faturamentoConcluidos.toFixed(2)}`, 'metrica-destaque'));
  gridResumo.appendChild(criarMetricaCard('Total agendado', `${fechamento.totalAgendamentos}`, 'metrica-neutra'));
  gridResumo.appendChild(criarMetricaCard('Concluídos', `${fechamento.totalConcluidos}`, 'metrica-concluido'));
  gridResumo.appendChild(criarMetricaCard('Cancelados', `${fechamento.totalCancelados}`, 'metrica-cancelado'));

  container.appendChild(gridResumo);

  
  const secaoServicos = document.createElement('div');
  secaoServicos.className = 'fechamento-servicos-bloco';

  const cabecalhoLista = document.createElement('div');
  cabecalhoLista.className = 'servicos-bloco-cabecalho';

  const tituloServicos = document.createElement('h3');
  tituloServicos.textContent = 'Distribuição por serviço';
  cabecalhoLista.appendChild(tituloServicos);
  secaoServicos.appendChild(cabecalhoLista);

  const listaUl = document.createElement('ul');
  listaUl.className = 'lista-servicos-tabela';

  const servicosNomes = Object.keys(fechamento.quantidadePorServico);
  if (servicosNomes.length === 0) {
    const liVazio = document.createElement('li');
    liVazio.className = 'item-servico-vazio';
    liVazio.textContent = 'Nenhum atendimento na data selecionada.';
    listaUl.appendChild(liVazio);
  } else {
    servicosNomes.forEach(nome => {
      const qtd = fechamento.quantidadePorServico[nome];
      const fat = fechamento.faturamentoPorServico[nome] || 0;
      const li = document.createElement('li');
      li.className = 'linha-tabela-servico';

      const spanNome = document.createElement('span');
      spanNome.className = 'tb-srv-nome';
      spanNome.textContent = nome;

      const spanQtd = document.createElement('span');
      spanQtd.className = 'tb-srv-qtd';
      spanQtd.textContent = `${qtd} atend.`;

      const spanFat = document.createElement('span');
      spanFat.className = 'tb-srv-valor';
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

function criarMetricaCard(rotulo, valor, classeModificador = '') {
  const div = document.createElement('div');
  div.className = `card-kpi ${classeModificador}`;

  const label = document.createElement('span');
  label.className = 'kpi-rotulo';
  label.textContent = rotulo;

  const val = document.createElement('span');
  val.className = 'kpi-valor';
  val.textContent = valor;

  div.appendChild(label);
  div.appendChild(val);
  return div;
}

/**
 * Atualiza o relógio digital no cabeçalho e calcula o tempo até o próximo atendimento.
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
      elBadgeProximo.textContent = 'Sem agendamentos pendentes';
      elBadgeProximo.className = 'badge-header badge-header-neutro';
    } else {
      const partesHora = proximo.horario.split(':').map(Number);
      const minutosProximo = partesHora[0] * 60 + partesHora[1];
      const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();
      const dif = minutosProximo - minutosAtuais;

      if (dif <= 0) {
        elBadgeProximo.textContent = `Próximo: ${proximo.pet} (${proximo.horario})`;
        elBadgeProximo.className = 'badge-header badge-header-atraso';
      } else {
        elBadgeProximo.textContent = `Próximo em ${dif} min: ${proximo.pet} (${proximo.horario})`;
        elBadgeProximo.className = dif <= 15 ? 'badge-header badge-header-alerta' : 'badge-header badge-header-ativo';
      }
    }
  }
}

/**
 * Abre modal com JSON exportado formatado para cópia e download.
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
