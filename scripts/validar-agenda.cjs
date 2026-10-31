/**
 * scripts/validar-agenda.cjs
 * Script CLI em CommonJS (require / process.exit) para validação estrita de dados.
 * Executado via: npm run validar
 * 
 * Atende ao requisito da US11: CommonJS com fs e path, terminando com process.exit(1) em caso de erro.
 */

const fs = require('fs');
const path = require('path');

const HORARIO_ABERTURA = '08:00';
const HORARIO_FECHAMENTO = '19:00';

function validarAgendaArquivo(caminhoRelativo) {
  const caminhoAbsoluto = path.resolve(__dirname, '..', caminhoRelativo);
  console.log('\n======================================================');
  console.log('VALIDADOR DE DADOS DA AGENDA (CommonJS / Node.js)');
  console.log(`Arquivo sob analise: ${caminhoRelativo}`);
  console.log('======================================================\n');

  if (!fs.existsSync(caminhoAbsoluto)) {
    console.error(`[ERRO] Arquivo não encontrado no caminho: ${caminhoAbsoluto}`);
    process.exit(1);
  }

  let agendamentos;
  try {
    const conteudo = fs.readFileSync(caminhoAbsoluto, 'utf-8');
    agendamentos = JSON.parse(conteudo);
  } catch (erroParse) {
    console.error(`[ERRO DE PARSE] O arquivo não é um JSON válido: ${erroParse.message}`);
    process.exit(1);
  }

  if (!Array.isArray(agendamentos)) {
    console.error('[ERRO ESTRUTURAL] A raiz do JSON deve ser um array de agendamentos.');
    process.exit(1);
  }

  const errosDetectados = [];
  const horariosOcupados = new Set();

  agendamentos.forEach((item, index) => {
    const prefixo = `[Item #${index + 1} | Protocolo: ${item.protocolo || 'SEM PROTOCOLO'}]`;

    // 1. Campos obrigatórios essenciais
    const camposObrigatorios = ['protocolo', 'tutor', 'telefone', 'pet', 'especie', 'servicoId', 'data', 'horario', 'status'];
    camposObrigatorios.forEach(campo => {
      if (!item[campo] || String(item[campo]).trim() === '') {
        errosDetectados.push(`${prefixo} Campo obrigatório ausente ou vazio: "${campo}".`);
      }
    });

    // 2. Validação de formato da data (YYYY-MM-DD)
    if (item.data && !/^\d{4}-\d{2}-\d{2}$/.test(item.data)) {
      errosDetectados.push(`${prefixo} Data inválida: "${item.data}". Formato esperado: YYYY-MM-DD.`);
    }

    // 3. Validação de formato do horário (HH:mm) e funcionamento da loja
    if (item.horario) {
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(item.horario)) {
        errosDetectados.push(`${prefixo} Horário em formato incorreto: "${item.horario}". Esperado: HH:mm.`);
      } else if (item.horario < HORARIO_ABERTURA || item.horario > HORARIO_FECHAMENTO) {
        errosDetectados.push(`${prefixo} Horário "${item.horario}" fora do funcionamento da loja (${HORARIO_ABERTURA} às ${HORARIO_FECHAMENTO}).`);
      }
    }

    // 4. Validação de conflito de horários duplicados para atendimentos ativos (Agendado)
    // ass: MX — Dois cães no mesmo horário dá confusão épica na recepção. Conflito evitado com rigor.
    if (item.status === 'Agendado' && item.data && item.horario) {
      const chaveHorario = `${item.data}__${item.horario}`;
      if (horariosOcupados.has(chaveHorario)) {
        errosDetectados.push(`${prefixo} CONFLITO DE HORÁRIO: Já existe outro atendimento ativo em ${item.data} às ${item.horario}.`);
      } else {
        horariosOcupados.add(chaveHorario);
      }
    }

    // 5. Validação de endereço em agendamentos domiciliares
    if (item.tipo === 'domiciliar' || (item.endereco && Object.keys(item.endereco).length > 0)) {
      const end = item.endereco || {};
      if (!end.cep || end.cep.replace(/\D/g, '').length !== 8) {
        errosDetectados.push(`${prefixo} CEP de domicílio inválido: "${end.cep}".`);
      }
      if (!end.logradouro || !end.numero || !end.cidade || !end.uf) {
        errosDetectados.push(`${prefixo} Dados de endereço residencial incompletos (logradouro, número, cidade e UF são mandatórios).`);
      }
    }
  });

  // Relatório Final
  if (errosDetectados.length > 0) {
    console.error(`\nFORAM DETECTADOS ${errosDetectados.length} ERRO(S) DE VALIDAÇÃO:\n`);
    errosDetectados.forEach((msg, i) => console.error(`  ${i + 1}. ${msg}`));
    console.error('\n[ERRO] Validação falhou! Corrija os dados acima para garantir a integridade da agenda.\n');
    process.exit(1);
  } else {
    console.log(`SUCESSO: Todos os ${agendamentos.length} agendamentos foram validados com êxito!`);
    console.log('   • Estrutura de campos conferida');
    console.log('   • Horários de atendimento respeitados');
    console.log('   • Nenhum conflito de horário detectado');
    console.log('   • Endereços domiciliares íntegros\n');
    process.exit(0);
  }
}

// Arquivo padrão ou passado via argumento (ex: node scripts/validar-agenda.cjs data/agenda-invalida.json)
const arquivoAlvo = process.argv[2] || 'data/agenda-exemplo.json';
validarAgendaArquivo(arquivoAlvo);
