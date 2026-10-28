/**
 * js/app.js
 * Ponto de entrada da aplicação web no navegador (ES Modules).
 * Orquestra eventos, ciclo de vida, persistência e integrações.
 */

import { carregarServicosApi, consultarCepApi, verificarSeDataEFeriado } from './api.js';
import {
  salvarAgendaStorage,
  carregarAgendaStorage,
  salvarPreferencia,
  carregarPreferencia,
  CHAVES,
  limparDadosProjeto,
  baixarArquivoAgendaJson
} from './storage.js';
import {
  validarDadosAgendamento,
  verificarConflitoHorario
} from './dominio/regras.js';
import { criarGeradorProtocolo, criarAgendamento } from './dominio/agendamento.js';
import {
  exibirToast,
  renderizarCatalogoServicos,
  renderizarCarregandoCatalogo,
  renderizarErroCatalogo,
  renderizarListaAgendamentos,
  renderizarFechamentoDia,
  atualizarRelogioEProximoAtendimento,
  abrirModalExportacao,
  fecharModalExportacao
} from './ui.js';

// Estado global da aplicação na sessão
const estado = {
  servicos: [],
  agendamentos: [],
  geradorProtocolo: null,
  filtroStatus: 'Todos',
  termoBusca: '',
  dataFiltro: '',
  lembretesAtivos: true,
  timerIntervalId: null,
  feriadoConfirmadoParaData: null
};

/**
 * Inicialização principal após carregamento do DOM.
 */
document.addEventListener('DOMContentLoaded', async () => {
  inicializarTema();
  inicializarDataHoje();
  configurarEventosTeclado();
  configurarEventosFormulario();
  configurarEventosFiltros();
  configurarEventosExportacao();
  configurarLembretesETimer();

  await carregarCatalogo();
  await inicializarBaseDeDados();

  atualizarInterfaceCompleta();
});

/**
 * Aplica o tema salvo (claro/escuro) ou preferência do sistema.
 */
function inicializarTema() {
  const temaSalvo = carregarPreferencia(CHAVES.TEMA, 'claro');
  document.documentElement.dataset.tema = temaSalvo;
  const btnTema = document.getElementById('btn-alternar-tema');
  if (btnTema) {
    btnTema.textContent = temaSalvo === 'escuro' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    btnTema.addEventListener('click', () => {
      const novoTema = document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro';
      document.documentElement.dataset.tema = novoTema;
      salvarPreferencia(CHAVES.TEMA, novoTema);
      btnTema.textContent = novoTema === 'escuro' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
      exibirToast(`Tema alternado para ${novoTema}.`, 'aviso', 2000);
    });
  }
}

/**
 * Define a data inicial como hoje nos inputs pertinentes.
 */
function inicializarDataHoje() {
  const hojeIso = new Date().toISOString().slice(0, 10);
  const inputData = document.getElementById('data');
  const inputFiltroData = document.getElementById('filtro-data');

  if (inputData) {
    inputData.min = hojeIso;
    inputData.value = hojeIso;
  }
  if (inputFiltroData) {
    inputFiltroData.value = hojeIso;
    estado.dataFiltro = hojeIso;
  }
}

/**
 * Carrega o catálogo de serviços tratando os 3 estados (US02).
 */
async function carregarCatalogo() {
  renderizarCarregandoCatalogo();
  try {
    const servicos = await carregarServicosApi();
    estado.servicos = servicos;
    renderizarCatalogoServicos(servicos);
  } catch (erro) {
    renderizarErroCatalogo(erro.message, () => carregarCatalogo());
  }
}

/**
 * Carrega a agenda do localStorage ou inicializa com a carga inicial de apoio (US08 / US11).
 */
async function inicializarBaseDeDados() {
  const agendaSalva = carregarAgendaStorage();

  if (agendaSalva && agendaSalva.length > 0) {
    estado.agendamentos = agendaSalva;
  } else {
    // Busca do arquivo mock inicial
    try {
      const resp = await fetch('data/agenda-exemplo.json');
      if (resp.ok) {
        const dadosExemplo = await resp.json();
        estado.agendamentos = dadosExemplo;
        salvarAgendaStorage(dadosExemplo);
      }
    } catch (e) {
      console.warn('Não foi possível carregar agenda-exemplo.json inicial:', e);
      estado.agendamentos = [];
    }
  }

  // Inicializa a closure do protocolo sequencial identificando o maior índice existente
  let maiorNumero = 0;
  estado.agendamentos.forEach(item => {
    if (item.protocolo && item.protocolo.startsWith('AP-')) {
      const num = parseInt(item.protocolo.replace('AP-', ''), 10);
      if (!isNaN(num) && num > maiorNumero) maiorNumero = num;
    }
  });
  estado.geradorProtocolo = criarGeradorProtocolo(maiorNumero + 1);

  // Restaura filtro ativo persistido
  const filtroSalvo = carregarPreferencia(CHAVES.FILTRO, 'Todos');
  estado.filtroStatus = filtroSalvo;
  marcarBotaoFiltroAtivo(filtroSalvo);
}

/**
 * Atualiza todos os componentes visuais vinculados ao estado.
 */
function atualizarInterfaceCompleta() {
  renderizarListaAgendamentos(estado.agendamentos, {
    termoBusca: estado.termoBusca,
    filtroStatus: estado.filtroStatus,
    dataSelecionada: estado.dataFiltro,
    aoAlterarStatus: alterarStatusAgendamento
  });

  renderizarFechamentoDia(estado.agendamentos, estado.dataFiltro);
  atualizarRelogioEProximoAtendimento(estado.agendamentos, estado.dataFiltro);
}

/**
 * Altera o status de um agendamento e persiste (US06 / US08).
 */
function alterarStatusAgendamento(id, novoStatus) {
  const index = estado.agendamentos.findIndex(ag => ag.id === id);
  if (index !== -1) {
    estado.agendamentos[index].status = novoStatus;
    salvarAgendaStorage(estado.agendamentos);
    atualizarInterfaceCompleta();
    exibirToast(`Atendimento atualizado para "${novoStatus}".`, 'sucesso');
  }
}

/**
 * Configura atalhos globais de teclado (US06).
 * 'N' -> Foca no form de novo agendamento
 * '/' -> Foca no campo de busca da agenda
 * 'Esc' -> Limpa a busca
 */
function configurarEventosTeclado() {
  window.addEventListener('keydown', evento => {
    // Ignora quando o foco já estiver em um input, textarea ou select
    const tagAtiva = (document.activeElement && document.activeElement.tagName) || '';
    const digitando = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagAtiva);

    if (evento.key === '/' && !digitando) {
      evento.preventDefault();
      const inputBusca = document.getElementById('campo-busca');
      if (inputBusca) inputBusca.focus();
    } else if ((evento.key === 'n' || evento.key === 'N') && !digitando) {
      evento.preventDefault();
      const inputTutor = document.getElementById('tutor');
      if (inputTutor) {
        inputTutor.focus();
        inputTutor.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (evento.key === 'Escape') {
      const inputBusca = document.getElementById('campo-busca');
      if (inputBusca && (inputBusca === document.activeElement || inputBusca.value !== '')) {
        inputBusca.value = '';
        estado.termoBusca = '';
        atualizarInterfaceCompleta();
        inputBusca.blur();
      }
      fecharModalExportacao();
    }
  });
}

/**
 * Configura formulário de novo agendamento, máscaras, CEP e alertas (US03, US04, US05).
 */
function configurarEventosFormulario() {
  const form = document.getElementById('form-agendamento');
  const selectServico = document.getElementById('servico');
  const checkDomicilio = document.getElementById('check-domicilio');
  const containerEndereco = document.getElementById('container-endereco');
  const inputCep = document.getElementById('cep');
  const feedbackCep = document.getElementById('feedback-cep');
  const inputTelefone = document.getElementById('telefone');
  const inputData = document.getElementById('data');
  const alertaFeriadoBox = document.getElementById('alerta-feriado-box');

  // Máscara de telefone brasileiro (99) 99999-9999
  if (inputTelefone) {
    inputTelefone.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 6) {
        e.target.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        e.target.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        e.target.value = `(${v}`;
      } else {
        e.target.value = '';
      }
    });
  }

  // Máscara e consulta automática de CEP (US04)
  if (inputCep) {
    inputCep.addEventListener('input', async e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      e.target.value = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;

      if (v.length === 8) {
        feedbackCep.textContent = 'Consultando CEP no ViaCEP...';
        feedbackCep.className = 'feedback-campo feedback-carregando';

        const resultado = await consultarCepApi(v);
        if (resultado.sucesso) {
          feedbackCep.textContent = '✓ Endereço preenchido automaticamente!';
          feedbackCep.className = 'feedback-campo feedback-sucesso';

          document.getElementById('logradouro').value = resultado.dados.logradouro;
          document.getElementById('bairro').value = resultado.dados.bairro;
          document.getElementById('cidade').value = resultado.dados.cidade;
          document.getElementById('uf').value = resultado.dados.uf;
          if (resultado.dados.complemento && !document.getElementById('complemento').value) {
            document.getElementById('complemento').value = resultado.dados.complemento;
          }
          document.getElementById('numero').focus();
        } else {
          feedbackCep.textContent = resultado.erro;
          feedbackCep.className = 'feedback-campo feedback-erro';
        }
      } else {
        feedbackCep.textContent = '';
      }
    });
  }

  // Controle de atendimento domiciliar vinculado ao serviço
  if (selectServico && checkDomicilio) {
    selectServico.addEventListener('change', () => {
      const srvId = selectServico.value;
      const srv = estado.servicos.find(s => s.id === srvId);

      if (srv && !srv.aceitaDomicilio) {
        checkDomicilio.checked = false;
        checkDomicilio.disabled = true;
        if (containerEndereco) containerEndereco.hidden = true;
        document.getElementById('aviso-domicilio-indisponivel').hidden = false;
      } else {
        checkDomicilio.disabled = false;
        document.getElementById('aviso-domicilio-indisponivel').hidden = true;
      }
    });

    checkDomicilio.addEventListener('change', () => {
      if (containerEndereco) {
        containerEndereco.hidden = !checkDomicilio.checked;
        if (checkDomicilio.checked) {
          inputCep.focus();
        }
      }
    });
  }

  // Alerta de Feriado na escolha da data (US05)
  if (inputData && alertaFeriadoBox) {
    inputData.addEventListener('change', async () => {
      alertaFeriadoBox.hidden = true;
      alertaFeriadoBox.textContent = '';
      estado.feriadoConfirmadoParaData = null;

      const dataEscolhida = inputData.value;
      if (!dataEscolhida) return;

      const resFeriado = await verificarSeDataEFeriado(dataEscolhida);
      if (resFeriado.ehFeriado) {
        alertaFeriadoBox.hidden = false;
        alertaFeriadoBox.className = 'alerta-feriado';
        alertaFeriadoBox.setAttribute('role', 'alert');
        alertaFeriadoBox.innerHTML = `<strong>⚠️ Atenção:</strong> A data escolhida é <strong>${resFeriado.nomeFeriado}</strong>. Confirme com o tutor antes de prosseguir.`;
      } else if (resFeriado.aviso) {
        alertaFeriadoBox.hidden = false;
        alertaFeriadoBox.className = 'alerta-feriado alerta-feriado-info';
        alertaFeriadoBox.textContent = resFeriado.aviso;
      }
    });
  }

  // Submissão do Formulário de Agendamento (US03)
  if (form) {
    form.addEventListener('submit', async evento => {
      evento.preventDefault();
      limparErrosFormulario();

      const srvId = selectServico.value;
      const servicoObj = estado.servicos.find(s => s.id === srvId) || { nome: 'Outro', preco: 0 };
      const ehDomicilio = checkDomicilio.checked;

      const dados = {
        tutor: document.getElementById('tutor').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        pet: document.getElementById('pet').value.trim(),
        especie: document.getElementById('especie').value,
        servicoId: srvId,
        servicoNome: servicoObj.nome,
        valor: servicoObj.preco,
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        observacoes: document.getElementById('observacoes').value.trim(),
        tipo: ehDomicilio ? 'domiciliar' : 'presencial',
        atendimentoDomiciliar: ehDomicilio,
        endereco: ehDomicilio ? {
          cep: document.getElementById('cep').value.trim(),
          logradouro: document.getElementById('logradouro').value.trim(),
          numero: document.getElementById('numero').value.trim(),
          complemento: document.getElementById('complemento').value.trim(),
          bairro: document.getElementById('bairro').value.trim(),
          cidade: document.getElementById('cidade').value.trim(),
          uf: document.getElementById('uf').value.trim()
        } : null
      };

      // 1. Validação de regras de negócio
      const resultadoValidacao = validarDadosAgendamento(dados, estado.agendamentos);

      if (!resultadoValidacao.valido) {
        exibirErrosFormulario(resultadoValidacao.erros);
        return;
      }

      // 2. Confirmação de feriado (US05)
      const resFeriado = await verificarSeDataEFeriado(dados.data);
      if (resFeriado.ehFeriado && estado.feriadoConfirmadoParaData !== dados.data) {
        const confirmar = window.confirm(
          `A data ${dados.data} é feriado nacional (${resFeriado.nomeFeriado}).\n\nDeseja realmente salvar este agendamento no feriado?`
        );
        if (!confirmar) {
          exibirToast('Agendamento cancelado pelo atendente (data de feriado).', 'aviso');
          return;
        }
        estado.feriadoConfirmadoParaData = dados.data;
      }

      // 3. Criação do protocolo sequencial via closure
      const protocolo = estado.geradorProtocolo();
      const id = `ag-${Date.now()}`;

      const novoAgendamentoInstancia = criarAgendamento({
        ...dados,
        id,
        protocolo,
        status: 'Agendado'
      });

      // 4. Salva no estado e localStorage
      estado.agendamentos.push(novoAgendamentoInstancia.toJSON());
      salvarAgendaStorage(estado.agendamentos);

      // 5. Atualiza interface e exibe feedback
      form.reset();
      if (containerEndereco) containerEndereco.hidden = true;
      if (feedbackCep) feedbackCep.textContent = '';
      if (alertaFeriadoBox) alertaFeriadoBox.hidden = true;
      inicializarDataHoje();

      atualizarInterfaceCompleta();
      exibirToast(`Agendamento de ${dados.pet} (${protocolo}) registrado com sucesso!`, 'sucesso');
    });
  }
}

/**
 * Exibe erros nos campos correspondentes e move o foco para o primeiro inválido (US03).
 */
function exibirErrosFormulario(erros) {
  let primeiroElementoInvalido = null;

  erros.forEach(({ campo, mensagem }) => {
    const elCampo = document.getElementById(campo);
    const elErro = document.getElementById(`erro-${campo}`);

    if (elCampo) {
      elCampo.classList.add('campo-invalido');
      elCampo.setAttribute('aria-invalid', 'true');
      if (!primeiroElementoInvalido) {
        primeiroElementoInvalido = elCampo;
      }
    }

    if (elErro) {
      elErro.textContent = mensagem;
      elErro.hidden = false;
      elErro.setAttribute('role', 'alert');
    }
  });

  if (primeiroElementoInvalido) {
    primeiroElementoInvalido.focus();
    primeiroElementoInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  exibirToast('Por favor, corrija os erros apontados no formulário.', 'erro');
}

/**
 * Remove classes de erro e limpa mensagens da tela.
 */
function limparErrosFormulario() {
  document.querySelectorAll('.campo-invalido').forEach(el => {
    el.classList.remove('campo-invalido');
    el.removeAttribute('aria-invalid');
  });
  document.querySelectorAll('.msg-erro-campo').forEach(el => {
    el.textContent = '';
    el.hidden = true;
  });
}

/**
 * Configura botões de filtro por status e campo de busca (US06).
 */
function configurarEventosFiltros() {
  const containerFiltros = document.getElementById('botoes-filtro-status');
  const inputBusca = document.getElementById('campo-busca');
  const inputFiltroData = document.getElementById('filtro-data');

  if (containerFiltros) {
    containerFiltros.addEventListener('click', e => {
      const btn = e.target.closest('button[data-status]');
      if (!btn) return;

      const novoStatus = btn.dataset.status;
      estado.filtroStatus = novoStatus;
      salvarPreferencia(CHAVES.FILTRO, novoStatus);
      marcarBotaoFiltroAtivo(novoStatus);
      atualizarInterfaceCompleta();
    });
  }

  if (inputBusca) {
    inputBusca.addEventListener('input', e => {
      estado.termoBusca = e.target.value;
      atualizarInterfaceCompleta();
    });
  }

  if (inputFiltroData) {
    inputFiltroData.addEventListener('change', e => {
      estado.dataFiltro = e.target.value;
      atualizarInterfaceCompleta();
    });
  }
}

function marcarBotaoFiltroAtivo(status) {
  document.querySelectorAll('#botoes-filtro-status button').forEach(b => {
    b.classList.toggle('filtro-ativo', b.dataset.status === status);
    b.setAttribute('aria-pressed', b.dataset.status === status ? 'true' : 'false');
  });
}

/**
 * Configura timers de relógio e lembrete com opção de pausar e retomar (US09).
 */
function configurarLembretesETimer() {
  const btnPausar = document.getElementById('btn-pausar-lembretes');

  const executarCicloRelogio = () => {
    atualizarRelogioEProximoAtendimento(estado.agendamentos, estado.dataFiltro);
  };

  // Atualiza imediatamente
  executarCicloRelogio();

  // Atualização periódica a cada 10 segundos via setInterval
  estado.timerIntervalId = setInterval(executarCicloRelogio, 10000);

  if (btnPausar) {
    btnPausar.addEventListener('click', () => {
      if (estado.lembretesAtivos) {
        clearInterval(estado.timerIntervalId);
        estado.timerIntervalId = null;
        estado.lembretesAtivos = false;
        btnPausar.textContent = '▶ Retomar Lembretes';
        btnPausar.classList.add('btn-lembretes-pausados');
        exibirToast('Lembretes periódicos pausados.', 'aviso');
      } else {
        estado.timerIntervalId = setInterval(executarCicloRelogio, 10000);
        estado.lembretesAtivos = true;
        btnPausar.textContent = '⏸ Pausar Lembretes';
        btnPausar.classList.remove('btn-lembretes-pausados');
        executarCicloRelogio();
        exibirToast('Lembretes e relógio retomados com sucesso.', 'sucesso');
      }
    });
  }
}

/**
 * Configura botões do modal de exportação e limpeza seletiva (US08).
 */
function configurarEventosExportacao() {
  const btnExportar = document.getElementById('btn-exportar-agenda');
  const btnLimpar = document.getElementById('btn-limpar-dados');
  const btnFecharModal = document.getElementById('btn-fechar-modal-exportacao');
  const btnCopiar = document.getElementById('btn-copiar-json');
  const btnBaixar = document.getElementById('btn-baixar-json');

  if (btnExportar) {
    btnExportar.addEventListener('click', () => abrirModalExportacao(estado.agendamentos));
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', fecharModalExportacao);
  }

  if (btnCopiar) {
    btnCopiar.addEventListener('click', async () => {
      const textarea = document.getElementById('textarea-exportacao');
      if (textarea) {
        try {
          await navigator.clipboard.writeText(textarea.value);
          exibirToast('JSON copiado para a área de transferência!', 'sucesso');
        } catch {
          textarea.select();
          document.execCommand('copy');
          exibirToast('JSON copiado!', 'sucesso');
        }
      }
    });
  }

  if (btnBaixar) {
    btnBaixar.addEventListener('click', () => {
      baixarArquivoAgendaJson(estado.agendamentos);
      exibirToast('Download do arquivo de agenda iniciado.', 'sucesso');
    });
  }

  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      const confirma = window.confirm(
        'Tem certeza que deseja apagar todos os dados da agenda e restaurar os padrões de fábrica?\n\n(Apenas dados do AgendaPet serão excluídos do navegador).'
      );
      if (confirma) {
        limparDadosProjeto();
        location.reload();
      }
    });
  }
}
