import { useState, useMemo } from 'react';
import {
  Telescope, Search, Plus, Clock, FileText,
  User, Link as LinkIcon, Image, Music, Tag, Target,
  ChevronDown, X, Play, Copy, Trash2, Eye, Filter, ArrowRight, RotateCcw
} from 'lucide-react';
import useBenchmarkStore from '../stores/useBenchmarkStore';
import useMusicStore from '../stores/useMusicStore';
import useImageStore from '../stores/useImageStore';
import useVideoStore from '../stores/useVideoStore';
import { useNavigate } from 'react-router-dom';
import { countCharacters, countWords, estimateSpeechTime, formatSeconds } from '../utils/textUtils';

const CTA_TYPES = [
  'Seguir perfil',
  'Comentar palavra-chave',
  'WhatsApp',
  'Link na bio',
  'Direct message',
  'Comprar produto',
  'Aplicar para mentoria',
  'Outro'
];

function MacroGroup({ label, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4 flex items-center gap-2" style={{ color: 'var(--accent-light)' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div> {label}
      </h3>
      <div className="space-y-5 p-5 rounded-2xl border bg-[var(--surface)] relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        {children}
      </div>
    </div>
  );
}

// Custom Repeatable Rows for Benchmark References
function ReferenceRows({ items, type, onUpdate }) {
  const isMusic = type === 'music';
  const icon = isMusic ? <Music size={14} style={{ color: '#10B981' }} /> : <Image size={14} style={{ color: '#EC4899' }} />;
  const label = isMusic ? 'Música / Áudio' : 'Referência Visual';
  
  const addRow = () => onUpdate([...items, { id: Date.now().toString(), name: '', link: '' }]);
  const updateRow = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = val;
    onUpdate(newItems);
  };
  const removeRow = (idx) => onUpdate(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
        {icon} {label}
      </div>
      <div className="space-y-2 mb-3">
        {(Array.isArray(items) ? items : []).map((item, idx) => (
          <div key={item?.id || idx} className="flex gap-2 items-center p-2 rounded-xl bg-[var(--bg-secondary)] border" style={{ borderColor: 'var(--border-color)' }}>
            <input className="input-field text-xs h-8 flex-[2]" placeholder={isMusic ? "Nome da música..." : "Descrição visual..."}
              value={item?.name || ''} onChange={e => updateRow(idx, 'name', e.target.value)} />
            <input className="input-field text-xs h-8 flex-[3]" placeholder="URL / Link"
              value={item?.link || ''} onChange={e => updateRow(idx, 'link', e.target.value)} />
            <button onClick={() => removeRow(idx)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button className="btn-ghost text-[10px] py-1.5 px-3 flex items-center gap-1.5" onClick={addRow}>
        <Plus size={12} /> Adicionar {isMusic ? 'Música' : 'Referência'}
      </button>
    </div>
  );
}

export default function BenchmarkPage() {
  const { benchmarks, addBenchmark, updateBenchmark, deleteBenchmark, restoreBenchmark, permanentlyDeleteBenchmark, duplicateBenchmark } = useBenchmarkStore();
  const cards = useVideoStore(s => s.cards);
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [ctaFilter, setCtaFilter] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToPermanentlyDelete, setItemToPermanentlyDelete] = useState(null);

  const safeBenchmarks = Array.isArray(benchmarks) ? benchmarks : [];

  const activeBench = safeBenchmarks.find(b => b?.id === activeId);

  const handleCreate = () => {
    const b = addBenchmark({ headline: 'Nova Análise de Benchmark' });
    setActiveId(b.id);
  };

  const updateActive = (updates) => {
    if (activeId) updateBenchmark(activeId, updates);
  };

  // Extract unique lists for filters safely
  const creators = [...new Set(safeBenchmarks.map(b => b?.creator).filter(Boolean))].sort();
  const niches = [...new Set(safeBenchmarks.map(b => b?.niche).filter(Boolean))].sort();

  // Filtered list safely
  const filteredBenchmarks = useMemo(() => {
    return safeBenchmarks.filter(b => {
      if (!b) return false;
      if (showTrash && !b.deletedAt) return false;
      if (!showTrash && b.deletedAt) return false;
      if (nicheFilter && b.niche !== nicheFilter) return false;
      if (creatorFilter && b.creator !== creatorFilter) return false;
      if (ctaFilter && b.ctaType !== ctaFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (b.headline && String(b.headline).toLowerCase().includes(q)) ||
          (b.script && String(b.script).toLowerCase().includes(q)) ||
          (Array.isArray(b.tags) && b.tags.some(t => t && String(t).toLowerCase().includes(q)))
        );
      }
      return true;
    }).sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  }, [benchmarks, nicheFilter, creatorFilter, ctaFilter, searchQuery, showTrash]);

  return (
    <div className="h-full flex animate-fade-in bg-[var(--bg-primary)]">
      
      {/* LEFT SIDEBAR: List & Filters */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]" 
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Telescope size={18} style={{ color: 'var(--accent-light)' }} /> Benchmark
              </h1>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Creative Intelligence Lab</p>
            </div>
            <button className="btn-accent p-2 rounded-xl" onClick={handleCreate} title="Nova Análise">
              <Plus size={16} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field text-xs pl-8 h-9" placeholder="Buscar hook, roteiro..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            <select 
              className="bg-[var(--surface-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-semibold h-7 pl-2 pr-6 rounded-lg outline-none cursor-pointer flex-shrink-0 min-w-[90px] transition-all hover:border-[var(--text-muted)]" 
              value={nicheFilter} onChange={e => setNicheFilter(e.target.value)}>
              <option value="">Nicho (Todos)</option>
              {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select 
              className="bg-[var(--surface-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-semibold h-7 pl-2 pr-6 rounded-lg outline-none cursor-pointer flex-shrink-0 min-w-[90px] transition-all hover:border-[var(--text-muted)]" 
              value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)}>
              <option value="">Creator (Todos)</option>
              {creators.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              className="bg-[var(--surface-hover)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] font-semibold h-7 pl-2 pr-6 rounded-lg outline-none cursor-pointer flex-shrink-0 min-w-[90px] transition-all hover:border-[var(--text-muted)]" 
              value={ctaFilter} onChange={e => setCtaFilter(e.target.value)}>
              <option value="">CTA (Todos)</option>
              {CTA_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              className="bg-[var(--surface-hover)] border border-[var(--border-color)] text-[10px] font-semibold h-7 px-2 rounded-lg outline-none cursor-pointer flex-shrink-0 transition-all hover:border-[var(--text-muted)] flex items-center gap-1"
              style={showTrash ? { color: '#EF4444', borderColor: '#EF4444' } : { color: 'var(--text-primary)' }}
              onClick={() => { setShowTrash(!showTrash); setActiveId(null); }}
            >
              <Trash2 size={12} /> Lixeira
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredBenchmarks.length === 0 && (
            <div className="text-center p-6 mt-10">
              <Telescope size={32} style={{ color: 'var(--border-color)' }} className="mx-auto mb-3" />
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Nenhum benchmark encontrado.</p>
            </div>
          )}
          {filteredBenchmarks.map(b => (
            <div key={b.id} onClick={() => setActiveId(b.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border group ${activeId === b.id ? 'bg-[var(--surface-hover)] border-[var(--border-color)] shadow-md' : 'border-transparent hover:bg-[var(--surface)]'}`}>
              <div className="font-bold text-[13px] leading-snug mb-2 line-clamp-2" style={{ color: activeId === b.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {b.headline || 'Sem Hook/Headline'}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {b.creator && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)] bg-opacity-20 text-[var(--accent-light)] font-semibold">{b.creator}</span>}
                {b.niche && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface)]" style={{ color: 'var(--text-muted)' }}>{b.niche}</span>}
                {b.ctaType && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface)]" style={{ color: '#10B981' }}>{b.ctaType}</span>}
              </div>
              <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-1"><Clock size={10} /> {b.realDuration ? formatSeconds(b.realDuration) : '—'}</div>
                <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  {b.videoUrl && <Play size={10} />}
                  {b.musicRefs?.length > 0 && <Music size={10} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN PANEL */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {!activeBench ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <Telescope size={64} style={{ color: 'var(--border-color)' }} className="mb-6" />
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Intelligence Lab</p>
            <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
              Selecione um benchmark ou crie uma nova análise de vídeos virais, concorrentes e estruturas narrativas.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 md:p-10 pb-24">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>
                  ID: {activeBench.id.substring(0, 6)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!showTrash ? (
                  <>
                    <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={() => duplicateBenchmark(activeId)}>
                      <Copy size={13} /> Duplicar Análise
                    </button>
                    <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-500 hover:text-red-400" 
                      onClick={() => setItemToDelete(activeBench)}>
                      <Trash2 size={13} /> Excluir
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5" onClick={() => { restoreBenchmark(activeId); setActiveId(null); }}>
                      <RotateCcw size={13} /> Restaurar
                    </button>
                    <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-red-500 hover:text-red-400" 
                      onClick={() => setItemToPermanentlyDelete(activeBench)}>
                      <Trash2 size={13} /> Excluir Permanentemente
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Macro: VIDEO INFORMATION */}
            <MacroGroup label="Vídeo / Conteúdo">
              <div>
                <label className="field-label flex items-center gap-2"><Target size={14}/> Hook / Headline</label>
                <input className="input-field text-lg font-bold p-4 h-auto" placeholder="O gancho principal do vídeo..."
                  value={activeBench?.headline || ''} onChange={e => updateActive({ headline: e.target.value })} />
              </div>
              
              <div>
                <label className="field-label flex items-center gap-2"><FileText size={14}/> Roteiro / Copy (Transição completa)</label>
                <textarea className="textarea-field min-h-[200px] text-sm leading-relaxed p-4" placeholder="Cole o roteiro ou a transcrição do vídeo aqui..."
                  value={activeBench?.script || ''} onChange={e => updateActive({ script: e.target.value })} />
                <div className="flex gap-4 mt-2 px-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Caracteres: <b style={{ color: 'var(--text-primary)' }}>{countCharacters(activeBench?.script || '')}</b></span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Palavras: <b style={{ color: 'var(--text-primary)' }}>{countWords(activeBench?.script || '')}</b></span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Estimativa de Fala: <b style={{ color: 'var(--accent-light)' }}>{formatSeconds(estimateSpeechTime(activeBench?.script || ''))}</b></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label flex items-center gap-2"><Play size={14}/> Link do Vídeo Original</label>
                  <input className="input-field" placeholder="Ex: https://tiktok.com/@..."
                    value={activeBench?.videoUrl || ''} onChange={e => updateActive({ videoUrl: e.target.value })} />
                </div>
                <div>
                  <label className="field-label flex items-center gap-2"><Clock size={14}/> Duração REAL do Vídeo (segundos)</label>
                  <input type="number" className="input-field font-bold text-lg" placeholder="Ex: 63"
                    value={activeBench?.realDuration || ''} onChange={e => updateActive({ realDuration: Number(e.target.value) || 0 })} />
                </div>
              </div>
            </MacroGroup>

            {/* Macro: ANÁLISE (CTA, Creator, Niche, Tags) */}
            <MacroGroup label="Análise & Tags">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="field-label flex items-center gap-2"><User size={14}/> Creator / Autor</label>
                  <input className="input-field" placeholder="Nome do criador ou perfil..."
                    value={activeBench?.creator || ''} onChange={e => updateActive({ creator: e.target.value })} />
                </div>
                <div>
                  <label className="field-label flex items-center gap-2"><Tag size={14}/> Nicho</label>
                  <input className="input-field" placeholder="Ex: Finanças, Saúde, Humor..."
                    value={activeBench?.niche || ''} onChange={e => updateActive({ niche: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="field-label">Tipo de CTA</label>
                  <div className="relative">
                    <select className="input-field appearance-none" value={activeBench?.ctaType || ''} onChange={e => updateActive({ ctaType: e.target.value })}>
                      <option value="">Selecione um tipo...</option>
                      {CTA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Copy do CTA (Texto exato)</label>
                  <input className="input-field" placeholder="O que ele fala no CTA..."
                    value={activeBench?.ctaText || ''} onChange={e => updateActive({ ctaText: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="field-label">Tags (separadas por vírgula)</label>
                <input className="input-field" placeholder="Ex: storytelling, transição rápida, vsl..."
                  value={(Array.isArray(activeBench?.tags) ? activeBench.tags : []).join(', ')} 
                  onChange={e => updateActive({ tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>
            </MacroGroup>

            {/* Macro: REFERÊNCIAS */}
            <MacroGroup label="Referências">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReferenceRows type="music" items={Array.isArray(activeBench?.musicRefs) ? activeBench.musicRefs : []} onUpdate={newItems => updateActive({ musicRefs: newItems })} />
                <ReferenceRows type="visual" items={Array.isArray(activeBench?.visualRefs) ? activeBench.visualRefs : []} onUpdate={newItems => updateActive({ visualRefs: newItems })} />
              </div>
            </MacroGroup>

            {/* Macro: VÍDEOS MEUS QUE USARAM ESSE BENCHMARK */}
            <MacroGroup label="Adaptado em (seus vídeos)">
              {(() => {
                const adapted = cards.filter(c => (c.basedOnBenchmarkIds || []).includes(activeBench.id));
                if (adapted.length === 0) {
                  return (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Nenhum vídeo seu marcado como inspirado neste benchmark ainda.<br/>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Quando você editar um vídeo, pode marcar este benchmark como referência — ele aparecerá aqui.
                      </span>
                    </p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {adapted.map(c => (
                      <button key={c.id}
                        onClick={() => navigate(`/videos?id=${c.id}`)}
                        className="w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all hover:border-[var(--accent)]"
                        style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-color)' }}>
                        <ArrowRight size={14} style={{ color: 'var(--accent-light)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {c.headline || 'Sem headline'}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {c.niche || 'sem nicho'} · {c.archived ? 'postado' : c.status}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </MacroGroup>

            {/* Macro: OBSERVAÇÕES ESTRATÉGICAS */}
            <MacroGroup label="Observações Estratégicas">
              <div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Anote padrões de retenção, mudanças narrativas, estilos de edição e ideias de adaptação para seus próprios vídeos. Esta área é fundamental para análises de Inteligência Artificial futuras.
                </p>
                <textarea className="textarea-field min-h-[300px] text-[15px] leading-relaxed p-6" 
                  placeholder="Por que esse vídeo viralizou? O que podemos aprender com a estrutura dele?&#10;&#10;1. Retenção: ...&#10;2. Edição: ...&#10;3. Adaptação: ..."
                  value={activeBench?.observations || ''} onChange={e => updateActive({ observations: e.target.value })} />
              </div>
            </MacroGroup>

          </div>
        )}
      </div>

      {itemToDelete && (
        <div className="overlay animate-fade-in" onClick={() => setItemToDelete(null)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2 text-white">Mover para a lixeira?</h3>
            <p className="text-xs mb-6 text-gray-400">Tem certeza que deseja mover este benchmark para a lixeira?</p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 text-sm py-2" onClick={() => setItemToDelete(null)}>Cancelar</button>
              <button className="flex-1 text-sm py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  onClick={() => { deleteBenchmark(itemToDelete.id); setItemToDelete(null); setActiveId(null); }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {itemToPermanentlyDelete && (
        <div className="overlay animate-fade-in" onClick={() => setItemToPermanentlyDelete(null)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2" style={{ color: '#EF4444' }}>Excluir permanentemente?</h3>
            <p className="text-xs mb-6 text-gray-400">Esta ação não poderá ser desfeita.</p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 text-sm py-2" onClick={() => setItemToPermanentlyDelete(null)}>Cancelar</button>
              <button className="flex-1 text-sm py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  onClick={() => { permanentlyDeleteBenchmark(itemToPermanentlyDelete.id); setItemToPermanentlyDelete(null); setActiveId(null); }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
