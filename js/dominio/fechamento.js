import { criarAgendamento } from './agendamento.js';

export function calcularFechamentoDia(agendamentos = [], dataAlvo = null, horaReferencia = null) {
  if (!Array.isArray(agendamentos)) {
    throw new TypeError('A lista de agendamentos deve ser um array.');
  }

  const listaInstanciada = agendamentos.map(item => {
    return typeof item.calcularValor === 'function' ? item : criarAgendamento(item);
  });

  const dataHojeIso = new Date().toISOString().slice(0, 10);
  const dataFiltro = dataAlvo || (listaInstanciada.length > 0 ? listaInstanciada[0].data : dataHojeIso);

  const agendamentosDoDia = listaInstanciada.filter(ag => ag.data === dataFiltro);

  const ordenadosPorHorario = [...agendamentosDoDia].sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });

  const concluidos = ordenadosPorHorario.filter(ag => ag.status === 'Concluído');
  const cancelados = ordenadosPorHorario.filter(ag => ag.status === 'Cancelado');
  const pendentes = ordenadosPorHorario.filter(ag => ag.status === 'Agendado');

  const faturamentoConcluidos = concluidos.reduce((acumulador, ag) => {
    return acumulador + ag.calcularValor();
  }, 0);

  const faturamentoPrevisto = ordenadosPorHorario.reduce((acumulador, ag) => {
    if (ag.status !== 'Cancelado') {
      return acumulador + ag.calcularValor();
    }
    return acumulador;
  }, 0);

  const quantidadePorServico = {};
  const faturamentoPorServico = {};

  for (const ag of ordenadosPorHorario) {
    const nome = ag.servicoNome || 'Outro';
    quantidadePorServico[nome] = (quantidadePorServico[nome] || 0) + 1;

    if (ag.status === 'Concluído') {
      faturamentoPorServico[nome] = (faturamentoPorServico[nome] || 0) + ag.calcularValor();
    }
  }

  let proximoAtendimento = null;
  if (horaReferencia) {
    proximoAtendimento = pendentes.find(ag => ag.horario >= horaReferencia) || null;
  }
  if (!proximoAtendimento && pendentes.length > 0) {
    proximoAtendimento = pendentes[0];
  }

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
