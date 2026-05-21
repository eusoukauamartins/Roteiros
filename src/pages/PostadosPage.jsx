import { useState, useMemo, useEffect, useCallback, useRef, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Search, Eye, TrendingUp, Save,
  Calendar, Clock, FileText, Trophy, AlertCircle, Minus, X,
  Telescope, BarChart2, Heart, MessageCircle, RotateCcw, Trash2,
  Share2, BookmarkIcon, Tag, Zap, Target, ChevronDown, AlertTriangle, Lightbulb
} from 'lucide-react';
import useVideoStore, { PERFORMANCE_LEVELS, FLOW_COLUMNS } from '../stores/useVideoStore';
import useProductStore from '../stores/useProductStore';
import useNicheStore from '../stores/useNicheStore';
import useBenchmarkStore from '../stores/useBenchmarkStore';
import { getNowInSaoPauloISO } from '../utils/dateUtils';

/* ── Performance icon helper ── */
const perfIcon = (level) => {
  if (level === 'viral') return Trophy;
  if (level === 'medium') return Minus;
  if (level === 'flop') return AlertCircle;
  return Eye;
};

/* ── Normalize card into safe shape for modal editing ── */
function normalizeDraft(card) {
  if (!card) return null;
  const pats = card.patterns || {};
  return {
    ...card,
    headline: card.headline || '',
    script: card.script || '',
    cta: card.cta || '',
    niche: card.niche || '',
    status: card.status || 'posted',
    platform: card.platform || '',
    performance: card.performance || '',
    performanceNotes: card.performanceNotes || '',
    postedAt: card.postedAt || null,
    notes: card.notes || '',
    tags: Array.isArray(card.tags) ? card.tags : [],
    structureTags: Array.isArray(card.structureTags) ? card.structureTags : [],
    externalLink: card.externalLink || '',
    productId: card.productId || null,
    metrics: {
      views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
      avgWatchTime: 0, retention3s: 0, retention10s: 0, ctr: 0, engagementRate: 0,
      ...(card.metrics || {}),
    },
    analysis: {
      whatWorked: '', whatFailed: '', hypothesis: '', nextImprovements: '',
      ...(card.analysis || {}),
    },
    patterns: {
      hookType: pats.hookType || '',
      ctaType: pats.ctaType || '',
      emotions: Array.isArray(pats.emotions) ? pats.emotions : [],
      structureTags: Array.isArray(pats.structureTags) ? pats.structureTags : [],
    },
  };
}

/* ── Error Boundary for the modal ── */
class ModalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('[PostadosPage Modal Error]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl p-8 text-center"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <AlertTriangle size={32} className="mx-auto mb-3" style={{ color: '#F59E0B' }} />
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Erro ao abrir vídeo</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Não foi possível carregar os dados deste vídeo.</p>
            <button className="btn-accent text-xs px-4 py-2" onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}>Fechar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Structure / Pattern tag presets ── */
const EMOTION_TAGS = [
  'curiosidade', 'autoridade', 'controvérsia', 'storytelling',
  'medo', 'opinião forte', 'mistério', 'valor prático',
  'prova social', 'notícia', 'reconhecimento', 'recompensa',
];

const HOOK_TYPES = ['pergunta', 'afirmação chocante', 'desafio', 'história', 'dado/estatística', 'polêmica', 'promessa'];
const CTA_TYPES = ['seguir', 'comentar', 'compartilhar', 'link na bio', 'DM', 'salvar', 'comprar', 'outro'];
const PLATFORMS = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'YouTube', 'Twitter/X', 'LinkedIn', 'Outro'];

/* ── Metric Input Card ── */
function MetricInput({ label, icon: Icon, value, onChange, suffix, color }) {
  return (
    <div className="p-3 rounded-xl border transition-all focus-within:border-[var(--accent)]"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
      <label className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5"
        style={{ color: 'var(--text-muted)' }}>
        {Icon && <Icon size={11} />} {label}
      </label>
      <div className="flex items-baseline gap-1">
        <input type="number" step="any"
          className="bg-transparent border-none outline-none w-full text-lg font-bold"
          style={{ color: color || 'var(--text-primary)' }}
          value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="0" />
        {suffix && <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

/* ── Tag Toggle Button ── */
function TagToggle({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
      style={{
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-muted)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border-color)'}`,
      }}>
      {label}
    </button>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color || 'var(--accent)' }} />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em]"
        style={{ color: color || 'var(--accent-light)' }}>
        {Icon && <Icon size={13} className="inline mr-1.5" style={{ verticalAlign: '-2px' }} />}
        {label}
      </h3>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
export default function PostadosPage() {
  const cards = useVideoStore(s => s.cards);
  const updateCard = useVideoStore(s => s.updateCard);
  const unarchiveCard = useVideoStore(s => s.unarchiveCard);
  const deleteCard = useVideoStore(s => s.deleteCard);
  const products = useProductStore(s => s.products);
  const niches = useNicheStore(s => s.niches);
  const addBenchmark = useBenchmarkStore(s => s.addBenchmark);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [perfFilter, setPerfFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnarchiveMenu, setShowUnarchiveMenu] = useState(false);

  /* ── Draft editing state ── */
  const [draft, setDraft] = useState(null);
  const snapshotRef = useRef(null);

  // Initialize draft when activeId changes
  useEffect(() => {
    if (activeId) {
      const card = cards.find(c => c.id === activeId);
      if (card) {
        try {
          const raw = JSON.parse(JSON.stringify(card));
          const safe = normalizeDraft(raw);
          snapshotRef.current = JSON.parse(JSON.stringify(safe));
          setDraft(safe);
        } catch (err) {
          console.error('[PostadosPage] Failed to init draft:', err);
          setDraft(null);
          snapshotRef.current = null;
        }
      } else {
        setDraft(null);
        snapshotRef.current = null;
      }
    } else {
      setDraft(null);
      snapshotRef.current = null;
    }
    // Reset action UI when modal opens/closes
    setShowDeleteConfirm(false);
    setShowUnarchiveMenu(false);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const archived = useMemo(() => cards.filter(c => c.archived), [cards]);

  const filtered = useMemo(() => {
    return archived.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const match = (c.headline || '').toLowerCase().includes(q)
          || (c.script || '').toLowerCase().includes(q)
          || (c.notes || '').toLowerCase().includes(q)
          || (c.niche || '').toLowerCase().includes(q)
          || (c.tags || []).some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (nicheFilter && c.niche !== nicheFilter) return false;
      if (perfFilter && (c.performance || '') !== perfFilter) return false;
      if (platformFilter && (c.platform || '') !== platformFilter) return false;
      if (dateFrom || dateTo) {
        const posted = (c.postedAt || c.updatedAt || '').split('T')[0];
        if (!posted) return false;
        if (dateFrom && posted < dateFrom) return false;
        if (dateTo && posted > dateTo) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.postedAt || b.updatedAt) - new Date(a.postedAt || a.updatedAt));
  }, [archived, search, nicheFilter, perfFilter, platformFilter, dateFrom, dateTo]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = archived.length;
    const viral = archived.filter(c => c.performance === 'viral').length;
    const medium = archived.filter(c => c.performance === 'medium').length;
    const flop = archived.filter(c => c.performance === 'flop').length;
    const unrated = archived.filter(c => !c.performance).length;
    const totalViews = archived.reduce((s, c) => s + (Number(c.metrics?.views) || 0), 0);
    const totalEngagement = archived.reduce((s, c) => s + (Number(c.metrics?.engagementRate) || 0), 0);
    const avgEngagement = total > 0 ? (totalEngagement / total).toFixed(1) : '0';
    return { total, viral, medium, flop, unrated, totalViews, avgEngagement };
  }, [archived]);

  /* ── Draft update helpers (local only, not store) ── */
  const updateDraft = useCallback((field, value) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const updateMetric = useCallback((field, value) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, metrics: { ...(prev.metrics || {}), [field]: value === '' ? '' : Number(value) || 0 } };
    });
  }, []);

  const updateAnalysis = useCallback((field, value) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, analysis: { ...(prev.analysis || {}), [field]: value } };
    });
  }, []);

  const updatePatterns = useCallback((field, value) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, patterns: { ...(prev.patterns || {}), [field]: value } };
    });
  }, []);

  const togglePatternTag = useCallback((field, tag) => {
    setDraft(prev => {
      if (!prev) return prev;
      const current = (prev.patterns || {})[field] || [];
      const next = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];
      return { ...prev, patterns: { ...(prev.patterns || {}), [field]: next } };
    });
  }, []);

  /* ── Save / Cancel ── */
  const handleSave = () => {
    if (!draft || !activeId) return;
    updateCard(activeId, draft);
    setActiveId(null);
  };

  const handleCancel = () => {
    // Restore original snapshot
    if (snapshotRef.current && activeId) {
      updateCard(activeId, snapshotRef.current);
    }
    setActiveId(null);
  };

  /* ── Actions ── */

  const convertToBenchmark = () => {
    if (!draft) return;
    addBenchmark({
      headline: draft.headline || '',
      script: draft.script || '',
      niche: draft.niche || '',
      creator: 'Eu (auto-referência)',
      tags: draft.tags || [],
      platform: draft.platform || '',
    });
    alert('Benchmark criado a partir deste vídeo!');
  };

  const handleUnarchive = (targetStatus) => {
    if (!activeId) return;
    // Save draft first, then unarchive
    if (draft) updateCard(activeId, draft);
    unarchiveCard(activeId, targetStatus);
    setActiveId(null);
  };

  const handleDelete = () => {
    if (!activeId) return;
    deleteCard(activeId);
    setShowDeleteConfirm(false);
    setActiveId(null);
  };

  /* ── Format date safely ── */
  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return '—'; }
  };

  const hasFilters = search || nicheFilter || perfFilter || platformFilter || dateFrom || dateTo;
  const clearFilters = () => { setSearch(''); setNicheFilter(''); setPerfFilter(''); setPlatformFilter(''); setDateFrom(''); setDateTo(''); };

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle2 size={18} style={{ color: '#10B981' }} /> Postados
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Conteúdo publicado · análise de performance
          </p>
        </div>
        <div className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
          {filtered.length} de {archived.length} vídeos
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="px-6 pb-2 grid grid-cols-7 gap-2 flex-shrink-0">
        {[
          { value: stats.total, label: 'Total', color: 'var(--text-primary)' },
          { value: stats.viral, label: 'Viral', color: '#10B981' },
          { value: stats.medium, label: 'Médio', color: '#F59E0B' },
          { value: stats.flop, label: 'Flop', color: '#EF4444' },
          { value: stats.unrated, label: 'S/ avaliação', color: 'var(--text-muted)' },
          { value: stats.totalViews.toLocaleString('pt-BR'), label: 'Views', color: 'var(--accent-light)' },
          { value: `${stats.avgEngagement}%`, label: 'Eng. médio', color: 'var(--accent-light)' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-lg px-3 py-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
            <p className="text-lg font-bold leading-tight" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[9px] font-medium uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* ── Compact Filter Bar ── */}
      <div className="px-6 py-2 flex items-center gap-1.5 flex-shrink-0 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-7 text-[11px]" placeholder="Buscar..."
            style={{ height: '30px', width: '180px', padding: '0 8px 0 28px' }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field text-[11px]" value={nicheFilter} onChange={e => setNicheFilter(e.target.value)}
          style={{ height: '30px', padding: '0 24px 0 8px', minWidth: '100px' }}>
          <option value="">Nicho</option>
          {niches.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="input-field text-[11px]" value={perfFilter} onChange={e => setPerfFilter(e.target.value)}
          style={{ height: '30px', padding: '0 24px 0 8px', minWidth: '110px' }}>
          {PERFORMANCE_LEVELS.map(p => <option key={p.id || 'none'} value={p.id}>{p.label}</option>)}
        </select>
        <select className="input-field text-[11px]" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
          style={{ height: '30px', padding: '0 24px 0 8px', minWidth: '105px' }}>
          <option value="">Plataforma</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="w-px h-4 mx-1" style={{ background: 'var(--border-color)' }} />
        <div className="flex items-center gap-1">
          <input type="date" className="input-field text-[11px]" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)} title="De"
            style={{ height: '30px', padding: '0 4px 0 6px', width: '120px' }} />
          <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>→</span>
          <input type="date" className="input-field text-[11px]" value={dateTo}
            onChange={e => setDateTo(e.target.value)} title="Até"
            style={{ height: '30px', padding: '0 4px 0 6px', width: '120px' }} />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="ml-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-all hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--accent-light)' }}>
            <X size={11} className="inline -mt-px mr-0.5" /> Limpar
          </button>
        )}
        <div className="flex-1" />
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Content Grid ── */}
      <div className="flex-1 overflow-y-auto px-6 py-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={36} style={{ color: 'var(--border-color)' }} className="mx-auto mb-2" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Nenhum vídeo postado encontrado</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Marque um vídeo como postado no pipeline para vê-lo aqui
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
            {filtered.map(card => {
              const perfLevel = PERFORMANCE_LEVELS.find(p => p.id === (card.performance || ''));
              const PerfIcon = perfIcon(card.performance);
              const product = card.productId ? products.find(p => p.id === card.productId) : null;
              const m = card.metrics || {};
              return (
                <div key={card.id} className="glass-card p-3 cursor-pointer hover:border-[var(--accent)] transition-all group"
                  onClick={() => setActiveId(card.id)}
                  style={{ borderLeftWidth: '3px', borderLeftColor: perfLevel?.color || 'var(--border-color)' }}>
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-[13px] font-semibold line-clamp-2 flex-1 pr-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {card.headline || 'Sem headline'}
                    </p>
                    <PerfIcon size={13} style={{ color: perfLevel?.color, flexShrink: 0, marginTop: '2px' }} />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {card.niche && <span className="text-[8px] px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)' }}>{card.niche}</span>}
                    {card.platform && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                        {card.platform}
                      </span>
                    )}
                    {product && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                        → {product.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-[9px] pt-1.5 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                    <span className="flex items-center gap-1"><Calendar size={9} /> {fmtDate(card.postedAt)}</span>
                    {m.views > 0 && <span className="flex items-center gap-1"><Eye size={9} /> {Number(m.views).toLocaleString('pt-BR')}</span>}
                    {m.engagementRate > 0 && <span className="flex items-center gap-1"><TrendingUp size={9} /> {m.engagementRate}%</span>}
                  </div>
                  {(card.tags || []).length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {card.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{t}</span>
                      ))}
                      {card.tags.length > 3 && <span className="text-[9px] px-1 py-0.5" style={{ color: 'var(--text-muted)' }}>+{card.tags.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════ ANALYSIS MODAL ══════ */}
      <ModalErrorBoundary onReset={() => setActiveId(null)}>
      {draft && (
        <div className="overlay animate-fade-in" onClick={() => setActiveId(null)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl rounded-2xl p-0 z-50 animate-scale-in glass-strong max-h-[92vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {draft.headline || 'Sem headline'}
                </h2>
                <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={11} /> Postado em {fmtDate(draft.postedAt)}
                  {draft.niche && <> · {draft.niche}</>}
                  {draft.platform && <> · {draft.platform}</>}
                </p>
              </div>
              <button onClick={() => setActiveId(null)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body — Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

              {/* ── SECTION 1: Main Info ── */}
              <div>
                <SectionHeader icon={FileText} label="Informações Principais" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="field-label">Plataforma</label>
                    <select className="input-field text-sm" value={draft.platform || ''}
                      onChange={e => updateDraft('platform', e.target.value)}>
                      <option value="">Selecione...</option>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Data de postagem</label>
                    <input type="date" className="input-field text-sm"
                      value={draft.postedAt ? draft.postedAt.split('T')[0] : ''}
                      onChange={e => updateDraft('postedAt', e.target.value ? e.target.value + 'T12:00:00' : '')} />
                  </div>
                </div>
                {draft.script && (
                  <details className="mb-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Ver roteiro completo ({draft.script.split(/\s+/).filter(Boolean).length} palavras)
                    </summary>
                    <div className="mt-2 p-4 rounded-lg text-sm whitespace-pre-wrap" style={{
                      background: 'var(--surface)', color: 'var(--text-primary)', lineHeight: '1.7', maxHeight: '200px', overflowY: 'auto',
                    }}>
                      {draft.script}
                    </div>
                  </details>
                )}
              </div>

              {/* ── SECTION 2: Metrics ── */}
              <div>
                <SectionHeader icon={BarChart2} label="Métricas" color="#3B82F6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <MetricInput label="Views" icon={Eye} value={draft.metrics?.views} onChange={v => updateMetric('views', v)} />
                  <MetricInput label="Likes" icon={Heart} value={draft.metrics?.likes} onChange={v => updateMetric('likes', v)} />
                  <MetricInput label="Comentários" icon={MessageCircle} value={draft.metrics?.comments} onChange={v => updateMetric('comments', v)} />
                  <MetricInput label="Compartilhamentos" icon={Share2} value={draft.metrics?.shares} onChange={v => updateMetric('shares', v)} />
                  <MetricInput label="Salvamentos" icon={BookmarkIcon} value={draft.metrics?.saves} onChange={v => updateMetric('saves', v)} />
                  <MetricInput label="Watch Time Médio" icon={Clock} value={draft.metrics?.avgWatchTime} onChange={v => updateMetric('avgWatchTime', v)} suffix="s" />
                  <MetricInput label="Retenção 3s" icon={TrendingUp} value={draft.metrics?.retention3s} onChange={v => updateMetric('retention3s', v)} suffix="%" color="#10B981" />
                  <MetricInput label="Retenção 10s" icon={TrendingUp} value={draft.metrics?.retention10s} onChange={v => updateMetric('retention10s', v)} suffix="%" color="#F59E0B" />
                  <MetricInput label="CTR" icon={Target} value={draft.metrics?.ctr} onChange={v => updateMetric('ctr', v)} suffix="%" />
                  <MetricInput label="Engajamento" icon={Zap} value={draft.metrics?.engagementRate} onChange={v => updateMetric('engagementRate', v)} suffix="%" color="#8B5CF6" />
                </div>
              </div>

              {/* ── SECTION 3: Performance ── */}
              <div>
                <SectionHeader icon={Trophy} label="Performance" color="#F59E0B" />
                <div className="flex gap-2 flex-wrap mb-3">
                  {PERFORMANCE_LEVELS.map(p => (
                    <button key={p.id || 'none'}
                      onClick={() => updateDraft('performance', p.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: draft.performance === p.id ? p.color + '22' : 'var(--surface)',
                        border: `1.5px solid ${draft.performance === p.id ? p.color : 'var(--border-color)'}`,
                        color: draft.performance === p.id ? p.color : 'var(--text-muted)',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <textarea className="textarea-field text-sm" style={{ minHeight: '60px' }}
                  placeholder="Notas de performance..."
                  value={draft.performanceNotes || ''}
                  onChange={e => updateDraft('performanceNotes', e.target.value)} />
              </div>

              {/* ── SECTION 4: Strategic Analysis ── */}
              <div>
                <SectionHeader icon={Lightbulb} label="Análise Estratégica" color="#10B981" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">✅ O que funcionou</label>
                    <textarea className="textarea-field text-sm" style={{ minHeight: '80px' }}
                      placeholder="Retenção alta, hook forte, identificação..."
                      value={draft.analysis?.whatWorked || ''}
                      onChange={e => updateAnalysis('whatWorked', e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">❌ O que falhou</label>
                    <textarea className="textarea-field text-sm" style={{ minHeight: '80px' }}
                      placeholder="Hook fraco, CTA confuso, edição lenta..."
                      value={draft.analysis?.whatFailed || ''}
                      onChange={e => updateAnalysis('whatFailed', e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">💡 Hipótese</label>
                    <textarea className="textarea-field text-sm" style={{ minHeight: '80px' }}
                      placeholder="Viralizou por controvérsia? Alta retenção inicial?"
                      value={draft.analysis?.hypothesis || ''}
                      onChange={e => updateAnalysis('hypothesis', e.target.value)} />
                  </div>
                  <div>
                    <label className="field-label">🔄 Próximas melhorias</label>
                    <textarea className="textarea-field text-sm" style={{ minHeight: '80px' }}
                      placeholder="Testar hook diferente, encurtar intro..."
                      value={draft.analysis?.nextImprovements || ''}
                      onChange={e => updateAnalysis('nextImprovements', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: Identified Patterns ── */}
              <div>
                <SectionHeader icon={Tag} label="Padrões Identificados" color="#8B5CF6" />

                <div className="mb-4">
                  <label className="field-label mb-2">Emoções / Gatilhos Usados</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOTION_TAGS.map(tag => (
                      <TagToggle key={tag} label={tag}
                        active={(draft.patterns?.emotions || []).includes(tag)}
                        onClick={() => togglePatternTag('emotions', tag)} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="field-label">Tipo de Hook</label>
                    <select className="input-field text-sm" value={draft.patterns?.hookType || ''}
                      onChange={e => updatePatterns('hookType', e.target.value)}>
                      <option value="">Selecione...</option>
                      {HOOK_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Tipo de CTA</label>
                    <select className="input-field text-sm" value={draft.patterns?.ctaType || ''}
                      onChange={e => updatePatterns('ctaType', e.target.value)}>
                      <option value="">Selecione...</option>
                      {CTA_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label mb-2">Tags Estruturais</label>
                  <input className="input-field text-sm" placeholder="Separe por vírgula: storytelling, transição rápida..."
                    value={(draft.patterns?.structureTags || []).join(', ')}
                    onChange={e => updatePatterns('structureTags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                </div>
              </div>

            </div>

            {/* Modal Footer — Actions */}
            <div className="flex items-center justify-between p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
              {/* LEFT: Utility actions */}
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs flex items-center gap-1.5" onClick={convertToBenchmark}>
                  <Telescope size={13} /> Criar benchmark
                </button>
                <div className="relative">
                  <button className="btn-ghost text-xs flex items-center gap-1.5"
                    style={{ color: '#F59E0B' }}
                    onClick={() => setShowUnarchiveMenu(p => !p)}>
                    <RotateCcw size={13} /> Desarquivar
                    <ChevronDown size={10} />
                  </button>
                  {showUnarchiveMenu && (
                    <div className="absolute bottom-full left-0 mb-1 w-52 rounded-xl overflow-hidden z-50 animate-scale-in"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
                      <div className="p-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Restaurar para...
                      </div>
                      {FLOW_COLUMNS.map(col => (
                        <button key={col.id}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-2"
                          style={{ color: 'var(--text-primary)' }}
                          onClick={() => { handleUnarchive(col.id); setShowUnarchiveMenu(false); }}>
                          <span>{col.emoji}</span> {col.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Primary actions */}
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs" onClick={handleCancel}>Cancelar</button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={12} /> Excluir
                </button>
                <button className="btn-accent flex items-center gap-2 text-xs" onClick={handleSave}>
                  <Save size={14} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </ModalErrorBoundary>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <>
          <div className="overlay animate-fade-in" style={{ zIndex: 60 }} onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <Trash2 size={22} style={{ color: '#EF4444' }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Excluir vídeo postado?
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  "{draft?.headline || 'Sem headline'}" será movido para a lixeira.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button className="btn-ghost flex-1 text-sm py-2.5" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
                <button className="flex-1 text-sm py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  onClick={handleDelete}>
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
