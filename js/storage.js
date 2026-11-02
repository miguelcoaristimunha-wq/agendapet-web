const PREFIXO = 'agendapet:';

export const CHAVES = {
  AGENDA: `${PREFIXO}agenda`,
  FILTRO: `${PREFIXO}filtro`,
  TEMA: `${PREFIXO}tema`,
  LEMBRETES_ATIVOS: `${PREFIXO}lembretes_ativos`
};

/**
 * Salva a lista de agendamentos no localStorage.
 * @param {Array<Object>} agendamentos
 * @returns {boolean} True se salvo com sucesso
 */
export function salvarAgendaStorage(agendamentos) {
  try {
    const json = JSON.stringify(agendamentos);
    localStorage.setItem(CHAVES.AGENDA, json);
    return true;
  } catch (erro) {
    console.error('Falha ao salvar agendamentos no localStorage:', erro);
    return false;
  }
}

/**
 * Carrega a agenda do localStorage. Em caso de dados corrompidos ou nulos,
 * retorna null de forma segura via try/catch para permitir carga de fallback.
 * @returns {Array<Object>|null}
 */
export function carregarAgendaStorage() {
  try {
    const dados = localStorage.getItem(CHAVES.AGENDA);
    if (!dados) return null;
    const array = JSON.parse(dados);
    if (!Array.isArray(array)) {
      console.warn('Dados no localStorage não eram um array válido. Restaurando padrão.');
      return null;
    }
    return array;
  } catch (erro) {
    console.error('Erro de leitura/parse no localStorage (dados possivelmente corrompidos):', erro);
    return null;
  }
}

/**
 * Salva uma preferência simples de interface (tema, filtro selecionado, etc.)
 * @param {string} chave
 * @param {any} valor
 */
export function salvarPreferencia(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn(`Não foi possível salvar preferência [${chave}]:`, erro);
  }
}

/**
 * Recupera uma preferência de interface com valor default caso não exista ou esteja corrompida.
 * @param {string} chave
 * @param {any} padrao
 * @returns {any}
 */
export function carregarPreferencia(chave, padrao = null) {
  try {
    const valor = localStorage.getItem(chave);
    if (valor === null) return padrao;
    return JSON.parse(valor);
  } catch (erro) {
    console.warn(`Erro ao ler preferência [${chave}]:`, erro);
    return padrao;
  }
}

/**
 * Remove SOMENTE as chaves da aplicação AgendaPet (prefixadas com 'agendapet:'),
 * preservando intactos quaisquer outros dados armazenados no navegador do usuário.
 */
export function limparDadosProjeto() {
  try {
    const chavesParaRemover = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(PREFIXO)) {
        chavesParaRemover.push(chave);
      }
    }

    chavesParaRemover.forEach(chave => localStorage.removeItem(chave));
    return chavesParaRemover.length;
  } catch (erro) {
    console.error('Erro ao limpar chaves do projeto no localStorage:', erro);
    return 0;
  }
}

/**
 * Gera uma string formatada em JSON com indentação legível para exportação,
 * compatível com o formato lido pelos scripts Node.js .
 * @param {Array<Object>} agendamentos
 * @returns {string}
 */
export function exportarAgendaJsonFormatado(agendamentos) {
  return JSON.stringify(agendamentos, null, 2);
}

/**
 * Bônus: Dispara o download de um arquivo .json no navegador do usuário.
 * @param {Array<Object>} agendamentos
 * @param {string} [nomeArquivo='agenda-patinhas-e-cia.json']
 */
export function baixarArquivoAgendaJson(agendamentos, nomeArquivo = 'agenda-patinhas-e-cia.json') {
  const conteudo = exportarAgendaJsonFormatado(agendamentos);
  const blob = new Blob([conteudo], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const linkTemporario = document.createElement('a');
  linkTemporario.href = url;
  linkTemporario.download = nomeArquivo;
  document.body.appendChild(linkTemporario);
  linkTemporario.click();
  document.body.removeChild(linkTemporario);
  URL.revokeObjectURL(url);
}
