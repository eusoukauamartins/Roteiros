import useVideoStore from '../stores/useVideoStore';
import useHeadlineStore from '../stores/useHeadlineStore';
import useScriptStore from '../stores/useScriptStore';
import useImageStore from '../stores/useImageStore';
import useMusicStore from '../stores/useMusicStore';
import useTaskStore from '../stores/useTaskStore';
import useBenchmarkStore from '../stores/useBenchmarkStore';
import useProductStore from '../stores/useProductStore';

export function globalSearch(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  // Search videos (inclui arquivados também na busca, mas marca o tipo)
  useVideoStore.getState().cards.forEach((card) => {
    if (
      card.headline?.toLowerCase().includes(q) ||
      card.script?.toLowerCase().includes(q) ||
      card.notes?.toLowerCase().includes(q) ||
      card.cta?.toLowerCase().includes(q)
    ) {
      results.push({
        type: card.archived ? 'posted' : 'video',
        item: card,
        title: card.headline || 'Sem headline',
      });
    }
  });

  useHeadlineStore.getState().headlines.forEach((h) => {
    if (h.text?.toLowerCase().includes(q) || h.notes?.toLowerCase().includes(q)) {
      results.push({ type: 'headline', item: h, title: h.text });
    }
  });

  useScriptStore.getState().scripts.forEach((s) => {
    if (s.title?.toLowerCase().includes(q) || s.text?.toLowerCase().includes(q)) {
      results.push({ type: 'script', item: s, title: s.title || 'Sem título' });
    }
  });

  useImageStore.getState().images.forEach((i) => {
    if (i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)) {
      results.push({ type: 'acervo', item: i, title: i.title || 'Sem título' });
    }
  });

  useMusicStore.getState().musics.forEach((m) => {
    if (m.name?.toLowerCase().includes(q)) {
      results.push({ type: 'music', item: m, title: m.name });
    }
  });

  useTaskStore.getState().tasks.forEach((t) => {
    if (t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
      results.push({ type: 'task', item: t, title: t.title });
    }
  });

  // Benchmarks
  useBenchmarkStore.getState().benchmarks.forEach((b) => {
    if (
      b.headline?.toLowerCase().includes(q) ||
      b.script?.toLowerCase().includes(q) ||
      b.creator?.toLowerCase().includes(q) ||
      b.observations?.toLowerCase().includes(q)
    ) {
      results.push({ type: 'benchmark', item: b, title: b.headline || `(${b.creator || 'sem creator'})` });
    }
  });

  // Produtos
  useProductStore.getState().products.forEach((p) => {
    if (
      p.name?.toLowerCase().includes(q) ||
      p.shortDescription?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q)
    ) {
      results.push({ type: 'product', item: p, title: p.name || 'Sem nome' });
    }
  });

  return results;
}
