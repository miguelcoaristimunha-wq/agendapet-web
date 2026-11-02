export const HORARIO_ABERTURA = '08:00';
export const HORARIO_FECHAMENTO = '19:00';

/**
 * Valida formato de telefone com DDD (10 ou 11 digitos).
 */
export function validarTelefone(telefone) {
  if (!telefone || typeof telefone !== 'string') return false;
  const digitos = telefone.replace(/\D/g, '');
  return digitos.length === 10 || digitos.length === 11;
}

/**
 * Valida se a data selecionada nao pertence ao passado.
 */
export function validarDataNaoPassada(dataString, dataReferencia = new Date()) {
  if (!dataString || typeof dataString !== 'string') return false;
  const partes = dataString.split('-').map(Number);
  if (partes.length !== 3 || partes.some(isNaN)) return false;

  const [ano, mes, dia] = partes;
  const dataAlvo = new Date(ano, mes - 1, dia);

  const hoje = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    dataReferencia.getDate()
  );

  return dataAlvo >= hoje;
}

/**
 * Verifica se o horario esta dentro do expediente (08:00 as 19:00).
 */
export function validarHorarioFuncionamento(horario) {
  if (!horario || typeof horario !== 'string') return false;
  const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regexHora.test(horario)) return false;

  return horario >= HORARIO_ABERTURA && horario <= HORARIO_FECHAMENTO;
}

/**
 * Detecta conflito de horario entre agendamentos ativos.
 */
export function verificarConflitoHorario(agendamentos, data, horario, idIgnorar = null) {
  if (!Array.isArray(agendamentos)) return false;

  return agendamentos.some(item => {
    if (idIgnorar && item.id === idIgnorar) return false;
    const statusAtivo = item.status === 'Agendado';
    return statusAtivo && item.data === data && item.horario === horario;
  });
}

/**
 * Funcao de alta ordem para filtragem flexivel por predicado.
 */
export function filtrarAgendamentos(lista, criterioCallback) {
  if (!Array.isArray(lista)) return [];
  if (typeof criterioCallback !== 'function') {
    throw new TypeError('O critério de filtragem precisa ser uma função de callback.');
  }

  const resultado = [];
  for (let i = 0; i < lista.length; i++) {
    if (criterioCallback(lista[i], i, lista)) {
      resultado.push(lista[i]);
    }
  }
  return resultado;
}

/**
 * Validação estrutural completa de um payload de agendamento antes de salvar.
 * Retorna os campos com erro e as mensagens descritivas amigáveis.
 * 
 * @param {Object} dados
 * @param {Array<Object>} agendamentosExistentes
 * @returns {{ valido: boolean, erros: Array<{ campo: string, mensagem: string }> }}
 */
export function validarDadosAgendamento(dados, agendamentosExistentes = []) {
  const erros = [];

  if (!dados.tutor || dados.tutor.trim().length < 3) {
    erros.push({ campo: 'tutor', mensagem: 'O nome do tutor é obrigatório (mínimo de 3 caracteres).' });
  }

  if (!validarTelefone(dados.telefone)) {
    erros.push({ campo: 'telefone', mensagem: 'Informe um telefone válido com DDD (10 ou 11 dígitos).' });
  }

  if (!dados.pet || dados.pet.trim().length < 2) {
    erros.push({ campo: 'pet', mensagem: 'O nome do pet é obrigatório (mínimo de 2 caracteres).' });
  }

  if (!dados.especie) {
    erros.push({ campo: 'especie', mensagem: 'Selecione a espécie do pet.' });
  }

  if (!dados.servicoId) {
    erros.push({ campo: 'servico', mensagem: 'Selecione o serviço desejado.' });
  }

  if (!dados.data) {
    erros.push({ campo: 'data', mensagem: 'A data do atendimento é obrigatória.' });
  } else if (!validarDataNaoPassada(dados.data)) {
    erros.push({ campo: 'data', mensagem: 'A data do agendamento não pode estar no passado.' });
  }

  if (!dados.horario) {
    erros.push({ campo: 'horario', mensagem: 'O horário do atendimento é obrigatório.' });
  } else if (!validarHorarioFuncionamento(dados.horario)) {
    erros.push({
      campo: 'horario',
      mensagem: `Horário inválido. O pet shop funciona das ${HORARIO_ABERTURA} às ${HORARIO_FECHAMENTO}.`
    });
  }

  if (dados.data && dados.horario && verificarConflitoHorario(agendamentosExistentes, dados.data, dados.horario, dados.id)) {
    erros.push({
      campo: 'horario',
      mensagem: `Já existe um atendimento agendado para ${dados.data} às ${dados.horario}. Escolha outro horário.`
    });
  }

  if (dados.tipo === 'domiciliar' || dados.atendimentoDomiciliar) {
    const end = dados.endereco || {};
    const cepLimpo = (end.cep || '').replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      erros.push({ campo: 'cep', mensagem: 'CEP inválido para atendimento a domicílio.' });
    }
    if (!end.logradouro || end.logradouro.trim() === '') {
      erros.push({ campo: 'logradouro', mensagem: 'Logradouro é obrigatório no atendimento domiciliar.' });
    }
    if (!end.numero || end.numero.trim() === '') {
      erros.push({ campo: 'numero', mensagem: 'Número do endereço é obrigatório.' });
    }
    if (!end.bairro || end.bairro.trim() === '') {
      erros.push({ campo: 'bairro', mensagem: 'Bairro é obrigatório.' });
    }
    if (!end.cidade || end.cidade.trim() === '') {
      erros.push({ campo: 'cidade', mensagem: 'Cidade é obrigatória.' });
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
}
