import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, FileText, Image, Music, X, Save, Copy, ArrowRight,
  Trash2, Download, Clock, Maximize2, Minimize2, Video, PenTool,
  Sparkles, StickyNote, LinkIcon, Eye, LayoutGrid, List,
  Filter, RotateCcw, AlertTriangle, ChevronDown, Package, Target, CheckCircle2
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useVideoStore, { FLOW_COLUMNS } from '../stores/useVideoStore';
import useNicheStore from '../stores/useNicheStore';
import useProductStore from '../stores/useProductStore';
import useBenchmarkStore from '../stores/useBenchmarkStore';
import useHeadlineStore from '../stores/useHeadlineStore';
import { format } from 'date-fns';
import { formatDateBR, getTodaySP, getTomorrowSP } from '../utils/dateUtils';

const STATUS_COLORS = {
  'creating': '#F97316',
  'ready-to-record': '#3B82F6',
  'recorded': '#8B5CF6',
  'editing': '#EC4899',
  'programmed': '#14B8A6',
  'posted': '#10B981',
};

function countWords(t) { return (!t||!t.trim()) ? 0 : t.trim().split(/\s+/).length; }
function estimateSpeechTime(w) {
  const s = Math.round((w/145)*60), m = Math.floor(s/60), r = s%60;
  return m === 0 ? `${r}s` : `${m}m ${r.toString().padStart(2,'0')}s`;
}

/* Migrate old music object → array */
function migrateMusic(m) {
  if (Array.isArray(m)) return m;
  if (m && typeof m === 'object' && (m.name || m.link)) return [m];
  return [];
}
/* Migrate old links → array */
function migrateLinks(card) {
  const arr = Array.isArray(card.productionLinks) ? [...card.productionLinks] : [];
  if (card.externalLink && !arr.some(l => l.link === card.externalLink))
    arr.push({ type: 'Link Externo', link: card.externalLink, notes: '' });
  if (card.recordedFilesLink && !arr.some(l => l.link === card.recordedFilesLink))
    arr.push({ type: 'Arquivos Gravados', link: card.recordedFilesLink, notes: '' });
  return arr;
}

/* ===== UNIFIED REPEATABLE ROWS ===== */
function RepeatableRows({ items, fields, onUpdate, onRemove, onAdd, addLabel, icon: Icon, iconColor }) {
  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} className="asset-row">
          {Icon && <Icon size={14} style={{ color: iconColor }} className="flex-shrink-0" />}
          {fields.map(f => (
            <input key={f.key} className="input-field text-xs flex-1"
              style={{ background: 'transparent', border: 'none', padding: '4px 8px' }}
              placeholder={f.placeholder} value={item[f.key] || ''}
              onChange={e => onUpdate(idx, f.key, e.target.value)} />
          ))}
          <button onClick={() => onRemove(idx)}
            className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0">
            <X size={14} style={{ color: '#EF4444' }} />
          </button>
        </div>
      ))}
      <button className="btn-ghost text-xs mt-2 flex items-center gap-1.5" onClick={onAdd}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

/* ===== MACRO GROUP LABEL ===== */
function MacroGroup({ label, children }) {
  return (
    <div className="py-6">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-5 flex items-center gap-3"
        style={{ color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border-color)', opacity: 0.5 }} />
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

/* ===== FOCUS MODE ===== */
function FocusMode({ text, onUpdate, onClose, title, isHeadline }) {
  const w = countWords(text);
  return (
    <div className="focus-mode animate-fade-in">
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-4"
        style={{ background: 'linear-gradient(180deg, var(--bg-primary) 60%, transparent)' }}>
        <div className="flex items-center gap-3">
          <Maximize2 size={16} style={{ color: 'var(--accent-light)' }} />
          <span className="text-sm font-medium gradient-text">Modo Foco{isHeadline ? ' — Headline' : ''}</span>
          {title && <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>— {title}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="script-counters" style={{ margin: 0 }}>
            <span><span className="counter-value">{w.toLocaleString('pt-BR')}</span> palavras</span>
            <span><Clock size={12} /><span className="counter-value">{estimateSpeechTime(w)}</span></span>
          </div>
          <button className="btn-ghost text-sm flex items-center gap-2" onClick={onClose}>
            <Minimize2 size={14} /> Sair do Foco
          </button>
        </div>
      </div>
      <textarea className="focus-editor" value={text || ''} onChange={e => onUpdate(e.target.value)}
        placeholder={isHeadline ? "Escreva sua headline..." : "Comece a escrever seu roteiro..."} autoFocus />
    </div>
  );
}

/* ===== TRASH CONFIRMATION MODAL ===== */
function TrashConfirmModal({ card, onConfirm, onCancel }) {
  return (
    <>
      <div className="overlay animate-fade-in" onClick={onCancel} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
        <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}>
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Trash2 size={22} style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Mover para a lixeira?
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              "{card.headline || 'Sem headline'}" será movido para a lixeira. Você poderá restaurá-lo depois.
            </p>
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button className="btn-ghost flex-1 text-sm py-2.5" onClick={onCancel}>Cancelar</button>
            <button className="flex-1 text-sm py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
              onClick={onConfirm}>
              <Trash2 size={14} /> Mover para lixeira
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== TRASH PANEL ===== */
function TrashPanel({ isOpen, onClose }) {
  const { trash, restoreCard, permanentlyDeleteCard, emptyTrash } = useVideoStore();

  if (!isOpen) return null;
  return (
    <>
      <div className="overlay animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
        <div className="relative w-full max-w-lg max-h-[80vh] rounded-2xl overflow-hidden flex flex-col animate-scale-in"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)' }}>
                <Trash2 size={16} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Lixeira
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {trash.length} {trash.length === 1 ? 'vídeo' : 'vídeos'} na lixeira
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {trash.length > 0 && (
                <button className="text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
                  style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  onClick={() => { if (window.confirm('Esvaziar toda a lixeira permanentemente?')) emptyTrash(); }}>
                  Esvaziar tudo
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {trash.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 size={28} style={{ color: 'var(--text-muted)', opacity: 0.25 }} className="mx-auto mb-3" />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>A lixeira está vazia</p>
              </div>
            ) : (
              trash.map(card => {
                const st = FLOW_COLUMNS.find(c => c.id === card.status);
                return (
                  <div key={card.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {card.headline || 'Sem headline'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px]" style={{ color: STATUS_COLORS[card.status] || 'var(--text-muted)' }}>
                          {st?.emoji} {st?.title}
                        </span>
                        {card.deletedAt && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Excluído em {formatDateBR(card.deletedAt, true)}</span>
                        )}
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                      title="Restaurar" onClick={() => restoreCard(card.id)}>
                      <RotateCcw size={14} style={{ color: '#10B981' }} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                      title="Excluir permanentemente"
                      onClick={() => { if (window.confirm('Excluir permanentemente?')) permanentlyDeleteCard(card.id); }}>
                      <X size={14} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== STRUCTURE TAGS PRESETS ===== */
const STRUCTURE_TAGS = {
  'Gancho': ['gancho-pergunta', 'gancho-contradição', 'gancho-promessa', 'gancho-curiosidade', 'gancho-dor', 'gancho-prova-social'],
  'Narrativa': ['narrativa-3-atos', 'narrativa-lista', 'narrativa-storytelling-pessoal', 'narrativa-prova-social', 'narrativa-pergunta-resposta', 'narrativa-passo-a-passo'],
  'CTA': ['cta-comentário', 'cta-direct', 'cta-link-bio', 'cta-perfil', 'cta-whatsapp', 'cta-salvar'],
};

/* ===== VIDEO EDITOR MODAL ===== */
function VideoEditorModal({ card, onClose }) {
  const { updateCard, deleteCard, duplicateCard, moveToNext, markAsPosted } = useVideoStore();
  const niches = useNicheStore(s => s.niches);
  const products = useProductStore(s => s.products);
  const benchmarks = useBenchmarkStore(s => s.benchmarks);
  const headlines = useHeadlineStore(s => s.headlines);

  // Snapshot do card original para restaurar no Cancel
  const originalSnapshot = useRef(JSON.parse(JSON.stringify(card)));

  const [form, setForm] = useState(() => ({
    ...card,
    music: migrateMusic(card.music),
    productionLinks: migrateLinks(card),
    basedOnBenchmarkIds: card.basedOnBenchmarkIds || [],
    productId: card.productId || null,
    cta: card.cta || '',
    plannedDate: card.plannedDate || '',
    plannedTime: card.plannedTime || '',
  }));
  const [focusTarget, setFocusTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const update = useCallback((f, v) => {
    setForm(p => ({ ...p, [f]: v }));
    setHasChanges(true);
  }, []);

  const hlChars = (form.headline||'').length, hlWords = countWords(form.headline);
  const scChars = (form.script||'').length, scWords = countWords(form.script);

  const handleSave = () => {
    const saveData = { ...form };
    if (form.productionLinks?.length > 0) {
      const ext = form.productionLinks.find(l => l.type?.toLowerCase().includes('externo'));
      const rec = form.productionLinks.find(l => l.type?.toLowerCase().includes('gravad'));
      saveData.externalLink = ext?.link || form.externalLink || '';
      saveData.recordedFilesLink = rec?.link || form.recordedFilesLink || '';
    }
    updateCard(card.id, saveData);
    setHasChanges(false);
    onClose();
  };

  const handleCancel = () => {
    // Restaura o card ao estado original (snapshot)
    updateCard(card.id, originalSnapshot.current);
    onClose();
  };

  const handleMarkPosted = () => {
    updateCard(card.id, form);
    markAsPosted(card.id);
    onClose();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `card-${form.headline?.slice(0,30) || card.id}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const arrayUpdate = (field) => (idx, key, val) => {
    const arr = [...(form[field]||[])]; arr[idx] = { ...arr[idx], [key]: val }; update(field, arr);
  };
  const arrayRemove = (field) => (idx) => update(field, (form[field]||[]).filter((_,i) => i!==idx));
  const arrayAdd = (field, template) => () => update(field, [...(form[field]||[]), template]);

  const toggleBenchmark = (benchId) => {
    const current = form.basedOnBenchmarkIds || [];
    if (current.includes(benchId)) {
      update('basedOnBenchmarkIds', current.filter(id => id !== benchId));
    } else {
      update('basedOnBenchmarkIds', [...current, benchId]);
    }
  };

  if (focusTarget) {
    const isHL = focusTarget === 'headline';
    return <FocusMode text={isHL ? form.headline : form.script} isHeadline={isHL}
      title={isHL ? null : form.headline}
      onUpdate={val => update(isHL ? 'headline' : 'script', val)}
      onClose={() => setFocusTarget(null)} />;
  }

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
        <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col animate-slide-up"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
            boxShadow: '0 32px 100px rgba(0,0,0,0.6), 0 0 60px var(--glow)' }}
          onClick={e => e.stopPropagation()}>

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
                <Video size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {card.headline ? 'Editar Vídeo' : 'Novo Vídeo'}
                </h3>
                <p className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span>Criado em {formatDateBR(card.createdAt, true)}</span>
                  {hasChanges && (
                    <span className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                      Alterações não salvas
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleMarkPosted}
                className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all"
                style={{ background: '#10B98122', color: '#10B981', border: '1px solid #10B98144' }}
                title="Marca como postado e move para o arquivo">
                <CheckCircle2 size={12} /> Marcar como postado
              </button>
              <button onClick={() => { duplicateCard(card.id); onClose(); }}
                className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"><Copy size={12} /> Duplicar</button>
              <button onClick={() => { moveToNext(card.id); onClose(); }}
                className="btn-accent text-xs px-3 py-1.5 flex items-center gap-1"><ArrowRight size={12} /> Próxima etapa</button>
              <button onClick={onClose} className="ml-2 p-1.5 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
                style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8">

              {/* META ROW */}
              <div className="flex gap-3 mb-2">
                <div className="flex-1">
                  <label className="field-label">Status</label>
                  <select className="input-field text-sm" value={form.status} onChange={e => update('status', e.target.value)}>
                    {FLOW_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="field-label">Nicho</label>
                  <select className="input-field text-sm" value={form.niche} onChange={e => update('niche', e.target.value)}>
                    <option value="">Selecionar</option>
                    {niches.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {/* PROGRAMADO OPTIONS */}
              {form.status === 'programmed' && (
                <div className="flex gap-3 mb-3 p-3 rounded-xl border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-color)' }}>
                  <div className="flex-1">
                    <label className="field-label" style={{ color: 'var(--text-primary)' }}>Data Programada</label>
                    <input type="date" className="input-field text-sm" value={form.plannedDate || ''} onChange={e => update('plannedDate', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="field-label" style={{ color: 'var(--text-primary)' }}>Horário Programado</label>
                    <input type="time" className="input-field text-sm" value={form.plannedTime || ''} onChange={e => update('plannedTime', e.target.value)} />
                  </div>
                </div>
              )}

              {/* ═══ INÍCIO DO VÍDEO ═══ */}
              <MacroGroup label="Início do Vídeo">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="editor-section-label" style={{ paddingBottom: 0 }}>
                      <Sparkles size={14} /> Headline / Hook
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer outline-none"
                              style={{
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                padding: '4px 24px 4px 10px',
                                height: '26px',
                              }}
                              value=""
                              onChange={e => {
                                if(e.target.value) update('headline', e.target.value);
                              }}>
                         <option value="" disabled hidden>Importar Headline ▾</option>
                         {headlines.map(h => (
                           <option key={h.id} value={h.text} style={{color: 'var(--text-primary)'}}>{h.text.substring(0, 40)}{h.text.length > 40 ? '...' : ''}</option>
                         ))}
                      </select>

                      <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
                        onClick={() => setFocusTarget('headline')}>
                        <Maximize2 size={13} /> Foco
                      </button>
                    </div>
                  </div>
                  <textarea className="input-field font-semibold"
                    style={{ padding: '14px 16px', fontSize: '18px', minHeight: '90px', resize: 'vertical', width: '100%' }}
                    value={form.headline || ''} onChange={e => update('headline', e.target.value)}
                    placeholder="Headline impactante — primeiros 3 a 7 segundos..." />
                  <div className="script-counters mt-1">
                    <span>Caracteres: <span className="counter-value">{hlChars.toLocaleString('pt-BR')}</span></span>
                    <span>Palavras: <span className="counter-value">{hlWords.toLocaleString('pt-BR')}</span></span>
                    <span><Clock size={12} /> Fala: <span className="counter-value">{estimateSpeechTime(hlWords)}</span></span>
                  </div>
                  <p className="helper-text">Gatilho de atenção. O hook que segura o espectador nos primeiros segundos.</p>
                </div>
              </MacroGroup>

              {/* ═══ NARRATIVA ═══ */}
              <MacroGroup label="Narrativa">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="editor-section-label" style={{ paddingBottom: 0 }}>
                      <PenTool size={14} /> Roteiro Completo
                    </div>
                    <button className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
                      onClick={() => setFocusTarget('script')}>
                      <Maximize2 size={13} /> Modo Foco
                    </button>
                  </div>
                  <textarea className="textarea-field"
                    style={{ minHeight: '380px', fontSize: '15px', lineHeight: '1.85', padding: '18px 20px' }}
                    value={form.script} onChange={e => update('script', e.target.value)}
                    placeholder={"Escreva o roteiro completo aqui...\n\nStorytelling, CTAs, narrativa, desenvolvimento, encerramento, transições."} />
                  <div className="script-counters mt-1">
                    <span>Caracteres: <span className="counter-value">{scChars.toLocaleString('pt-BR')}</span></span>
                    <span>Palavras: <span className="counter-value">{scWords.toLocaleString('pt-BR')}</span></span>
                    <span><Clock size={12} /> Fala estimada: <span className="counter-value">{estimateSpeechTime(scWords)}</span></span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="editor-section-label"><Target size={14} /> CTA (Call-to-Action)</div>
                  <input className="input-field" placeholder="Ex: Comenta &quot;quero&quot; aqui embaixo que eu te mando..."
                    value={form.cta || ''} onChange={e => update('cta', e.target.value)} />
                  <p className="helper-text">A ação exata que você pede ao espectador no final do vídeo.</p>
                </div>
              </MacroGroup>

              {/* ═══ CONEXÕES ═══ */}
              <MacroGroup label="Conexões">
                {/* Produto */}
                <div>
                  <div className="editor-section-label"><Package size={14} /> Produto / Oferta vinculada</div>
                  <p className="helper-text mb-3" style={{ marginTop: 0 }}>
                    Qual produto este vídeo está promovendo? Útil pra ver quantos vídeos cada produto teve.
                  </p>
                  <select className="input-field text-sm" value={form.productId || ''}
                    onChange={e => update('productId', e.target.value || null)}>
                    <option value="">Nenhum produto</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.ticketType})</option>)}
                  </select>
                </div>

                {/* Benchmarks de inspiração */}
                {benchmarks.length > 0 && (
                  <div>
                    <div className="editor-section-label"><Sparkles size={14} /> Inspirado em Benchmarks</div>
                    <p className="helper-text mb-3" style={{ marginTop: 0 }}>
                      Marque os benchmarks que serviram de referência pra este vídeo.
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg"
                      style={{ background: 'var(--surface)' }}>
                      {benchmarks.map(b => {
                        const selected = (form.basedOnBenchmarkIds || []).includes(b.id);
                        return (
                          <button key={b.id} type="button" onClick={() => toggleBenchmark(b.id)}
                            className="text-[10px] px-2 py-1 rounded-md transition-all"
                            style={{
                              background: selected ? 'var(--accent-surface)' : 'var(--surface-hover)',
                              border: `1px solid ${selected ? 'var(--accent)' : 'transparent'}`,
                              color: selected ? 'var(--accent-light)' : 'var(--text-muted)',
                            }}>
                            {b.headline?.slice(0, 40) || 'Sem título'}
                            {b.creator && ` · ${b.creator}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </MacroGroup>

              {/* ═══ REFERÊNCIAS ═══ */}
              <MacroGroup label="Referências">
                <div>
                  <div className="editor-section-label"><Eye size={14} /> Referências Visuais</div>
                  <p className="helper-text mb-3" style={{ marginTop: 0 }}>Imagens, vídeos, split-screens, referências visuais, links do Drive.</p>
                  <RepeatableRows items={form.images||[]} icon={Image} iconColor="#EC4899"
                    fields={[{ key: 'description', placeholder: 'Descrição da referência...' }, { key: 'link', placeholder: 'Link (imagem, vídeo, Drive...)' }]}
                    onUpdate={arrayUpdate('images')} onRemove={arrayRemove('images')}
                    onAdd={arrayAdd('images', { description: '', link: '' })} addLabel="Adicionar Referência" />
                </div>
                <div>
                  <div className="editor-section-label"><Music size={14} /> Música / Trilha Sonora</div>
                  <RepeatableRows items={form.music||[]} icon={Music} iconColor="#10B981"
                    fields={[{ key: 'name', placeholder: 'Nome da música' }, { key: 'link', placeholder: 'Link' }, { key: 'notes', placeholder: 'Observação...' }]}
                    onUpdate={arrayUpdate('music')} onRemove={arrayRemove('music')}
                    onAdd={arrayAdd('music', { name: '', link: '', notes: '' })} addLabel="Adicionar Música" />
                </div>
              </MacroGroup>

              {/* ═══ PRODUÇÃO ═══ */}
              <MacroGroup label="Produção">
                <div>
                  <div className="editor-section-label"><LinkIcon size={14} /> Links de Produção</div>
                  <p className="helper-text mb-3" style={{ marginTop: 0 }}>Links externos, pastas do Drive, Dropbox, arquivos gravados.</p>
                  <RepeatableRows items={form.productionLinks||[]} icon={LinkIcon} iconColor="var(--accent-light)"
                    fields={[{ key: 'type', placeholder: 'Tipo (ex: Drive, Dropbox)' }, { key: 'link', placeholder: 'Link / Caminho' }, { key: 'notes', placeholder: 'Observação...' }]}
                    onUpdate={arrayUpdate('productionLinks')} onRemove={arrayRemove('productionLinks')}
                    onAdd={arrayAdd('productionLinks', { type: '', link: '', notes: '' })} addLabel="Adicionar Link" />
                </div>
              </MacroGroup>

              {/* ═══ OBSERVAÇÕES ═══ */}
              <MacroGroup label="Observações">
                <div>
                  <div className="editor-section-label"><StickyNote size={14} /> Anotações</div>
                  <textarea className="textarea-field" style={{ minHeight: '100px' }}
                    value={form.notes||''} onChange={e => update('notes', e.target.value)}
                    placeholder="Anotações livres, referências, lembretes, ideias para futuras versões..." />
                </div>
              </MacroGroup>

              <div className="flex justify-between items-center text-[9px] mt-4" style={{ color: 'var(--text-muted)' }}>
                <span>Criado: {formatDateBR(card.createdAt, true)}</span>
                <span>Atualizado: {formatDateBR(card.updatedAt, true)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
            <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
              onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} /> Excluir
            </button>
            <div className="flex items-center gap-2">
              <button className="btn-ghost flex items-center gap-2 text-xs" onClick={handleExport}><Download size={14} /> Exportar este card</button>
              <button className="btn-ghost text-xs" onClick={handleCancel}>Cancelar</button>
              <button className="btn-accent flex items-center gap-2" onClick={handleSave}><Save size={14} /> Salvar Vídeo</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <TrashConfirmModal card={card}
          onConfirm={() => { deleteCard(card.id); onClose(); }}
          onCancel={() => setShowDeleteConfirm(false)} />
      )}
    </>
  );
}

/* ===== KANBAN CARD (static render — no sortable) ===== */
function KanbanCardContent({ card }) {
  const w = countWords(card.script);
  const color = STATUS_COLORS[card.status] || 'var(--border-color)';

  return (
    <>
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color }} />
      <p className="text-[13px] font-semibold mb-2 leading-snug line-clamp-2 pr-1 pl-1" style={{ color: 'var(--text-primary)' }}>
        {card.headline || 'Nova ideia de vídeo...'}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2 pl-1">
        {card.niche && <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', opacity: 0.8 }}>{card.niche}</span>}
        {w > 0 && <span className="badge" style={{ fontSize: '9px', padding: '2px 6px', background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>{w}w</span>}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2 border-t pl-1" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-1.5 flex-1">
          {card.script?.length > 0 && <FileText size={11} style={{ color: 'var(--accent-light)' }} />}
          {card.images?.length > 0 && <Image size={11} style={{ color: '#EC4899' }} />}
          {card.music?.length > 0 && <Music size={11} style={{ color: '#10B981' }} />}
          {card.productionLinks?.length > 0 && <LinkIcon size={11} style={{ color: '#F59E0B' }} />}
        </div>
        {card.status === 'programmed' && (card.plannedDate || card.plannedTime) ? (
          <span className="text-[9px] font-bold" style={{ color: 'var(--accent-light)' }}>
            {card.plannedDate ? formatDateBR(card.plannedDate, false) : ''}
            {card.plannedTime && ` ${card.plannedTime}`}
          </span>
        ) : (
          <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {formatDateBR(card.updatedAt, false)}
          </span>
        )}
      </div>
    </>
  );
}

/* ===== SORTABLE CARD (Kanban) ===== */
function SortableCard({ card, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="kanban-card mb-2.5 relative overflow-hidden group"
      onClick={() => onClick(card)}>
      <KanbanCardContent card={card} />
    </div>
  );
}

/* ===== DROPPABLE COLUMN ===== */
function DroppableColumn({ column, cards, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const color = STATUS_COLORS[column.id] || 'var(--accent)';
  const isProgrammed = column.id === 'programmed';

  // Group by date if programmed
  let content;
  if (isProgrammed) {
    const todayStr = getTodaySP();
    const tomorrowStr = getTomorrowSP();

    const grouped = {
      hoje: [],
      amanha: [],
      futuro: {},
      semData: []
    };

    cards.forEach(card => {
      if (!card.plannedDate) {
        grouped.semData.push(card);
      } else if (card.plannedDate === todayStr) {
        grouped.hoje.push(card);
      } else if (card.plannedDate === tomorrowStr) {
        grouped.amanha.push(card);
      } else {
        if (!grouped.futuro[card.plannedDate]) grouped.futuro[card.plannedDate] = [];
        grouped.futuro[card.plannedDate].push(card);
      }
    });

    // Sort future dates
    const futureKeys = Object.keys(grouped.futuro).sort();

    const GroupHeader = ({ title }) => (
      <div className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        {title}
        <div className="flex-1 h-px" style={{ background: 'var(--border-color)', opacity: 0.5 }} />
      </div>
    );

    content = (
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {grouped.hoje.length > 0 && (
          <>
            <GroupHeader title="Hoje" />
            {grouped.hoje.map(card => <SortableCard key={card.id} card={card} onClick={onCardClick} />)}
          </>
        )}
        {grouped.amanha.length > 0 && (
          <>
            <GroupHeader title="Amanhã" />
            {grouped.amanha.map(card => <SortableCard key={card.id} card={card} onClick={onCardClick} />)}
          </>
        )}
        {futureKeys.map(dateKey => (
          <div key={dateKey}>
            <GroupHeader title={formatDateBR(dateKey, false)} />
            {grouped.futuro[dateKey].map(card => <SortableCard key={card.id} card={card} onClick={onCardClick} />)}
          </div>
        ))}
        {grouped.semData.length > 0 && (
          <>
            <GroupHeader title="Sem Data" />
            {grouped.semData.map(card => <SortableCard key={card.id} card={card} onClick={onCardClick} />)}
          </>
        )}
      </SortableContext>
    );
  } else {
    content = (
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {cards.map((card) => (
          <SortableCard key={card.id} card={card} onClick={onCardClick} />
        ))}
      </SortableContext>
    );
  }

  return (
    <div className="flex flex-col flex-shrink-0 rounded-xl overflow-hidden transition-all"
      style={{
        flex: isProgrammed ? '1.2' : '1',
        minWidth: isProgrammed ? '280px' : '240px',
        maxWidth: isProgrammed ? '380px' : '320px',
        height: 'calc(100vh - 160px)',
        background: isOver ? 'var(--surface-hover)' : 'var(--surface)',
        border: `1px solid ${isOver ? color : 'var(--border-color)'}`,
        boxShadow: isOver ? `0 0 20px ${color}22` : 'none',
      }}>
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            {column.emoji} {column.title}
          </span>
        </div>
        <span className="text-[10px] font-bold min-w-[20px] h-5 rounded-md flex items-center justify-center"
          style={{ background: `${color}18`, color }}>
          {cards.length}
        </span>
      </div>
      {/* Column body */}
      <div ref={setNodeRef} className={`flex-1 overflow-y-auto overflow-x-hidden ${isProgrammed ? 'p-3' : 'p-2 space-y-0'}`}
        style={{ minHeight: '100px' }}>
        {content}
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 select-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${color}10` }}>
              <Video size={18} style={{ color, opacity: 0.4 }} />
            </div>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
              Arraste vídeos aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== FILTER BAR ===== */
function FilterBar({ statusFilter, setStatusFilter, nicheFilter, setNicheFilter, niches, statusCounts }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status pills */}
      <button onClick={() => setStatusFilter('all')}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all uppercase tracking-wider`}
        style={statusFilter === 'all'
          ? { background: 'var(--accent-surface)', color: 'var(--accent-light)', border: '1px solid var(--accent)' }
          : { color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-color)' }}>
        Todos ({statusCounts.all})
      </button>
      {FLOW_COLUMNS.map(col => {
        const c = STATUS_COLORS[col.id];
        const active = statusFilter === col.id;
        return (
          <button key={col.id} onClick={() => setStatusFilter(active ? 'all' : col.id)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
            style={active
              ? { background: `${c}18`, color: c, border: `1px solid ${c}40` }
              : { color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-color)' }}>
            {col.emoji} {statusCounts[col.id] || 0}
          </button>
        );
      })}

      {/* Niche dropdown */}
      {niches.length > 0 && (
        <select
          value={nicheFilter}
          onChange={e => setNicheFilter(e.target.value)}
          className="text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer outline-none"
          style={{
            background: nicheFilter ? 'var(--accent-surface)' : 'var(--surface)',
            color: nicheFilter ? 'var(--accent-light)' : 'var(--text-muted)',
            border: `1px solid ${nicheFilter ? 'var(--accent)' : 'var(--border-color)'}`,
            padding: '4px 24px 4px 10px',
            height: '26px',
            marginLeft: '4px',
          }}>
          <option value="">Nicho ▾</option>
          {niches.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      )}
    </div>
  );
}


/* ===== VIDEOS PAGE ===== */
export default function VideosPage() {
  const { cards: allCards, addCard, moveCard, reorderCards, trash } = useVideoStore();
  // Apenas vídeos ativos (não-arquivados) aparecem na lista/kanban de vídeos
  const cards = useMemo(() => allCards.filter(c => !c.archived), [allCards]);
  const niches = useNicheStore(s => s.niches);
  const [selectedCard, setSelectedCard] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nicheFilter, setNicheFilter] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-abrir vídeo via query string ?id=xxx (vem do Dashboard ou outras telas)
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const target = allCards.find(c => c.id === id);
      if (target) {
        setSelectedCard(target);
        // Limpar a query para não reabrir ao navegar
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, allCards, setSearchParams]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Compute status counts (unfiltered)
  const statusCounts = useMemo(() => {
    const c = { all: cards.length };
    FLOW_COLUMNS.forEach(col => { c[col.id] = cards.filter(x => x.status === col.id).length; });
    return c;
  }, [cards]);

  // Apply search + niche filter (status filter only for list view)
  const filteredCards = useMemo(() => {
    let items = [...cards];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(c =>
        c.headline?.toLowerCase().includes(q) ||
        c.script?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q) ||
        c.niche?.toLowerCase().includes(q)
      );
    }
    if (nicheFilter) {
      items = items.filter(c => c.niche === nicheFilter);
    }
    if (statusFilter !== 'all') {
      items = items.filter(c => c.status === statusFilter);
    }
    return items;
  }, [cards, searchQuery, nicheFilter, statusFilter]);

  // For kanban: group by status, preserve order
  const cardsByStatus = useMemo(() => {
    const grouped = {};
    FLOW_COLUMNS.forEach(col => { grouped[col.id] = []; });
    filteredCards.forEach(card => {
      if (grouped[card.status]) grouped[card.status].push(card);
    });
    return grouped;
  }, [filteredCards]);

  // For list view
  const sortedListCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [filteredCards]);

  const handleCreate = () => { const c = addCard({ headline: '', status: 'creating' }); setSelectedCard(c); };

  // ——— DND HANDLERS (stable, no mutations during drag) ———

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard) return;

    // Dropped onto a column directly
    const targetColumn = FLOW_COLUMNS.find(col => col.id === over.id);
    if (targetColumn) {
      if (activeCard.status !== targetColumn.id) {
        moveCard(active.id, targetColumn.id);
      }
      return;
    }

    // Dropped onto another card
    const overCard = cards.find(c => c.id === over.id);
    if (!overCard) return;

    const newStatus = overCard.status;

    if (activeCard.status === newStatus && active.id !== over.id) {
      // Same column reorder
      reorderCards(active.id, over.id, newStatus);
    } else if (activeCard.status !== newStatus) {
      // Cross-column move: place near the overCard
      reorderCards(active.id, over.id, newStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeCard = activeId ? cards.find(c => c.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Produção</h1>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Pipeline criativo — {cards.length} vídeos</p>
            </div>

            <div className="h-7 w-px hidden md:block" style={{ background: 'var(--border-color)' }} />

            <div className="relative w-52 hidden sm:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Buscar..." className="input-field pl-8 h-8 text-[11px]"
                style={{ background: 'var(--surface)' }}
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Trash button */}
            <button onClick={() => setShowTrash(true)}
              className="relative p-1.5 rounded-lg transition-all hover:bg-[var(--surface-hover)]"
              title="Lixeira"
              style={{ color: trash.length > 0 ? '#EF4444' : 'var(--text-muted)' }}>
              <Trash2 size={15} />
              {trash.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                  style={{ background: '#EF4444' }}>
                  {trash.length}
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="flex bg-[var(--surface)] rounded-lg p-0.5 border" style={{ borderColor: 'var(--border-color)' }}>
              <button onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                title="Pipeline">
                <LayoutGrid size={13} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
                title="Lista">
                <List size={13} />
              </button>
            </div>

            <button onClick={handleCreate} className="btn-accent flex items-center gap-2 text-xs h-8 px-3"><Plus size={13} /> Novo</button>
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          nicheFilter={nicheFilter} setNicheFilter={setNicheFilter}
          niches={niches} statusCounts={statusCounts} />
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="h-full overflow-x-auto overflow-y-hidden px-5 pt-4 pb-2 w-full">
              <div className="flex gap-4 h-full" style={{ minWidth: 'max-content', width: '100%' }}>
                {FLOW_COLUMNS.map((column) => (
                  <DroppableColumn key={column.id} column={column}
                    cards={cardsByStatus[column.id] || []}
                    onCardClick={setSelectedCard} />
                ))}
              </div>
            </div>

            {/* Drag overlay — renders a floating ghost card */}
            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
              {activeCard ? (
                <div className="kanban-card relative overflow-hidden" style={{ width: '260px', opacity: 0.9, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
                  <KanbanCardContent card={activeCard} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="h-full overflow-y-auto px-6 py-4">
            <div className="space-y-1.5 max-w-5xl mx-auto">
              {sortedListCards.map(card => {
                const st = FLOW_COLUMNS.find(c => c.id === card.status);
                const w = countWords(card.script);
                const color = STATUS_COLORS[card.status] || 'var(--border-color)';
                return (
                  <div key={card.id} className="video-list-item relative overflow-hidden transition-all hover:shadow-md"
                    style={{ padding: '10px 16px' }}
                    onClick={() => setSelectedCard(card)}>
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color }} />
                    <div className="text-sm flex-shrink-0 w-7 text-center ml-1">{st?.emoji}</div>
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{card.headline||'Nova ideia de vídeo...'}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {card.niche && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}>{card.niche}</span>}
                      <span className="text-[9px] font-bold uppercase tracking-wider w-20 text-right" style={{ color }}>{st?.title}</span>
                      <div className="flex items-center gap-1.5 w-14">
                        {card.script?.length > 0 && <FileText size={11} style={{ color: 'var(--accent-light)' }} />}
                        {card.images?.length > 0 && <Image size={11} style={{ color: '#EC4899' }} />}
                        {card.music?.length > 0 && <Music size={11} style={{ color: '#10B981' }} />}
                      </div>
                      {w > 0 && <span className="text-[9px] font-medium tabular-nums w-7 text-right" style={{ color: 'var(--text-muted)' }}>{w}w</span>}
                      <span className="text-[9px] w-10 text-right" style={{ color: 'var(--text-muted)' }}>{formatDateBR(card.updatedAt, false)}</span>
                    </div>
                  </div>
                );
              })}
              {sortedListCards.length === 0 && (
                <div className="text-center py-12">
                  <Video size={28} style={{ color: 'var(--text-muted)', opacity: 0.25 }} className="mx-auto mb-3" />
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {searchQuery || nicheFilter || statusFilter !== 'all' ? 'Nenhum vídeo encontrado com esses filtros' : 'Nenhum vídeo no pipeline ainda'}
                  </p>
                  {!searchQuery && statusFilter === 'all' && !nicheFilter && (
                    <button onClick={handleCreate} className="btn-accent mt-3 text-xs"><Plus size={13} className="inline mr-1" /> Criar primeiro vídeo</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCard && <VideoEditorModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
      <TrashPanel isOpen={showTrash} onClose={() => setShowTrash(false)} />
    </div>
  );
}
