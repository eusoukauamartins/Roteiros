import useVideoStore from '../stores/useVideoStore';
import useHeadlineStore from '../stores/useHeadlineStore';
import useScriptStore from '../stores/useScriptStore';
import useImageStore from '../stores/useImageStore';
import useMusicStore from '../stores/useMusicStore';
import useTaskStore from '../stores/useTaskStore';
import useNicheStore from '../stores/useNicheStore';
import useBenchmarkStore from '../stores/useBenchmarkStore';
import useProductStore from '../stores/useProductStore';
import useSettingsStore from '../stores/useSettingsStore';
import useLearningStore from '../stores/useLearningStore';

// ===================== FILTERS =====================

function filterByDateRange(items, startDate, endDate) {
  if (!startDate && !endDate) return items;
  return items.filter(item => {
    const created = new Date(item.createdAt);
    const updated = item.updatedAt ? new Date(item.updatedAt) : null;
    const start = startDate ? new Date(startDate + 'T00:00:00') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    const createdInRange = (!start || created >= start) && (!end || created <= end);
    const updatedInRange = updated && (!start || updated >= start) && (!end || updated <= end);
    return createdInRange || updatedInRange;
  });
}

function filterByNiche(items, niche) {
  if (!niche) return items;
  return items.filter(i => i.niche === niche);
}

function filterByFavorite(items, onlyFavorites) {
  if (!onlyFavorites) return items;
  return items.filter(i => i.favorite);
}

function filterByStatus(items, status) {
  if (!status) return items;
  return items.filter(i => i.status === status);
}

// ===================== AI ENRICHMENT =====================

function countWords(t = '') {
  return !t.trim() ? 0 : t.trim().split(/\s+/).length;
}

function speechSeconds(text) {
  return Math.round((countWords(text) / 145) * 60);
}

/**
 * Anexa dados derivados úteis para IA em cada card de vídeo
 */
function enrichCard(c) {
  const wc = countWords(c.script || '');
  const hlWc = countWords(c.headline || '');
  return {
    ...c,
    _derived: {
      headlineWordCount: hlWc,
      headlineCharCount: (c.headline || '').length,
      scriptWordCount: wc,
      scriptCharCount: (c.script || '').length,
      estimatedSpeechSeconds: speechSeconds(c.script || ''),
      hasMusic: Array.isArray(c.music) && c.music.length > 0,
      hasVisuals: Array.isArray(c.images) && c.images.length > 0,
      hasCTA: !!(c.cta && c.cta.length > 0),
      isReadyForRecording: (c.headline?.length > 0 && c.script?.length > 0),
    },
  };
}

function enrichBenchmark(b) {
  return {
    ...b,
    _derived: {
      headlineWordCount: countWords(b.headline || ''),
      scriptWordCount: countWords(b.script || ''),
      estimatedSpeechSeconds: speechSeconds(b.script || ''),
      realDurationSeconds: Number(b.realDuration) || 0,
    },
  };
}

function enrichProjection(p, products) {
  const product = products.find(pr => pr.id === p.productId);
  const views = Number(p.views) || 0;
  const conv = Number(p.conversionRate) || 0;
  const price = Number(product?.price) || 0;
  const sales = Math.floor(views * (conv / 100));
  const revenue = sales * price;
  const fixed = (Number(p.employees)||0) + (Number(p.tools)||0) + (Number(p.software)||0) + (Number(p.monthlyExpenses)||0);
  const sumPerc = ((Number(p.taxes)||0) + (Number(p.checkoutFees)||0) + (Number(p.commissions)||0) + (Number(p.percentageCosts)||0)) / 100;
  const variable = (revenue * sumPerc) + (sales * (Number(p.cpa)||0));
  const profit = revenue - fixed - variable;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const roas = variable > 0 ? revenue / variable : 0;
  return {
    ...p,
    _derived: {
      productName: product?.name || null,
      productTicketType: product?.ticketType || null,
      sales,
      revenue: Math.round(revenue * 100) / 100,
      fixedCosts: Math.round(fixed * 100) / 100,
      variableCosts: Math.round(variable * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      marginPercent: Math.round(margin * 10) / 10,
      roas: Math.round(roas * 100) / 100,
    },
  };
}

/**
 * Schema legível pela IA (todos os campos explicados em português)
 */
function buildSchema() {
  return {
    cards: {
      _description: 'Vídeos no fluxo de produção. Cada card é um vídeo em algum estágio.',
      status: {
        creating: 'Em criação — roteiro sendo escrito',
        'ready-to-record': 'Roteiro pronto, aguardando gravação',
        recorded: 'Gravado, aguardando edição',
        editing: 'Em edição',
        posted: 'Publicado (arquivado, fora do pipeline ativo)',
      },
      archived: 'Boolean. Se true, o vídeo já foi postado e está no arquivo.',
      headline: 'Hook/headline (primeiros 3-7 segundos). Critério mais importante.',
      script: 'Roteiro completo do vídeo (1-2.5 minutos).',
      cta: 'Call-to-action exato falado no fim do vídeo.',
      productId: 'ID do produto que este vídeo promove (ou null).',
      basedOnBenchmarkIds: 'IDs dos benchmarks usados como inspiração para este vídeo.',
      structureTags: 'Tags estruturais (gancho-*, narrativa-*, cta-*).',
      performance: 'Avaliação manual pós-publicação: flop | medium | viral | "".',
      performanceNotes: 'Notas sobre como o vídeo performou na vida real.',
    },
    headlines: {
      _description: 'Biblioteca de headlines/hooks reaproveitáveis.',
      text: 'Texto da headline.',
      favorite: 'Marca de favorita.',
    },
    scripts: {
      _description: 'Biblioteca de roteiros reaproveitáveis (templates, frameworks).',
      title: 'Título do roteiro/template.',
      text: 'Conteúdo do roteiro.',
    },
    benchmarks: {
      _description: 'Vídeos virais de outros criadores, analisados como referência. ESTA SEÇÃO É CENTRAL PARA INTELIGÊNCIA DE CONTEÚDO.',
      headline: 'Hook usado pelo creator.',
      script: 'Transcrição/roteiro.',
      ctaType: 'Categoria de CTA usado.',
      ctaText: 'Texto exato do CTA.',
      creator: 'Nome do criador analisado.',
      observations: 'Notas estratégicas — por que esse vídeo funcionou.',
      structureTags: 'Tags estruturais identificadas no benchmark.',
    },
    products: {
      _description: 'Ofertas/produtos do criador. ticketType define faixa de preço.',
      ticketType: {
        'Low Ticket': 'Até R$200',
        'Medium Ticket': 'R$200 a R$2.000',
        'High Ticket': 'Acima de R$2.000',
      },
    },
    projections: {
      _description: 'Cenários de simulação financeira para um produto. _derived contém os cálculos prontos.',
    },
    tasks: {
      _description: 'Tarefas operacionais.',
      status: { pending: 'Pendente', 'in-progress': 'Em andamento', done: 'Concluída' },
      priority: { low: 'Baixa', medium: 'Média', high: 'Alta' },
      relatedCardId: 'Card de vídeo relacionado (ou null).',
    },
    images: { _description: 'Acervo visual (imagens, vídeos, referências, assets).' },
    musics: { _description: 'Acervo de músicas/áudios.' },
  };
}

/**
 * Computa um sumário agregado para a IA entender o estado geral antes dos detalhes
 */
function buildSummary(data) {
  const allCards = data.cards || [];
  const active = allCards.filter(c => !c.archived);
  const posted = allCards.filter(c => c.archived);

  const byStage = {};
  ['creating', 'ready-to-record', 'recorded', 'editing'].forEach(s => {
    byStage[s] = active.filter(c => c.status === s).length;
  });

  const byNiche = {};
  allCards.forEach(c => {
    if (!c.niche) return;
    byNiche[c.niche] = (byNiche[c.niche] || 0) + 1;
  });

  const perfDist = { viral: 0, medium: 0, flop: 0, unrated: 0 };
  posted.forEach(c => {
    const p = c.performance || '';
    if (p === 'viral') perfDist.viral++;
    else if (p === 'medium') perfDist.medium++;
    else if (p === 'flop') perfDist.flop++;
    else perfDist.unrated++;
  });

  // Top benchmark mais reutilizado
  const benchmarkUsage = {};
  allCards.forEach(c => {
    (c.basedOnBenchmarkIds || []).forEach(id => {
      benchmarkUsage[id] = (benchmarkUsage[id] || 0) + 1;
    });
  });
  const topBenchmarks = Object.entries(benchmarkUsage)
    .sort(([,a],[,b]) => b - a).slice(0, 3)
    .map(([id, count]) => {
      const b = (data.benchmarks || []).find(x => x.id === id);
      return b ? { id, headline: b.headline, count } : null;
    }).filter(Boolean);

  // Última atividade
  const allTimestamps = [
    ...allCards.map(c => c.updatedAt),
    ...(data.benchmarks || []).map(b => b.updatedAt),
    ...(data.products || []).map(p => p.updatedAt),
  ].filter(Boolean).sort();
  const lastActivity = allTimestamps[allTimestamps.length - 1] || null;

  return {
    totals: {
      activeVideos: active.length,
      postedVideos: posted.length,
      headlines: (data.headlines || []).length,
      scripts: (data.scripts || []).length,
      benchmarks: (data.benchmarks || []).length,
      products: (data.products || []).length,
      projections: (data.projections || []).length,
      tasks: (data.tasks || []).length,
    },
    pipelineByStage: byStage,
    distributionByNiche: byNiche,
    postedPerformanceDistribution: perfDist,
    topReusedBenchmarks: topBenchmarks,
    lastActivityAt: lastActivity,
  };
}

/**
 * Constrói o objeto _relations para a IA cruzar dados sem ter que varrer tudo
 */
function buildRelations(data) {
  const cards = data.cards || [];
  const tasks = data.tasks || [];
  const products = data.products || [];
  const projections = data.projections || [];
  const benchmarks = data.benchmarks || [];

  // Tasks por card
  const tasksByCard = {};
  tasks.forEach(t => {
    if (!t.relatedCardId) return;
    if (!tasksByCard[t.relatedCardId]) tasksByCard[t.relatedCardId] = [];
    tasksByCard[t.relatedCardId].push(t.id);
  });

  // Videos por produto
  const videosByProduct = {};
  cards.forEach(c => {
    if (!c.productId) return;
    if (!videosByProduct[c.productId]) videosByProduct[c.productId] = [];
    videosByProduct[c.productId].push(c.id);
  });

  // Projeções por produto
  const projectionsByProduct = {};
  projections.forEach(p => {
    if (!p.productId) return;
    if (!projectionsByProduct[p.productId]) projectionsByProduct[p.productId] = [];
    projectionsByProduct[p.productId].push(p.id);
  });

  // Videos por benchmark (videos meus que se inspiraram em cada benchmark)
  const videosByBenchmark = {};
  cards.forEach(c => {
    (c.basedOnBenchmarkIds || []).forEach(bid => {
      if (!videosByBenchmark[bid]) videosByBenchmark[bid] = [];
      videosByBenchmark[bid].push(c.id);
    });
  });

  // Gaps: nichos com muito benchmark e pouco vídeo seu
  const benchByNiche = {};
  benchmarks.forEach(b => { if (b.niche) benchByNiche[b.niche] = (benchByNiche[b.niche]||0) + 1; });
  const myVideosByNiche = {};
  cards.forEach(c => { if (c.niche) myVideosByNiche[c.niche] = (myVideosByNiche[c.niche]||0) + 1; });
  const nicheGaps = Object.entries(benchByNiche).map(([niche, bCount]) => ({
    niche,
    benchmarkCount: bCount,
    myVideoCount: myVideosByNiche[niche] || 0,
    gap: bCount - (myVideosByNiche[niche] || 0),
  })).filter(x => x.gap > 0).sort((a,b) => b.gap - a.gap);

  return {
    tasksByCard,
    videosByProduct,
    projectionsByProduct,
    videosByBenchmark,
    nicheGaps,
  };
}

// ===================== EXPORT =====================

export function exportData(options = {}) {
  const {
    sections = [],
    startDate,
    endDate,
    niche,
    status,
    flowStage,
    onlyFavorites = false,
    onlyCompleted = false,
    aiOptimized = false,
  } = options;

  const data = {};

  const applyFilters = (items, opts = {}) => {
    let filtered = [...items];
    filtered = filterByDateRange(filtered, startDate, endDate);
    filtered = filterByNiche(filtered, niche);
    if (opts.hasFavorite) filtered = filterByFavorite(filtered, onlyFavorites);
    if (opts.hasStatus) filtered = filterByStatus(filtered, status);
    return filtered;
  };

  if (sections.includes('flow')) {
    let cards = useVideoStore.getState().cards;
    if (flowStage) cards = cards.filter(c => c.status === flowStage);
    cards = filterByDateRange(cards, startDate, endDate);
    cards = filterByNiche(cards, niche);
    data.cards = aiOptimized ? cards.map(enrichCard) : cards;
  }
  if (sections.includes('headlines')) {
    data.headlines = applyFilters(useHeadlineStore.getState().headlines, { hasFavorite: true });
  }
  if (sections.includes('scripts')) {
    data.scripts = applyFilters(useScriptStore.getState().scripts, { hasFavorite: true });
  }
  if (sections.includes('images')) {
    data.images = applyFilters(useImageStore.getState().images);
  }
  if (sections.includes('musics')) {
    data.musics = applyFilters(useMusicStore.getState().musics);
  }
  if (sections.includes('tasks')) {
    let tasks = useTaskStore.getState().tasks;
    tasks = filterByDateRange(tasks, startDate, endDate);
    if (onlyCompleted) tasks = tasks.filter(t => t.status === 'done');
    else if (status) tasks = tasks.filter(t => t.status === status);
    
    // Scrub fake placeholder dates
    const cleanDate = (d) => (d === '0001-01-01' || d === '0001-01-01T00:00:00.000Z' || d === '0001-01-01T00:00:00Z') ? '' : (d || '');
    data.tasks = tasks.map(t => ({
      ...t,
      dueDate: cleanDate(t.dueDate),
      scheduledDate: cleanDate(t.scheduledDate)
    }));
  }
  if (sections.includes('benchmarks')) {
    let benchmarks = useBenchmarkStore.getState().benchmarks;
    benchmarks = filterByDateRange(benchmarks, startDate, endDate);
    benchmarks = filterByNiche(benchmarks, niche);
    data.benchmarks = aiOptimized ? benchmarks.map(enrichBenchmark) : benchmarks;
  }
  if (sections.includes('products')) {
    const products = useProductStore.getState().products;
    const projections = useProductStore.getState().projections;
    data.products = products;
    data.projections = aiOptimized ? projections.map(p => enrichProjection(p, products)) : projections;
  }
  if (sections.includes('niches')) {
    data.niches = useNicheStore.getState().niches;
  }
  if (sections.includes('settings')) {
    data.settings = {
      creatorVoice: useSettingsStore.getState().creatorVoice || {},
      niches: useNicheStore.getState().niches || []
    };
  }
  if (sections.includes('learnings') || sections.includes('aprendizados')) {
    data.learnings = applyFilters(useLearningStore.getState().learnings || [], { hasFavorite: true });
  }

  // ===== ENRICHMENT PARA IA =====
  if (aiOptimized) {
    const creatorVoice = useSettingsStore.getState().creatorVoice || {};
    const niches = useNicheStore.getState().niches || [];
    data._instructions = "Este JSON é o estado do app 'Roteiros' do criador. Leia _schema antes de tudo. Use _summary pra contexto geral. Use _relations pra cruzar entidades. _creatorVoice descreve o tom e estilo do criador — use isso ao gerar qualquer conteúdo. _niches contém os nichos configurados e ativos.";
    data._creatorVoice = creatorVoice;
    data._niches = niches;
    data._schema = buildSchema();
    data._summary = buildSummary(data);
    data._relations = buildRelations(data);
  }

  data._meta = {
    app: 'Roteiros',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    aiOptimized,
    filters: {
      sections,
      startDate: startDate || null,
      endDate: endDate || null,
      niche: niche || null,
      status: status || null,
      flowStage: flowStage || null,
      onlyFavorites,
      onlyCompleted,
    },
  };

  return data;
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `roteiros-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===================== MARKDOWN EXPORT =====================

export function exportMarkdownSummary() {
  const cards = useVideoStore.getState().cards;
  const active = cards.filter(c => !c.archived);
  const posted = cards.filter(c => c.archived);
  const benchmarks = useBenchmarkStore.getState().benchmarks;
  const products = useProductStore.getState().products;
  const learnings = useLearningStore.getState().learnings || [];

  const today = new Date().toLocaleDateString('pt-BR');
  let md = `# Roteiros — Resumo (${today})\n\n`;

  md += `## Visão Geral\n`;
  md += `- **${active.length}** vídeos em produção\n`;
  md += `- **${posted.length}** vídeos postados\n`;
  md += `- **${benchmarks.length}** benchmarks analisados\n`;
  md += `- **${products.length}** produtos cadastrados\n`;
  md += `- **${learnings.length}** aprendizados catalogados\n\n`;

  md += `## Pipeline Ativo\n`;
  const stages = [
    ['creating', 'Em criação'],
    ['ready-to-record', 'Pronto p/ gravar'],
    ['recorded', 'Gravado'],
    ['editing', 'Em edição'],
  ];
  stages.forEach(([id, label]) => {
    const items = active.filter(c => c.status === id);
    md += `\n### ${label} (${items.length})\n`;
    items.forEach(c => {
      md += `- ${c.niche ? `[${c.niche}] ` : ''}**${c.headline || 'Sem headline'}**\n`;
    });
  });

  if (products.length > 0) {
    md += `\n## Produtos\n`;
    products.forEach(p => {
      md += `- **${p.name}** — ${p.ticketType} — R$ ${(Number(p.price) || 0).toFixed(2)}\n`;
    });
  }

  if (benchmarks.length > 0) {
    md += `\n## Últimos Benchmarks\n`;
    benchmarks.slice(0, 10).forEach(b => {
      md += `- **${b.headline || 'Sem headline'}** — ${b.creator || 'sem creator'} (${b.niche || 'sem nicho'})\n`;
    });
  }

  if (learnings.length > 0) {
    md += `\n## Últimos Aprendizados\n`;
    learnings.slice(0, 10).forEach(l => {
      md += `- **${l.title || 'Sem título'}** ${l.niche ? `(${l.niche})` : ''}\n`;
    });
  }

  const creatorVoice = useSettingsStore.getState().creatorVoice;
  if (creatorVoice && (creatorVoice.bio || creatorVoice.style)) {
    md += `\n## Voz do Criador\n`;
    if (creatorVoice.bio) md += `- **Identidade:** ${creatorVoice.bio}\n`;
    if (creatorVoice.style) md += `- **Estilo:** ${creatorVoice.style}\n`;
    if (creatorVoice.wordsToUse) md += `- **Usa:** ${creatorVoice.wordsToUse}\n`;
    if (creatorVoice.wordsToAvoid) md += `- **Evita:** ${creatorVoice.wordsToAvoid}\n`;
    if (creatorVoice.examples) md += `- **Exemplo:** ${creatorVoice.examples}\n`;
  }

  const niches = useNicheStore.getState().niches;
  if (niches && niches.length > 0) {
    md += `\n## Nichos Ativos\n`;
    md += `- ${niches.join(', ')}\n`;
  }

  return md;
}

export function downloadMarkdown(md, filename) {
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `roteiros-resumo-${new Date().toISOString().split('T')[0]}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===================== COUNTS =====================

export function countExportItems(data) {
  let total = 0;
  if (data.cards) total += data.cards.length;
  if (data.headlines) total += data.headlines.length;
  if (data.scripts) total += data.scripts.length;
  if (data.images) total += data.images.length;
  if (data.musics) total += data.musics.length;
  if (data.tasks) total += data.tasks.length;
  if (data.benchmarks) total += data.benchmarks.length;
  if (data.products) total += data.products.length;
  if (data.projections) total += data.projections.length;
  if (data.learnings) total += data.learnings.length;
  if (data.settings) total += 1;
  return total;
}

// ===================== IMPORT =====================

export function importData(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (data._meta?.app !== 'Roteiros' && data._meta?.app !== 'Otimizador') {
      throw new Error('Arquivo não é um export válido do Roteiros');
    }
    if (data.cards) useVideoStore.getState().importCards(data.cards);
    if (data.headlines) useHeadlineStore.getState().importHeadlines(data.headlines);
    if (data.scripts) useScriptStore.getState().importScripts(data.scripts);
    if (data.images) useImageStore.getState().importImages(data.images);
    if (data.musics) useMusicStore.getState().importMusics(data.musics);
    if (data.tasks) useTaskStore.getState().importTasks(data.tasks);
    if (data.benchmarks) useBenchmarkStore.getState().importBenchmarks(data.benchmarks);
    if (data.products) useProductStore.getState().importProducts(data.products);
    if (data.projections) useProductStore.getState().importProjections(data.projections);
    if (data.learnings) useLearningStore.getState().importLearnings(data.learnings);
    
    // Import Settings (Creator Voice & Niches)
    if (data.settings) {
      if (data.settings.creatorVoice) {
        useSettingsStore.getState().setCreatorVoice(data.settings.creatorVoice);
      }
      if (data.settings.niches && Array.isArray(data.settings.niches)) {
        const currentNiches = useNicheStore.getState().niches || [];
        const mergedNiches = Array.from(new Set([...currentNiches, ...data.settings.niches]));
        useNicheStore.setState({ niches: mergedNiches });
      }
    } else if (data.niches && Array.isArray(data.niches)) {
      // Fallback for older exports where niches were exported at root
      const currentNiches = useNicheStore.getState().niches || [];
      const mergedNiches = Array.from(new Set([...currentNiches, ...data.niches]));
      useNicheStore.setState({ niches: mergedNiches });
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function clearAllData() {
  useVideoStore.getState().importCards([]);
  useHeadlineStore.getState().importHeadlines([]);
  useScriptStore.getState().importScripts([]);
  useImageStore.getState().importImages([]);
  useMusicStore.getState().importMusics([]);
  useTaskStore.getState().importTasks([]);
  useBenchmarkStore.getState().importBenchmarks([]);
  useProductStore.getState().importProducts([]);
  useProductStore.getState().importProjections([]);
  useLearningStore.getState().importLearnings([]);
}
