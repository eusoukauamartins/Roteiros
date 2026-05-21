/**
 * Utilitários centralizados de data e hora para garantir que a aplicação
 * sempre opere sob o fuso horário de São Paulo (America/Sao_Paulo), 
 * prevenindo bugs de "drift" de fuso horário.
 */

const TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna os "parts" nativos do Intl para a data especificada no fuso de SP.
 */
function getSPParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const p = {};
  parts.forEach(({ type, value }) => { p[type] = value; });
  return p;
}

/**
 * Retorna uma string ISO "YYYY-MM-DDTHH:mm:ss" real do horário exato
 * de São Paulo, no momento da chamada (ou data fornecida).
 */
export function getNowInSaoPauloISO(date = new Date()) {
  const p = getSPParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}:${p.second}`;
}

/**
 * Retorna apenas a string da data "YYYY-MM-DD" referente ao dia de HOJE em São Paulo.
 * Usado extensivamente para "group by date", resete de tarefas diárias, etc.
 */
export function getTodaySP() {
  const p = getSPParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

/**
 * Normaliza uma string de data (ex: YYYY-MM-DD) adicionando meio-dia T12:00:00
 * para impedir que o construtor nativo mude de dia caso o browser do usuário
 * esteja num fuso adiantado/atrasado.
 */
export function normalizeDateOnly(dateString) {
  if (!dateString) return null;
  if (dateString.length === 10) {
    return `${dateString}T12:00:00`;
  }
  return dateString;
}

/**
 * Formata uma data para visualização usando os padrões do Brasil (pt-BR)
 * sempre travado no fuso de SP.
 * Formatos suportados implicitamente: 
 * - includeTime = false: "dd/MM"
 * - includeTime = true: "dd/MM/yyyy HH:mm"
 * 
 * Se for passada uma string YYYY-MM-DD sem tempo, será tratada como meio-dia
 * para exibição consistente daquele dia, independente de fuso.
 */
export function formatDateBR(dateInput, includeTime = false) {
  if (!dateInput) return '';

  const isDateOnly = typeof dateInput === 'string' && dateInput.length === 10;
  const safeInput = isDateOnly ? `${dateInput}T12:00:00` : dateInput;
  const d = new Date(safeInput);

  if (isNaN(d.getTime())) return '';

  const options = {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
  };

  if (includeTime && !isDateOnly) {
    options.year = 'numeric';
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }

  const formatter = new Intl.DateTimeFormat('pt-BR', options);
  return formatter.format(d).replace(',', ' às');
}

/**
 * Helper para verificar se um dado dia é hoje, no fuso de SP
 */
export function isTodaySP(dateString) {
  if (!dateString) return false;
  const todayStr = getTodaySP();
  return dateString.startsWith(todayStr);
}

/**
 * Helper para pegar o dia de amanhã em formato YYYY-MM-DD de SP
 */
export function getTomorrowSP() {
  const now = new Date();
  // Avança 24h a partir de agora na máquina, mas depois convertemos para SP
  // Para ser preciso com limites de dia, pegamos o tempo e somamos.
  const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const p = getSPParts(d);
  return `${p.year}-${p.month}-${p.day}`;
}
