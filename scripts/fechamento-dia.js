/**
 * scripts/fechamento-dia.js
 * Script CLI em ES Modules (ESM) para consolidação financeira no terminal.
 * Executado via: npm run fechamento
 * 
 * Reutiliza os módulos puros de js/dominio/ provando a separação de responsabilidades.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { calcularFechamentoDia } from '../js/dominio/fechamento.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function executarFechamentoTerminal() {
  console.log('\n======================================================');
  console.log('🐾 PATINHAS & CIA — RELATÓRIO DE FECHAMENTO DIÁRIO 🐾');
  console.log('======================================================\n');

  try {
    const caminhoArquivo = join(__dirname, '..', 'data', 'agenda-exemplo.json');
    const conteudoBruto = await readFile(caminhoArquivo, 'utf-8');
    const agendamentos = JSON.parse(conteudoBruto);

    // Permite passar uma data específica por argumento: node scripts/fechamento-dia.js 2026-10-30
    const dataArgumento = process.argv[2] || '2026-10-30';
    const fechamento = calcularFechamentoDia(agendamentos, dataArgumento);

    console.log(`📅 Data de Fechamento : ${fechamento.data}`);
    console.log(`📋 Total de Atendimentos: ${fechamento.totalAgendamentos}`);
    console.log(`✅ Concluídos         : ${fechamento.totalConcluidos}`);
    console.log(`⏳ Pendentes (Agendado): ${fechamento.totalAgendados}`);
    console.log(`❌ Cancelados         : ${fechamento.totalCancelados}`);
    console.log('------------------------------------------------------');
    // ass: MX — O fiscal da Receita Federal chora de emoção quando vê esse fechamento
    // sem nenhum centavo de cancelado entrando no faturamento efetivado.
    console.log(`💰 FATURAMENTO EFETIVADO (Concluídos): R$ ${fechamento.faturamentoConcluidos.toFixed(2)}`);
    console.log(`📈 Faturamento Previsto (Sem cancelados): R$ ${fechamento.faturamentoPrevisto.toFixed(2)}`);
    console.log('------------------------------------------------------');

    console.log('\n📊 DISTRIBUIÇÃO POR SERVIÇO:');
    const servicosNomes = Object.keys(fechamento.quantidadePorServico);
    if (servicosNomes.length === 0) {
      console.log('   (Nenhum serviço registrado nesta data)');
    } else {
      servicosNomes.forEach(nome => {
        const qtd = fechamento.quantidadePorServico[nome];
        const fat = fechamento.faturamentoPorServico[nome] || 0;
        console.log(`   • ${nome.padEnd(38, '.')} ${String(qtd).padStart(2, ' ')}x | R$ ${fat.toFixed(2).padStart(8, ' ')}`);
      });
    }

    if (fechamento.proximoAtendimento) {
      console.log('\n🔔 PRÓXIMO ATENDIMENTO DO DIA:');
      const prox = fechamento.proximoAtendimento;
      console.log(`   Horário : ${prox.horario}`);
      console.log(`   Pet     : ${prox.pet} (${prox.especie})`);
      console.log(`   Tutor   : ${prox.tutor} - Tel: ${prox.telefone}`);
      console.log(`   Serviço : ${prox.servicoNome} (R$ ${prox.valor.toFixed(2)})`);
    }

    console.log('\n======================================================');
    console.log('✔ Fechamento processado com sucesso via ESM Node.js!');
    console.log('======================================================\n');
  } catch (erro) {
    console.error('❌ Erro ao executar fechamento no terminal:', erro.message);
    process.exit(1);
  }
}

executarFechamentoTerminal();
