import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Search, ExternalLink, Eye, RotateCcw, TrendingUp,
  Calendar, Clock, FileText, Image, Music, Trophy, AlertCircle, Minus
} from 'lucide-react';
import useVideoStore, { PERFORMANCE_LEVELS } from '../stores/useVideoStore';
import useProductStore from '../stores/useProductStore';
import useNicheStore from '../stores/useNicheStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const perfIcon = (level) => {
  if (level === 'viral') return Trophy;
  if (level === 'medium') return Minus;
  if (level === 'flop') return AlertCircle;
  return Eye;
};

export default function PostadosPage() {
  const cards = useVideoStore(s => s.cards);
  const unarchiveCard = useVideoStore(s => s.unarchiveCard);
  const updateCard = useVideoStore(s => s.updateCard);
  const products = useProductStore(s => s.products);
  const niches = useNicheStore(s => s.niches);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [perfFilter, setPerfFilter] = useState('');
  const [activeId, setActiveId] = useState(null);

  const archived = useMemo(() => cards.filter(c => c.archived), [cards]);

  const filtered = useMemo(() => {
    return archived.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const match = (c.headline || '').toLowerCase().includes(q)
          || (c.script || '').toLowerCase().includes(q)
          || (c.niche || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (nicheFilter && c.niche !== nicheFilter) return false;
      if (perfFilter && (c.performance || '') !== perfFilter) return false;
      return true;
    }).sort((a, b) => {
      const dA = a.postedAt || a.updatedAt;
      const dB = b.postedAt || b.updatedAt;
      return new Date(dB) - new Date(dA);
    });
  }, [archived, search, nicheFilter, perfFilter]);

  const active = filtered.find(c => c.id === activeId);

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const total = archived.length;
    const viral = archived.filter(c => c.performance === 'viral').length;
    const flop = archived.filter(c => c.performance === 'flop').length;
    const unrated = archived.filter(c => !c.performance).length;
    return { total, viral, flop, unrated };
  }, [archived]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex-shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <CheckCircle2 size={20} style={{ color: '#10B981' }} /> Postados
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Arquivo de vídeos publicados — consulte performance e padrões do que funcionou
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 mb-3 grid grid-cols-4 gap-3 flex-shrink-0">
        <div className="stat-card">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Total postados</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{stats.viral}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Viralizaram</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>{stats.flop}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Não renderam</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>{stats.unrated}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Sem avaliação</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-3 flex gap-2 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9 h-9 text-sm" placeholder="Buscar nos postados..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-9 text-sm" value={nicheFilter} onChange={e => setNicheFilter(e.target.value)}>
          <option value="">Todos nichos</option>
          {niches.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="input-field h-9 text-sm" value={perfFilter} onChange={e => setPerfFilter(e.target.value)}>
          {PERFORMANCE_LEVELS.map(p => <option key={p.id || 'none'} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle2 size={48} style={{ color: 'var(--border-color)' }} className="mx-auto mb-3" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Nenhum vídeo postado ainda</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Quando você marcar um vídeo como postado no Fluxo, ele aparece aqui
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(card => {
              const perfLevel = PERFORMANCE_LEVELS.find(p => p.id === (card.performance || ''));
              const PerfIcon = perfIcon(card.performance);
              const product = card.productId ? products.find(p => p.id === card.productId) : null;
              return (
                <div key={card.id} className="glass-card p-4 cursor-pointer hover:border-[var(--accent)] transition-all group"
                  onClick={() => setActiveId(card.id)}
                  style={{ borderLeftWidth: '3px', borderLeftColor: perfLevel?.color || 'var(--border-color)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold line-clamp-2 flex-1 pr-2" style={{ color: 'var(--text-primary)' }}>
                      {card.headline || 'Sem headline'}
                    </p>
                    <PerfIcon size={14} style={{ color: perfLevel?.color, flexShrink: 0 }} />
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {card.niche && <span className="badge">{card.niche}</span>}
                    {product && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)' }}>
                        → {product.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={10} />
                    {card.postedAt ? format(new Date(card.postedAt), "dd/MM/yyyy", { locale: ptBR }) : '—'}
                    {card.script && (
                      <>
                        <span>·</span>
                        <FileText size={10} />
                        {card.script.split(/\s+/).filter(Boolean).length} palavras
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalhes / avaliação */}
      {active && (
        <div className="overlay animate-fade-in" onClick={() => setActiveId(null)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded-2xl p-6 z-50 animate-scale-in glass-strong max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {active.headline || 'Sem headline'}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Postado em {active.postedAt ? format(new Date(active.postedAt), "dd/MM/yyyy", { locale: ptBR }) : '—'}
                  {active.niche && ` · ${active.niche}`}
                </p>
              </div>
              <button onClick={() => setActiveId(null)} className="p-1.5 rounded hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            {/* Avaliação de performance */}
            <div className="mb-5">
              <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Como esse vídeo performou?
              </label>
              <div className="flex gap-2 flex-wrap">
                {PERFORMANCE_LEVELS.map(p => (
                  <button key={p.id || 'none'}
                    onClick={() => updateCard(active.id, { performance: p.id })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: active.performance === p.id ? p.color + '22' : 'var(--surface)',
                      border: `1px solid ${active.performance === p.id ? p.color : 'var(--border-color)'}`,
                      color: active.performance === p.id ? p.color : 'var(--text-muted)',
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <textarea className="textarea-field mt-2 text-sm" style={{ minHeight: '60px' }}
                placeholder="Notas de performance (views, comentários, conversão, o que funcionou ou não)..."
                value={active.performanceNotes || ''}
                onChange={e => updateCard(active.id, { performanceNotes: e.target.value })} />
            </div>

            {/* Conteúdo do vídeo */}
            {active.script && (
              <details className="mb-4">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Ver roteiro completo
                </summary>
                <div className="mt-2 p-4 rounded-lg text-sm whitespace-pre-wrap" style={{
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.7',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {active.script}
                </div>
              </details>
            )}

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              {active.externalLink && (
                <a href={active.externalLink} target="_blank" rel="noopener noreferrer"
                  className="btn-ghost text-xs flex items-center gap-1.5">
                  <ExternalLink size={13} /> Abrir link
                </a>
              )}
              <button className="btn-ghost text-xs flex items-center gap-1.5" onClick={() => navigate('/videos')}>
                <Eye size={13} /> Ver detalhes completos
              </button>
              <button
                className="btn-ghost text-xs flex items-center gap-1.5 ml-auto"
                style={{ color: '#F59E0B' }}
                onClick={() => {
                  if (window.confirm('Trazer este vídeo de volta para o fluxo ativo (em "Em edição")?')) {
                    unarchiveCard(active.id, 'editing');
                    setActiveId(null);
                  }
                }}>
                <RotateCcw size={13} /> Desarquivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
