/**
 * js/api.js
 * Camada de integração externa e consumo de APIs públicas com fetch e async/await.
 * Gerencia cache de feriados (30 dias) e tratamento robusto de erros.
 */

const CACHE_FERIADOS_PREFIX = 'agendapet:cache_feriados_';
const VALIDADE_CACHE_DIAS = 30;

/**
 * Carrega a lista de serviços oferecidos pelo pet shop a partir do JSON estático local.
 * @returns {Promise<Array<Object>>}
 */
export async function carregarServicosApi() {
  try {
    const resposta = await fetch('data/servicos.json');
    if (!resposta.ok) {
      throw new Error(`Falha na requisição de serviços: status HTTP ${resposta.status}`);
    }
    const servicos = await resposta.json();
    return servicos;
  } catch (erro) {
    console.error('Erro ao buscar catálogo de serviços:', erro);
    throw erro; // Repassa para a UI renderizar o estado de erro e botão "Tentar novamente"
  }
}

/**
 * Consulta endereço completo pelo CEP na API pública do ViaCEP.
 * Trata erros de formato, CEP inexistente e falha de conexão de forma distinta.
 * 
 * @param {string} cep
 * @returns {Promise<{ sucesso: boolean, dados?: Object, erro?: string, motivo?: string }>}
 */
export async function consultarCepApi(cep) {
  if (!cep || typeof cep !== 'string') {
    return {
      sucesso: false,
      motivo: 'formato_invalido',
      erro: 'Informe o número do CEP.'
    };
  }

  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    return {
      sucesso: false,
      motivo: 'formato_invalido',
      erro: `CEP inválido. Um CEP deve conter exatamente 8 dígitos (digitados: ${cepLimpo.length}).`
    };
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!resposta.ok) {
      throw new Error(`Servidor ViaCEP respondeu com status ${resposta.status}`);
    }

    const dados = await resposta.json();

    if (dados.erro === true || dados.erro === 'true') {
      return {
        sucesso: false,
        motivo: 'nao_encontrado',
        erro: 'CEP não encontrado na base dos Correios. Por favor, preencha o endereço manualmente.'
      };
    }

    return {
      sucesso: true,
      dados: {
        cep: dados.cep || cep,
        logradouro: dados.logradouro || '',
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        uf: dados.uf || '',
        complemento: dados.complemento || ''
      }
    };
  } catch (erroRede) {
    console.warn('Falha ao comunicar com ViaCEP:', erroRede);
    return {
      sucesso: false,
      motivo: 'falha_rede',
      erro: 'Não foi possível consultar o CEP automaticamente (falha de rede). Você pode preencher o endereço manualmente abaixo.'
    };
  }
}

/**
 * Consulta a lista de feriados nacionais do ano informado na BrasilAPI.
 * Aplica cache no localStorage com validade de 30 dias para evitar requisições repetidas.
 * 
 * @param {number|string} ano
 * @returns {Promise<{ sucesso: boolean, feriados: Array<Object>, emCache: boolean, aviso?: string }>}
 */
export async function consultarFeriadosAno(ano) {
  const chaveCache = `${CACHE_FERIADOS_PREFIX}${ano}`;

  // 1. Tenta recuperar do cache local com validação de TTL
  try {
    const itemEmCache = localStorage.getItem(chaveCache);
    if (itemEmCache) {
      const { timestamp, dados } = JSON.parse(itemEmCache);
      const diferencaDias = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

      if (diferencaDias < VALIDADE_CACHE_DIAS && Array.isArray(dados)) {
        return {
          sucesso: true,
          feriados: dados,
          emCache: true
        };
      }
    }
  } catch (e) {
    console.warn('Erro ao ler cache de feriados:', e);
  }

  // 2. Requisição para a BrasilAPI
  try {
    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    if (!resposta.ok) {
      throw new Error(`BrasilAPI respondeu com status ${resposta.status}`);
    }

    const feriados = await resposta.json();

    // 3. Salva no cache com data da consulta
    try {
      localStorage.setItem(
        chaveCache,
        JSON.stringify({
          timestamp: Date.now(),
          dados: feriados
        })
      );
    } catch (e) {
      console.warn('Não foi possível gravar no localStorage:', e);
    }

    return {
      sucesso: true,
      feriados: Array.isArray(feriados) ? feriados : [],
      emCache: false
    };
  } catch (erroRede) {
    console.warn('Falha ao consultar BrasilAPI de feriados:', erroRede);
    return {
      sucesso: false,
      feriados: [],
      emCache: false,
      aviso: 'Não foi possível verificar os feriados do calendário (serviço temporariamente indisponível). Você pode continuar normalmente.'
    };
  }
}

/**
 * Verifica se uma data específica (YYYY-MM-DD) é feriado nacional.
 * 
 * @param {string} dataIso - Formato 'YYYY-MM-DD'
 * @returns {Promise<{ ehFeriado: boolean, nomeFeriado?: string, aviso?: string }>}
 */
export async function verificarSeDataEFeriado(dataIso) {
  if (!dataIso || !dataIso.includes('-')) {
    return { ehFeriado: false };
  }

  const ano = dataIso.split('-')[0];
  const resultado = await consultarFeriadosAno(ano);

  if (!resultado.sucesso) {
    return {
      ehFeriado: false,
      aviso: resultado.aviso
    };
  }

  const feriadoEncontrado = resultado.feriados.find(f => f.date === dataIso);

  if (feriadoEncontrado) {
    return {
      ehFeriado: true,
      nomeFeriado: feriadoEncontrado.name || 'Feriado Nacional'
    };
  }

  return { ehFeriado: false };
}
