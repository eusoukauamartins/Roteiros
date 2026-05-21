export function countCharacters(text = "") {
  return text.length;
}

export function countWords(text = "") {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateSpeechTime(text = "") {
  const wordsPerMinute = 130;

  const words = countWords(text);

  const minutes = words / wordsPerMinute;

  const seconds = Math.round(minutes * 60);

  return seconds;
}

/**
 * Formata segundos em "Ns" ou "Nm SSs" para legibilidade.
 * Ex: 45 -> "45s", 75 -> "1m 15s", 127 -> "2m 07s"
 */
export function formatSeconds(seconds = 0) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
