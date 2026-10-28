/**
 * tests/dominio.test.js
 * Suíte de testes unitários automatizados para a camada de domínio.
 * Executado pelo executor nativo do Node.js: node --test tests/dominio.test.js
 * (Bônus de Avaliação +0,25 pt)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Agendamento, AgendamentoDomiciliar, criarGeradorProtocolo } from '../js/dominio/agendamento.js';
import {
  validarTelefone,
  validarHorarioFuncionamento,
  verificarConflitoHorario,
  filtrarAgendamentos
} from '../js/dominio/regras.js';
import { calcularFechamentoDia } from '../js/dominio/fechamento.js';

describe('1. Modelagem de Entidades e Classes (POO)', () => {
  test('Agendamento base calcula valor original sem acréscimos', () => {
    const ag = new Agendamento({
      id: 'ag-1',
      protocolo: 'AP-0001',
      tutor: 'Mariana Souza',
      telefone: '(48) 99123-4567',
      pet: 'Pipoca',
      especie: 'Cão',
      servicoId: 'srv-banho-tosa',
      servicoNome: 'Banho e Tosa Completa',
      data: '2026-10-30',
      horario: '08:30',
      status: 'Agendado',
      valor: 85.0
    });

    assert.equal(ag.calcularValor(), 85.0);
    assert.equal(ag.tipo, 'presencial');
    assert.match(ag.resumo(), /AP-0001/);
  });

  test('AgendamentoDomiciliar herda de Agendamento e soma taxa de deslocamento de R$ 30,00', () => {
    const dom = new AgendamentoDomiciliar({
      id: 'ag-2',
      protocolo: 'AP-0002',
      tutor: 'Carlos Lima',
      telefone: '(48) 98845-1290',
      pet: 'Thor',
      especie: 'Cão',
      servicoId: 'srv-consulta-vet',
      servicoNome: 'Consulta Veterinária Geral',
      data: '2026-10-30',
      horario: '09:30',
      status: 'Agendado',
      valor: 120.0,
      taxaDeslocamento: 30.0,
      endereco: {
        cep: '88015-100',
        logradouro: 'Av. Mauro Ramos',
        numero: '450',
        bairro: 'Centro',
        cidade: 'Florianópolis',
        uf: 'SC'
      }
    });

    assert.equal(dom.calcularValor(), 150.0); // 120 + 30
    assert.equal(dom.tipo, 'domiciliar');
    assert.match(dom.resumo(), /Taxa Deslocamento: R\$ 30\.00/);
  });
});

describe('2. Closure do Gerador de Protocolos', () => {
  test('Gera identificadores sequenciais sem vazar variáveis para escopo global', () => {
    const gerar = criarGeradorProtocolo(1);
    assert.equal(gerar(), 'AP-0001');
    assert.equal(gerar(), 'AP-0002');
    assert.equal(gerar(), 'AP-0003');

    const outroGerador = criarGeradorProtocolo(50);
    assert.equal(outroGerador(), 'AP-0050');
    assert.equal(outroGerador(), 'AP-0051');
  });
});

describe('3. Regras de Negócio e Validações', () => {
  test('Valida telefones brasileiros com DDD', () => {
    assert.equal(validarTelefone('(48) 99123-4567'), true);
    assert.equal(validarTelefone('48991234567'), true);
    assert.equal(validarTelefone('4832221100'), true);
    assert.equal(validarTelefone('123'), false);
    assert.equal(validarTelefone(''), false);
  });

  test('Valida horário de funcionamento do pet shop (08:00 às 19:00)', () => {
    assert.equal(validarHorarioFuncionamento('08:00'), true);
    assert.equal(validarHorarioFuncionamento('14:30'), true);
    assert.equal(validarHorarioFuncionamento('19:00'), true);
    assert.equal(validarHorarioFuncionamento('07:59'), false);
    assert.equal(validarHorarioFuncionamento('19:01'), false);
    assert.equal(validarHorarioFuncionamento('23:00'), false);
  });

  test('Detecta conflito de horário apenas quando status for Agendado', () => {
    const agenda = [
      { id: '1', data: '2026-10-30', horario: '10:00', status: 'Agendado' },
      { id: '2', data: '2026-10-30', horario: '11:00', status: 'Cancelado' }
    ];

    // Choque com agendamento ativo
    assert.equal(verificarConflitoHorario(agenda, '2026-10-30', '10:00'), true);
    // Mesmo horário de um cancelado -> permitido
    assert.equal(verificarConflitoHorario(agenda, '2026-10-30', '11:00'), false);
    // Horário livre -> permitido
    assert.equal(verificarConflitoHorario(agenda, '2026-10-30', '14:00'), false);
  });

  test('Filtra agendamentos via função de callback própria', () => {
    const lista = [
      { pet: 'Mel', status: 'Concluído' },
      { pet: 'Thor', status: 'Agendado' },
      { pet: 'Bob', status: 'Agendado' }
    ];

    const apenasConcluidos = filtrarAgendamentos(lista, item => item.status === 'Concluído');
    assert.equal(apenasConcluidos.length, 1);
    assert.equal(apenasConcluidos[0].pet, 'Mel');
  });
});

describe('4. Fechamento do Dia e Consolidação Financeira', () => {
  const dadosMock = [
    {
      id: '1',
      protocolo: 'AP-0001',
      tutor: 'Tutor A',
      telefone: '48999998888',
      pet: 'Pet A',
      especie: 'Cão',
      servicoId: 'srv-1',
      servicoNome: 'Banho',
      data: '2026-10-30',
      horario: '08:00',
      status: 'Concluído',
      valor: 80.0
    },
    {
      id: '2',
      protocolo: 'AP-0002',
      tutor: 'Tutor B',
      telefone: '48999997777',
      pet: 'Pet B',
      especie: 'Gato',
      servicoId: 'srv-2',
      servicoNome: 'Consulta',
      data: '2026-10-30',
      horario: '09:00',
      status: 'Concluído',
      valor: 120.0
    },
    {
      id: '3',
      protocolo: 'AP-0003',
      tutor: 'Tutor C',
      telefone: '48999996666',
      pet: 'Pet C',
      especie: 'Cão',
      servicoId: 'srv-1',
      servicoNome: 'Banho',
      data: '2026-10-30',
      horario: '10:00',
      status: 'Cancelado',
      valor: 80.0
    },
    {
      id: '4',
      protocolo: 'AP-0004',
      tutor: 'Tutor D',
      telefone: '48999995555',
      pet: 'Pet D',
      especie: 'Cão',
      servicoId: 'srv-1',
      servicoNome: 'Banho',
      data: '2026-10-30',
      horario: '11:00',
      status: 'Agendado',
      valor: 80.0
    }
  ];

  test('Faturamento considera estritamente atendimentos com status Concluído', () => {
    const fechamento = calcularFechamentoDia(dadosMock, '2026-10-30');

    assert.equal(fechamento.totalAgendamentos, 4);
    assert.equal(fechamento.totalConcluidos, 2);
    assert.equal(fechamento.totalCancelados, 1);
    assert.equal(fechamento.totalAgendados, 1);
    // Apenas Concluídos: 80 + 120 = 200 (não soma os 80 do cancelado nem os 80 do agendado)
    assert.equal(fechamento.faturamentoConcluidos, 200.0);
  });

  test('Distribui quantidades e faturamentos por serviço corretamente', () => {
    const fechamento = calcularFechamentoDia(dadosMock, '2026-10-30');

    assert.equal(fechamento.quantidadePorServico['Banho'], 3);
    assert.equal(fechamento.quantidadePorServico['Consulta'], 1);
    assert.equal(fechamento.faturamentoPorServico['Banho'], 80.0); // 1 concluído
    assert.equal(fechamento.faturamentoPorServico['Consulta'], 120.0); // 1 concluído
  });
});
