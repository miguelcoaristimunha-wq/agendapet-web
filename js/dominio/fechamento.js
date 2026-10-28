/**
 * js/dominio/fechamento.js
 * Lógica pura de cálculo e consolidação do fechamento do dia.
 * Demonstra métodos funcionais de Array (filter, reduce, find, sort, map, some)
 * e estrutura de repetição tradicional (for...of).
 * ATENÇÃO: Sem DOM, sem window, sem fetch e sem localStorage.
 */

import { criarAgendamento } from './agendamento.js';

/**
 * Consolida o fechamento das operações de um determinado dia.
 * 
 * @param {Array<Object>} agendamentos - Lista bruta ou instanciada de agendamentos
 * @param {string} [dataAlvo] - Data no formato YYYY-MM-DD. Se omitida, usa a data do primeiro item ou hoje.
 * @param {string} [horaReferencia] - Hora atual no formato HH:mm para calcular o próximo atendimento
 * @returns {Object} Resumo financeiro e operacional consolidado
 */
export function calcularFechamentoDia(agendamentos = [], dataAlvo = null, horaReferencia = null) {
  if (!Array.isArray(agendamentos)) {
    throw new TypeError('A lista de agendamentos deve ser um array.');
  }

  // 1. Instanciação polimórfica com map
  const listaInstanciada = agendamentos.map(item => {
    return typeof item.calcularValor === 'function' ? item : criarAgendamento(item);
  });

  // Se não foi informada dataAlvo, tenta descobrir a data mais frequente ou usa a data de hoje
  const dataHojeIso = new Date().toISOString().slice(0, 10);
  const dataFiltro = dataAlvo || (listaInstanciada.length > 0 ? listaInstanciada[0].data : dataHojeIso);

  // 2. Filtragem dos agendamentos da data com filter
  const agendamentosDoDia = listaInstanciada.filter(ag => ag.data === dataFiltro);

  // 3. Ordenação cronológica por horário com sort
  const ordenadosPorHorario = [...agendamentosDoDia].sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });

  // 4. Separação por status usando filter
  const concluidos = ordenadosPorHorario.filter(ag => ag.status === 'Concluído');
  const cancelados = ordenadosPorHorario.filter(ag => ag.status === 'Cancelado');
  const pendentes = ordenadosPorHorario.filter(ag => ag.status === 'Agendado');

  // 5. Cálculo do faturamento dos CONCLUÍDOS com reduce (IMPORTANTE: não somar cancelados nem pendentes)
  const faturamentoConcluidos = concluidos.reduce((acumulador, ag) => {
    return acumulador + ag.calcularValor();
  }, 0);

  // Previsão de faturamento total caso todos os agendados venham a ser atendidos
  const faturamentoPrevisto = ordenadosPorHorario.reduce((acumulador, ag) => {
    if (ag.status !== 'Cancelado') {
      return acumulador + ag.calcularValor();
    }
    return acumulador;
  }, 0);

  // 6. Quantidade e faturamento por serviço usando um laço for...of (exigência do item US07)
  const quantidadePorServico = {};
  const faturamentoPorServico = {};

  for (const ag of ordenadosPorHorario) {
    const nome = ag.servicoNome || 'Outro';
    quantidadePorServico[nome] = (quantidadePorServico[nome] || 0) + 1;

    if (ag.status === 'Concluído') {
      faturamentoPorServico[nome] = (faturamentoPorServico[nome] || 0) + ag.calcularValor();
    }
  }

  // 7. Localização do próximo atendimento pendente usando find
  let proximoAtendimento = null;
  if (horaReferencia) {
    proximoAtendimento = pendentes.find(ag => ag.horario >= horaReferencia) || null;
  }
  if (!proximoAtendimento && pendentes.length > 0) {
    proximoAtendimento = pendentes[0];
  }

  // 8. Verificação de integridade usando some e every
  const possuiAtendimentosDomiciliares = ordenadosPorHorario.some(ag => ag.tipo === 'domiciliar');
  const todosPossuemHorarioValido = ordenadosPorHorario.every(ag => typeof ag.horario === 'string' && ag.horario.includes(':'));

  return {
    data: dataFiltro,
    totalAgendamentos: ordenadosPorHorario.length,
    totalConcluidos: concluidos.length,
    totalCancelados: cancelados.length,
    totalAgendados: pendentes.length,
    faturamentoConcluidos: Number(faturamentoConcluidos.toFixed(2)),
    faturamentoPrevisto: Number(faturamentoPrevisto.toFixed(2)),
    quantidadePorServico,
    faturamentoPorServico,
    proximoAtendimento: proximoAtendimento ? proximoAtendimento.toJSON() : null,
    possuiAtendimentosDomiciliares,
    todosPossuemHorarioValido,
    agendamentos: ordenadosPorHorario.map(ag => ag.toJSON())
  };
}
