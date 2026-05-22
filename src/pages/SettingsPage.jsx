import { useState, useRef, useMemo } from 'react';
import {
  Sun, Moon, Download, Upload, Trash2, Check, X,
  FileText, Type, GitBranch, CheckSquare, Image, Music,
  Star, Filter, Calendar, Palette, Tag, Database, AlertTriangle,
  Telescope, Package, Bot, User, Sparkles, Layers, ChevronDown, ChevronRight, Lightbulb
} from 'lucide-react';
import useSettingsStore from '../stores/useSettingsStore';
import useNicheStore from '../stores/useNicheStore';
import useVideoStore, { FLOW_COLUMNS } from '../stores/useVideoStore';
import useHeadlineStore from '../stores/useHeadlineStore';
import useScriptStore from '../stores/useScriptStore';
import useImageStore from '../stores/useImageStore';
import useMusicStore from '../stores/useMusicStore';
import useTaskStore from '../stores/useTaskStore';
import useBenchmarkStore from '../stores/useBenchmarkStore';
import useProductStore from '../stores/useProductStore';
import useLearningStore from '../stores/useLearningStore';
import { palettes } from '../themes/palettes';
import { exportData, downloadJSON, countExportItems, importData, clearAllData, exportMarkdownSummary, downloadMarkdown } from '../utils/dataUtils';
import { toast } from '../components/shared/Toast';
import ConfirmDialog from '../components/shared/ConfirmDialog';

/* ── Merge module definitions ── */
const mergeModules = [
  { key: 'cards', label: 'Vídeos / Fluxo', icon: GitBranch, getStore: () => useVideoStore.getState().cards, getTitle: i => i.headline || 'Sem headline' },
  { key: 'headlines', label: 'Headlines', icon: Type, getStore: () => useHeadlineStore.getState().headlines, getTitle: i => i.text?.substring(0, 60) || 'Sem texto' },
  { key: 'scripts', label: 'Roteiros', icon: FileText, getStore: () => useScriptStore.getState().scripts, getTitle: i => i.title || i.text?.substring(0, 60) || 'Sem título' },
  { key: 'images', label: 'Acervo', icon: Image, getStore: () => useImageStore.getState().images, getTitle: i => i.title || i.description || 'Sem título' },
  { key: 'musics', label: 'Músicas', icon: Music, getStore: () => useMusicStore.getState().musics, getTitle: i => i.title || i.name || 'Sem título' },
  { key: 'tasks', label: 'Tarefas', icon: CheckSquare, getStore: () => useTaskStore.getState().tasks, getTitle: i => i.title || 'Sem título' },
  { key: 'benchmarks', label: 'Benchmarks', icon: Telescope, getStore: () => useBenchmarkStore.getState().benchmarks, getTitle: i => i.headline || 'Sem headline' },
  { key: 'products', label: 'Produtos', icon: Package, getStore: () => useProductStore.getState().products, getTitle: i => i.name || 'Sem nome' },
  { key: 'learnings', label: 'Aprendizados', icon: Sparkles, getStore: () => useLearningStore.getState().learnings, getTitle: i => i.content?.substring(0, 60) || 'Sem conteúdo' },
];

/* ===== MERGE PREVIEW MODAL ===== */
function MergePreviewModal({ isOpen, onClose, mergeData, fileName }) {
  const [selectedItems, setSelectedItems] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  // Build items per module on first render / when data changes
  const moduleItems = useMemo(() => {
    if (!mergeData) return [];
    return mergeModules.map(mod => {
      const incoming = mergeData[mod.key];
      if (!incoming || !Array.isArray(incoming) || incoming.length === 0) return null;
      const current = mod.getStore();
      const currentIds = new Set(current.map(i => i.id).filter(Boolean));
      const items = incoming.map(item => {
        const isDuplicate = item.id ? currentIds.has(item.id) : false;
        return { ...item, _isDuplicate: isDuplicate, _moduleKey: mod.key };
      });
      return { ...mod, items };
    }).filter(Boolean);
  }, [mergeData]);

  // Initialize selectedItems when moduleItems change
  useState(() => {
    const initial = {};
    moduleItems.forEach(mod => {
      mod.items.forEach(item => {
        if (!item._isDuplicate) initial[item.id] = true;
      });
    });
    setSelectedItems(initial);
  });

  // Reinit when modal opens
  useMemo(() => {
    if (!isOpen) return;
    const initial = {};
    moduleItems.forEach(mod => {
      mod.items.forEach(item => {
        if (!item._isDuplicate) initial[item.id] = true;
      });
    });
    setSelectedItems(initial);
    // Expand modules by default
    const expanded = {};
    moduleItems.forEach(mod => { expanded[mod.key] = true; });
    setExpandedModules(expanded);
  }, [isOpen, moduleItems]);

  const toggleItem = (id) => setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleModule = (key) => {
    const mod = moduleItems.find(m => m.key === key);
    if (!mod) return;
    const allSelected = mod.items.filter(i => !i._isDuplicate).every(i => selectedItems[i.id]);
    const next = { ...selectedItems };
    mod.items.filter(i => !i._isDuplicate).forEach(i => { next[i.id] = !allSelected; });
    setSelectedItems(next);
  };

  const toggleExpandModule = (key) => setExpandedModules(prev => ({ ...prev, [key]: !prev[key] }));

  const selectAll = () => {
    const next = {};
    moduleItems.forEach(mod => mod.items.filter(i => !i._isDuplicate).forEach(i => { next[i.id] = true; }));
    setSelectedItems(next);
  };

  const deselectAll = () => setSelectedItems({});

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;
  const totalNewCount = moduleItems.reduce((s, mod) => s + mod.items.filter(i => !i._isDuplicate).length, 0);

  const handleConfirm = () => {
    if (selectedCount === 0) return;

    // Build list of items to add per module
    moduleItems.forEach(mod => {
      const toAdd = mod.items.filter(i => selectedItems[i.id]);
      if (toAdd.length === 0) return;
      // Clean internal fields
      const clean = toAdd.map(({ _isDuplicate, _moduleKey, ...rest }) => rest);
      const current = mod.getStore();
      const merged = [...current, ...clean];

      // Write back to store
      switch (mod.key) {
        case 'cards': useVideoStore.getState().importCards(merged); break;
        case 'headlines': useHeadlineStore.getState().importHeadlines(merged); break;
        case 'scripts': useScriptStore.getState().importScripts(merged); break;
        case 'images': useImageStore.getState().importImages(merged); break;
        case 'musics': useMusicStore.getState().importMusics(merged); break;
        case 'tasks': useTaskStore.getState().importTasks(merged); break;
        case 'benchmarks': useBenchmarkStore.getState().importBenchmarks(merged); break;
        case 'products': useProductStore.getState().importProducts(merged); break;
        case 'learnings': useLearningStore.getState().importLearnings(merged); break;
        default: break;
      }
    });

    toast.success(`Importação complementar concluída! ${selectedCount} registro(s) adicionado(s).`);
    onClose();
  };

  if (!isOpen || !mergeData) return null;

  return (
    <div className="overlay animate-fade-in" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded-2xl z-50 animate-scale-in overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Importação Complementar</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Arquivo: {fileName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Select all / none */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {selectedCount} de {totalNewCount} itens novos selecionados
            </span>
            <div className="flex gap-2">
              <button className="text-[11px] font-medium" style={{ color: 'var(--accent-light)' }} onClick={selectAll}>Selecionar tudo</button>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <button className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }} onClick={deselectAll}>Desmarcar tudo</button>
            </div>
          </div>

          {moduleItems.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              Nenhum módulo encontrado no arquivo importado.
            </div>
          )}

          {moduleItems.map(mod => {
            const Icon = mod.icon;
            const newItems = mod.items.filter(i => !i._isDuplicate);
            const dupItems = mod.items.filter(i => i._isDuplicate);
            const allSelected = newItems.length > 0 && newItems.every(i => selectedItems[i.id]);
            const isExpanded = expandedModules[mod.key];

            return (
              <div key={mod.key} className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                {/* Module header */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => toggleExpandModule(mod.key)}>
                  {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
                  <Icon size={14} style={{ color: 'var(--accent-light)' }} />
                  <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{mod.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: newItems.length > 0 ? 'rgba(16,185,129,0.12)' : 'var(--surface-hover)', color: newItems.length > 0 ? '#10B981' : 'var(--text-muted)' }}>
                    {newItems.length} novo(s)
                  </span>
                  {dupItems.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                      {dupItems.length} duplicado(s)
                    </span>
                  )}
                  {newItems.length > 0 && (
                    <button
                      className="ml-2 w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        background: allSelected ? 'var(--accent, #8B5CF6)' : 'transparent',
                        border: allSelected ? 'none' : '2px solid var(--border-color)',
                      }}
                      onClick={e => { e.stopPropagation(); toggleModule(mod.key); }}
                      title={allSelected ? 'Desmarcar módulo' : 'Selecionar módulo'}
                    >
                      {allSelected && <Check size={12} className="text-white" />}
                    </button>
                  )}
                </div>

                {/* Items list */}
                {isExpanded && (
                  <div className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    {mod.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-2 transition-colors"
                        style={{
                          background: item._isDuplicate ? 'transparent' : (selectedItems[item.id] ? 'rgba(139,92,246,0.04)' : 'transparent'),
                          opacity: item._isDuplicate ? 0.4 : 1,
                        }}>
                        {item._isDuplicate ? (
                          <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(245,158,11,0.15)' }}>
                            <X size={10} style={{ color: '#F59E0B' }} />
                          </span>
                        ) : (
                          <button
                            className="w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                            style={{
                              background: selectedItems[item.id] ? 'var(--accent, #8B5CF6)' : 'transparent',
                              border: selectedItems[item.id] ? 'none' : '2px solid var(--border-color)',
                            }}
                            onClick={() => toggleItem(item.id)}
                          >
                            {selectedItems[item.id] && <Check size={10} className="text-white" />}
                          </button>
                        )}
                        <span className={`text-xs flex-1 truncate ${item._isDuplicate ? 'line-through' : ''}`}
                          style={{ color: item._isDuplicate ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {mod.getTitle(item)}
                        </span>
                        {item._isDuplicate && (
                          <span className="text-[9px]" style={{ color: '#F59E0B' }}>duplicado</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {selectedCount > 0 ? `${selectedCount} registro(s) serão adicionados` : 'Nenhum item selecionado'}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={onClose}>Cancelar</button>
            <button className="btn-accent text-sm flex items-center gap-2" onClick={handleConfirm} disabled={selectedCount === 0}>
              <Layers size={14} /> Importar Selecionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== EXPORT MODAL ===== */
function ExportModal({ isOpen, onClose }) {
  const niches = useNicheStore(s => s.niches);

  const [sections, setSections] = useState({
    headlines: true, scripts: true, flow: true,
    tasks: true, images: true, musics: true,
    benchmarks: true, products: true, learnings: true,
    settings: true,
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [niche, setNiche] = useState('');
  const [flowStage, setFlowStage] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const [aiOptimized, setAiOptimized] = useState(false);

  const sectionList = [
    { key: 'flow', label: 'Cards do Fluxo', icon: GitBranch },
    { key: 'headlines', label: 'Headlines', icon: Type },
    { key: 'scripts', label: 'Roteiros', icon: FileText },
    { key: 'benchmarks', label: 'Benchmarks', icon: Telescope },
    { key: 'products', label: 'Produtos & Projeções', icon: Package },
    { key: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { key: 'images', label: 'Acervo', icon: Image },
    { key: 'musics', label: 'Músicas', icon: Music },
    { key: 'learnings', label: 'Aprendizados', icon: Lightbulb },
    { key: 'settings', label: 'Configurações', icon: User },
  ];

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const allOn = Object.values(sections).every(Boolean);
    const val = !allOn;
    const next = {};
    sectionList.forEach(s => { next[s.key] = val; });
    setSections(next);
  };

  const preview = useMemo(() => {
    const activeSections = Object.entries(sections).filter(([, v]) => v).map(([k]) => k);
    if (activeSections.length === 0) return null;
    return exportData({
      sections: activeSections, startDate, endDate, niche,
      flowStage, onlyFavorites, onlyCompleted, aiOptimized,
    });
  }, [sections, startDate, endDate, niche, flowStage, onlyFavorites, onlyCompleted, aiOptimized]);

  const itemCount = preview ? countExportItems(preview) : 0;

  const handleExport = () => {
    if (!preview) return;
    const now = new Date();
    const timestamp = now.toLocaleDateString('pt-BR').replace(/\//g, '-') + '_' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
    const dateSuffix = startDate || endDate ? `-[${startDate || 'inicio'}-a-${endDate || 'fim'}]` : '';
    const aiSuffix = aiOptimized ? '-ai' : '';
    downloadJSON(preview, `roteiros_${timestamp}${aiSuffix}${dateSuffix}.json`);
    toast.success(`Export gerado · ${itemCount} itens`);
    onClose();
  };

  const handleExportMarkdown = () => {
    const md = exportMarkdownSummary();
    downloadMarkdown(md);
    toast.success('Resumo em Markdown gerado');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay animate-fade-in" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl rounded-2xl z-50 animate-scale-in overflow-hidden"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
              <Download size={16} className="text-white" />
            </div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Exportar dados
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                O que exportar
              </label>
              <button className="text-[11px] font-medium" style={{ color: 'var(--accent-light)' }}
                onClick={toggleAll}>
                {Object.values(sections).every(Boolean) ? 'Desmarcar tudo' : 'Selecionar tudo'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sectionList.map(s => (
                <button key={s.key}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  style={{
                    background: sections[s.key] ? 'var(--accent-surface)' : 'var(--surface)',
                    border: `1px solid ${sections[s.key] ? 'var(--accent)' : 'var(--border-color)'}`,
                  }}
                  onClick={() => toggleSection(s.key)}
                >
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: sections[s.key] ? 'var(--accent)' : 'transparent',
                      border: sections[s.key] ? 'none' : '1.5px solid var(--border-color)',
                    }}>
                    {sections[s.key] && <Check size={12} className="text-white" />}
                  </div>
                  <s.icon size={14} style={{ color: sections[s.key] ? 'var(--text-primary)' : 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: sections[s.key] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} /> Período
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: 'var(--text-muted)' }}>De</label>
                <input type="date" className="input-field text-sm h-9"
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Até</label>
                <input type="date" className="input-field text-sm h-9"
                  value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            {(startDate || endDate) && (
              <button className="text-[11px] mt-2" style={{ color: 'var(--accent-light)' }}
                onClick={() => { setStartDate(''); setEndDate(''); }}>
                Limpar datas
              </button>
            )}
          </div>

          {/* Extra Filters */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Filter size={12} /> Filtros
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Nicho</label>
                <select className="input-field text-sm h-9" value={niche} onChange={e => setNiche(e.target.value)}>
                  <option value="">Todos</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {sections.flow && (
                <div>
                  <label className="text-[11px] mb-1 block" style={{ color: 'var(--text-muted)' }}>Etapa do fluxo</label>
                  <select className="input-field text-sm h-9" value={flowStage} onChange={e => setFlowStage(e.target.value)}>
                    <option value="">Todas</option>
                    {FLOW_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-3 flex-wrap">
              <button
                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-all"
                style={{
                  background: onlyFavorites ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: onlyFavorites ? '#F59E0B' : 'var(--text-muted)',
                  border: `1px solid ${onlyFavorites ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'}`,
                }}
                onClick={() => setOnlyFavorites(!onlyFavorites)}
              >
                <Star size={13} fill={onlyFavorites ? '#F59E0B' : 'none'} /> Apenas favoritos
              </button>
              <button
                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-all"
                style={{
                  background: onlyCompleted ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: onlyCompleted ? '#10B981' : 'var(--text-muted)',
                  border: `1px solid ${onlyCompleted ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`,
                }}
                onClick={() => setOnlyCompleted(!onlyCompleted)}
              >
                <Check size={13} /> Apenas concluídas
              </button>
              <button
                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-all"
                style={{
                  background: aiOptimized ? 'var(--accent-surface)' : 'transparent',
                  color: aiOptimized ? 'var(--accent-light)' : 'var(--text-muted)',
                  border: `1px solid ${aiOptimized ? 'var(--accent)' : 'var(--border-color)'}`,
                }}
                onClick={() => setAiOptimized(!aiOptimized)}
                title="Adiciona _schema, _summary, _relations e _creatorVoice ao JSON. Use ao mandar pra IA."
              >
                <Bot size={13} /> Modo IA (schema + relações + sumário)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {itemCount > 0 ? `${itemCount} itens encontrados${aiOptimized ? ' + enriquecimento IA' : ''}` : 'Nenhum item encontrado'}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={onClose}>Cancelar</button>
            <button
              className="btn-ghost text-sm flex items-center gap-2"
              onClick={handleExportMarkdown}
              title="Resumo legível em Markdown — útil pra colar direto em qualquer IA"
            >
              <FileText size={14} /> Resumo Markdown
            </button>
            <button
              className="btn-accent text-sm flex items-center gap-2"
              onClick={handleExport}
            >
              <Download size={14} /> Exportar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SETTINGS CARD WRAPPER ===== */
function SettingsCard({ children, title, icon: Icon, className = '' }) {
  return (
    <div className={`rounded-xl p-5 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon size={15} style={{ color: 'var(--accent-light)', opacity: 0.7 }} />}
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

/* ===== SETTINGS PAGE ===== */
export default function SettingsPage() {
  const { palette, theme, setPalette, setTheme, creatorVoice, setCreatorVoice } = useSettingsStore();
  const { niches, addNiche, removeNiche } = useNicheStore();
  const [newNiche, setNewNiche] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [mergePreview, setMergePreview] = useState(null); // { data, fileName }
  const fileInputRef = useRef(null);
  const mergeFileInputRef = useRef(null);

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importData(ev.target.result);
      setImportStatus(result);
      if (result.success) toast.success('Dados importados com sucesso');
      else toast.error('Falha ao importar: ' + (result.error || 'arquivo inválido'));
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMergeImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = typeof ev.target.result === 'string' ? JSON.parse(ev.target.result) : ev.target.result;
        if (!data._meta && !data._metadata) {
          toast.error('Arquivo inválido — não é um backup reconhecido.');
          return;
        }
        setMergePreview({ data, fileName: file.name });
      } catch (err) {
        toast.error('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddNiche = () => {
    if (newNiche.trim()) { addNiche(newNiche.trim()); setNewNiche(''); }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Aparência, organização e dados
        </p>
      </div>

      <div className="px-6 pb-8 max-w-4xl space-y-5">

        {/* ===== ROW 1: Appearance ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Theme */}
          <SettingsCard title="Tema" icon={Moon}>
            <div className="flex gap-3">
              {[
                { key: 'dark', label: 'Escuro', sub: 'Modo padrão', Icon: Moon },
                { key: 'light', label: 'Claro', sub: 'Modo diurno', Icon: Sun },
              ].map(t => (
                <button key={t.key}
                  className="flex-1 flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: theme === t.key ? 'var(--accent-surface)' : 'var(--bg-secondary)',
                    border: `1px solid ${theme === t.key ? 'var(--accent)' : 'var(--border-color)'}`,
                  }}
                  onClick={() => setTheme(t.key)}
                >
                  <t.Icon size={16} style={{ color: theme === t.key ? 'var(--accent-light)' : 'var(--text-muted)' }} />
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.sub}</p>
                  </div>
                  {theme === t.key && <Check size={13} className="ml-auto" style={{ color: 'var(--accent-light)' }} />}
                </button>
              ))}
            </div>
          </SettingsCard>

          {/* Niches */}
          <SettingsCard title="Nichos" icon={Tag}>
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
              {niches.map(n => (
                <span key={n} className="badge flex items-center gap-1 pr-1.5 text-[10px]">
                  {n}
                  <button onClick={() => removeNiche(n)} className="hover:text-red-400 ml-0.5 opacity-60 hover:opacity-100 transition-opacity">×</button>
                </span>
              ))}
              {niches.length === 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Nenhum nicho cadastrado</span>
              )}
            </div>
            <div className="flex gap-2">
              <input className="input-field flex-1 text-sm h-9" value={newNiche}
                onChange={e => setNewNiche(e.target.value)} placeholder="Novo nicho..."
                onKeyDown={e => e.key === 'Enter' && handleAddNiche()} />
              <button className="btn-accent text-xs h-9 px-4" onClick={handleAddNiche}>Adicionar</button>
            </div>
          </SettingsCard>
        </div>

        {/* ===== ROW 2: Palettes (full width) ===== */}
        <SettingsCard title="Paleta de Cores" icon={Palette}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(palettes).map(([key, p]) => {
              const isActive = palette === key;
              const c = p.dark;
              return (
                <button key={key}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: isActive ? 'var(--accent-surface)' : 'var(--bg-secondary)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                  }}
                  onClick={() => setPalette(key)}
                >
                  <div className="flex -space-x-1 flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20" style={{ background: c['--bg-primary'] }} />
                    <div className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20" style={{ background: c['--accent'] }} />
                    <div className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20" style={{ background: c['--accent-light'] }} />
                  </div>
                  <span className="text-xs font-medium truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {p.name}
                  </span>
                  {isActive && <Check size={11} className="ml-auto flex-shrink-0" style={{ color: 'var(--accent-light)' }} />}
                </button>
              );
            })}
          </div>
        </SettingsCard>

        {/* ===== VOZ DO CRIADOR ===== */}
        <SettingsCard title="Voz do Criador" icon={User}>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Descreva seu tom, estilo e jeito de escrever. Esses campos vão junto no export "Modo IA"
            — assim qualquer IA que você usar gera conteúdo no <strong>seu estilo</strong> sem você ter que ensinar de novo.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Quem sou eu / Pra quem falo
              </label>
              <textarea className="textarea-field text-sm" style={{ minHeight: '70px' }}
                placeholder="Ex: Criador de conteúdo focado em saúde mental para pessoas entre 25 e 40 anos, profissionais ansiosos buscando equilíbrio..."
                value={creatorVoice?.bio || ''}
                onChange={e => setCreatorVoice({ bio: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Tom & Estilo
                </label>
                <textarea className="textarea-field text-sm" style={{ minHeight: '70px' }}
                  placeholder="Ex: direto, conversado, sem rodeios, frases curtas, evita academicismo..."
                  value={creatorVoice?.style || ''}
                  onChange={e => setCreatorVoice({ style: e.target.value })} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Exemplo de trecho seu
                </label>
                <textarea className="textarea-field text-sm" style={{ minHeight: '70px' }}
                  placeholder="Cole 1-2 frases que representam bem como você fala..."
                  value={creatorVoice?.examples || ''}
                  onChange={e => setCreatorVoice({ examples: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#10B981' }}>
                  Palavras que uso
                </label>
                <input className="input-field text-sm" placeholder="Ex: olha, repara, escuta, manja, parça..."
                  value={creatorVoice?.wordsToUse || ''}
                  onChange={e => setCreatorVoice({ wordsToUse: e.target.value })} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#EF4444' }}>
                  Palavras que evito
                </label>
                <input className="input-field text-sm" placeholder="Ex: portanto, consoante, outrossim..."
                  value={creatorVoice?.wordsToAvoid || ''}
                  onChange={e => setCreatorVoice({ wordsToAvoid: e.target.value })} />
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* ===== ROW 3: Data ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Export */}
          <SettingsCard title="Exportar Dados" icon={Download}>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Faça backup dos seus roteiros, headlines, assets e configurações em formato JSON.
            </p>
            <button className="btn-accent text-xs flex items-center gap-2" onClick={() => setShowExport(true)}>
              <Download size={14} /> Abrir painel de exportação
            </button>
          </SettingsCard>

          {/* Import */}
          <SettingsCard title="Importar Dados" icon={Upload}>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Restaure um backup anterior ou importe dados de outra instalação.
            </p>
            <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleImport} />
            <button className="btn-ghost text-xs flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> Importar JSON
            </button>
            {importStatus && (
              <p className={`text-xs mt-2 ${importStatus.success ? 'text-green-400' : 'text-red-400'}`}>
                {importStatus.success ? '✓ Dados importados com sucesso!' : `✗ Erro: ${importStatus.error}`}
              </p>
            )}
          </SettingsCard>
        </div>

        {/* ===== Importar Complemento ===== */}
        <SettingsCard title="Importar Complemento" icon={Layers}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Soma novos registros (headlines, roteiros, acervo, músicas, vídeos, tarefas, aprendizados, etc.) ao seu banco atual, sem apagar nada.
            Você verá cada item antes de confirmar e pode marcar/desmarcar individualmente.
          </p>
          <input type="file" accept=".json" ref={mergeFileInputRef} className="hidden" onChange={handleMergeImport} />
          <button
            className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg font-semibold transition-all"
            style={{ background: 'var(--accent-surface, rgba(139,92,246,0.12))', color: 'var(--accent-light)', border: '1px solid var(--accent, #8B5CF6)' }}
            onClick={() => mergeFileInputRef.current?.click()}
          >
            <Layers size={14} /> Escolher Complemento
          </button>
        </SettingsCard>

        {/* ===== ROW 4: Danger Zone ===== */}
        <div className="rounded-xl p-5"
          style={{
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: '#EF4444', opacity: 0.8 }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#EF4444' }}>
              Zona de Perigo
            </h3>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Essa ação remove permanentemente todos os dados salvos no app. Use com cuidado.
          </p>
          <button
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 size={14} /> Limpar todos os dados
          </button>
        </div>

      </div>

      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />

      <MergePreviewModal
        isOpen={!!mergePreview}
        onClose={() => setMergePreview(null)}
        mergeData={mergePreview?.data}
        fileName={mergePreview?.fileName || ''}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => { clearAllData(); setShowClearConfirm(false); }}
        title="Limpar todos os dados"
        message="Isso vai apagar permanentemente todos os cards, headlines, roteiros, imagens, músicas e tarefas. Essa ação não pode ser desfeita."
      />
    </div>
  );
}
