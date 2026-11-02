export function criarGeradorProtocolo(inicio = 1) {
  let contador = inicio;

  return function gerarProximoProtocolo() {
    const numeroFormatado = String(contador).padStart(4, '0');
    const protocolo = `AP-${numeroFormatado}`;
    contador += 1;
    return protocolo;
  };
}

/**
 * Classe base para agendamentos presenciais na loja física.
 */
export class Agendamento {
  /**
   * @param {Object} dados
   * @param {string} dados.id
   * @param {string} dados.protocolo
   * @param {string} dados.tutor
   * @param {string} dados.telefone
   * @param {string} dados.pet
   * @param {string} dados.especie
   * @param {string} dados.servicoId
   * @param {string} dados.servicoNome
   * @param {string} dados.data - YYYY-MM-DD
   * @param {string} dados.horario - HH:mm
   * @param {string} [dados.status='Agendado'] - 'Agendado' | 'Concluído' | 'Cancelado'
   * @param {number} dados.valor - Preço base do serviço
   * @param {string} [dados.observacoes='']
   */
  constructor({
    id,
    protocolo,
    tutor,
    telefone,
    pet,
    especie,
    servicoId,
    servicoNome,
    data,
    horario,
    status = 'Agendado',
    valor = 0,
    observacoes = ''
  }) {
    this.id = id;
    this.protocolo = protocolo;
    this.tutor = tutor;
    this.telefone = telefone;
    this.pet = pet;
    this.especie = especie;
    this.servicoId = servicoId;
    this.servicoNome = servicoNome;
    this.data = data;
    this.horario = horario;
    this.status = status;
    this.valor = Number(valor);
    this.observacoes = observacoes;
    this.tipo = 'presencial';
  }

  /**
   * Calcula o valor final do agendamento usando this.
   * @returns {number}
   */
  calcularValor() {
    return this.valor;
  }

  /**
   * Retorna um resumo textual do agendamento para relatórios ou logs.
   * @returns {string}
   */
  resumo() {
    return `[${this.protocolo}] ${this.data} ${this.horario} - ${this.pet} (${this.tutor}) | ${this.servicoNome} | Status: ${this.status} | Total: R$ ${this.calcularValor().toFixed(2)}`;
  }

  /**
   * Serialização para objeto puro compatível com JSON.
   */
  toJSON() {
    return {
      id: this.id,
      protocolo: this.protocolo,
      tipo: this.tipo,
      tutor: this.tutor,
      telefone: this.telefone,
      pet: this.pet,
      especie: this.especie,
      servicoId: this.servicoId,
      servicoNome: this.servicoNome,
      data: this.data,
      horario: this.horario,
      status: this.status,
      valor: this.calcularValor(),
      observacoes: this.observacoes
    };
  }
}

/**
 * Subclasse para atendimentos a domicílio.
 * Adiciona atributos de endereço e taxa de deslocamento fixa de R$ 30,00.
 * Sobrescreve calcularValor e resumo com polimorfismo via super.
 */
export class AgendamentoDomiciliar extends Agendamento {
  /**
   * @param {Object} dados - Herda atributos de Agendamento mais endereço e taxa
   * @param {Object} dados.endereco
   * @param {string} dados.endereco.cep
   * @param {string} dados.endereco.logradouro
   * @param {string} dados.endereco.numero
   * @param {string} [dados.endereco.complemento]
   * @param {string} dados.endereco.bairro
   * @param {string} dados.endereco.cidade
   * @param {string} dados.endereco.uf
   * @param {number} [dados.taxaDeslocamento=30.0]
   */
  constructor(dados) {
    super(dados);
    this.tipo = 'domiciliar';
    this.endereco = dados.endereco || {};
    this.taxaDeslocamento = dados.taxaDeslocamento !== undefined ? Number(dados.taxaDeslocamento) : 30.0;
  }

  calcularValor() {
    return super.calcularValor() + this.taxaDeslocamento;
  }

  /**
   * Sobrescreve o método resumo incluindo o endereço e a taxa de deslocamento.
   * @returns {string}
   */
  resumo() {
    const end = this.endereco;
    const enderecoFormatado = `${end.logradouro || ''}, ${end.numero || 'S/N'}${end.complemento ? ' (' + end.complemento + ')' : ''} - ${end.bairro || ''}, ${end.cidade || ''}/${end.uf || ''} [CEP: ${end.cep || ''}]`;
    return `${super.resumo()} | Domicílio: ${enderecoFormatado} (+ Taxa Deslocamento: R$ ${this.taxaDeslocamento.toFixed(2)})`;
  }

  /**
   * Serialização para JSON incluindo o endereço e a taxa.
   */
  toJSON() {
    const base = super.toJSON();
    return {
      ...base,
      tipo: 'domiciliar',
      taxaDeslocamento: this.taxaDeslocamento,
      endereco: { ...this.endereco }
    };
  }
}

/**
 * Fábrica polimórfica: instancia Agendamento ou AgendamentoDomiciliar
 * dependendo da propriedade 'tipo' ou da presença de 'endereco'.
 * @param {Object} item
 * @returns {Agendamento | AgendamentoDomiciliar}
 */
export function criarAgendamento(item) {
  if (item.tipo === 'domiciliar' || (item.endereco && item.endereco.cep)) {
    return new AgendamentoDomiciliar(item);
  }
  return new Agendamento(item);
}
