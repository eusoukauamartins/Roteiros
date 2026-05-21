import { useState, useMemo, useRef } from 'react';
import useLearningStore from '../stores/useLearningStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  BookOpen, Plus, Search, Star, Trash2, Edit3, GripVertical,
  ChevronDown, ChevronRight, X, RotateCcw
} from 'lucide-react';

/* ── helpers ── */
function toLocalISODate(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const normalizeTag = (tag) => {
  if (!tag) return '';
  return tag.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const defaultLearning = () => ({
  content: '',
  source: '',
  tags: [],
  isFavorite: false,
  date: toLocalISODate(new Date()),
  order: 0,
});

export default function LearningsPage() {
  const { learnings, createLearning, updateLearning, deleteLearning, restoreLearning, permanentlyDeleteLearning, updateBatch } = useLearningStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultLearning());
  const [tagInput, setTagInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToPermanentlyDelete, setItemToPermanentlyDelete] = useState(null);
  const tagInputRef = useRef(null);

  /* ── tag stats ── */
  const tagStats = useMemo(() => {
    const stats = {};
    learnings.forEach(item => {
      const normTags = (item.tags || []).map(normalizeTag);
      const uniqueTags = Array.from(new Set(normTags));
      uniqueTags.forEach(t => {
        if (!t) return;
        stats[t] = (stats[t] || 0) + 1;
      });
    });
    return Object.entries(stats)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [learnings]);

  const existingTags = tagStats.map(s => s.tag);

  /* ── grouped learnings ── */
  const groupedLearnings = useMemo(() => {
    let filtered = [...learnings];
    if (showTrash) filtered = filtered.filter(l => l.deletedAt);
    else filtered = filtered.filter(l => !l.deletedAt);
    
    if (showFavoritesOnly) filtered = filtered.filter(l => l.isFavorite);
    if (selectedTagFilter) {
      filtered = filtered.filter(l => {
        const normTags = (l.tags || []).map(normalizeTag);
        return normTags.includes(selectedTagFilter);
      });
    }
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        (l.content || '').toLowerCase().includes(lower) ||
        (l.source || '').toLowerCase().includes(lower) ||
        (l.tags || []).some(t => t.toLowerCase().includes(lower))
      );
    }
    const groups = {};
    filtered.forEach(item => {
      const normTags = (item.tags || []).map(normalizeTag);
      const primaryGroup = normTags.length > 0 ? normTags[0] : 'geral';
      if (!groups[primaryGroup]) groups[primaryGroup] = [];
      groups[primaryGroup].push(item);
    });
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'geral') return 1;
      if (b === 'geral') return -1;
      return a.localeCompare(b);
    });
    return { groups, sortedKeys };
  }, [learnings, searchTerm, showFavoritesOnly, selectedTagFilter, showTrash]);

  /* ── handlers ── */
  const toggleExpanded = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  const handleEdit = (item, e) => {
    e.stopPropagation();
    setForm({ ...defaultLearning(), ...item });
    setEditing(item.id);
    setShowModal(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteLearning(id);
    setItemToDelete(null);
  };

  const toggleFavorite = (id, current, e) => {
    e.stopPropagation();
    updateLearning(id, { isFavorite: !current });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = normalizeTag(tagInput);
      if (newTag && !form.tags.includes(newTag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = () => {
    if (!form.content.trim()) return;
    const normalizedTags = Array.from(new Set(form.tags.map(normalizeTag)));
    const payload = { ...form, tags: normalizedTags };
    if (editing) {
      updateLearning(editing, payload);
    } else {
      createLearning(payload);
    }
    setShowModal(false);
    setEditing(null);
    setForm(defaultLearning());
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const groupKey = result.source.droppableId;
    if (result.destination.droppableId !== groupKey) return;
    const groupItems = Array.from(groupedLearnings.groups[groupKey]);
    const [reorderedItem] = groupItems.splice(result.source.index, 1);
    groupItems.splice(result.destination.index, 0, reorderedItem);
    const updates = groupItems.map((item, index) => ({
      id: item.id,
      changes: { order: index },
    }));
    updateBatch(updates);
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Aprendizados</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Biblioteca de insights, referências e conhecimento estruturado
          </p>
        </div>
        <button className="btn-accent flex items-center gap-2" onClick={() => { setForm(defaultLearning()); setEditing(null); setShowModal(true); }}>
          <Plus size={16} /> Novo Insight
        </button>
      </div>

      {/* FILTERS */}
      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input-field pl-9 h-9 text-sm"
            placeholder="Pesquisar conhecimentos, tags ou fontes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field h-9 text-sm"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedTagFilter}
          onChange={e => setSelectedTagFilter(e.target.value)}
        >
          <option value="">Todas as Categorias</option>
          {tagStats.map(stat => (
            <option key={stat.tag} value={stat.tag}>{stat.tag} ({stat.count})</option>
          ))}
        </select>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: showFavoritesOnly ? 'rgba(245,158,11,0.12)' : 'var(--surface)',
            color: showFavoritesOnly ? '#F59E0B' : 'var(--text-muted)',
            border: showFavoritesOnly ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border-color)',
          }}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} /> Favoritos
        </button>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          style={{
            background: showTrash ? 'rgba(239,68,68,0.12)' : 'var(--surface)',
            color: showTrash ? '#EF4444' : 'var(--text-muted)',
            border: showTrash ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border-color)',
          }}
          onClick={() => setShowTrash(!showTrash)}
        >
          <Trash2 size={14} /> Lixeira
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {learnings.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={40} style={{ color: 'var(--text-muted)', opacity: 0.25 }} className="mx-auto mb-3" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Nenhum insight registrado</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
              Transforme conteúdos consumidos em blocos de conhecimento estruturados.
            </p>
            <button className="btn-accent mt-4 text-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Novo Insight
            </button>
          </div>
        ) : groupedLearnings.sortedKeys.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
            Nenhum resultado encontrado para os filtros atuais.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-8">
              {groupedLearnings.sortedKeys.map(groupKey => (
                <div key={groupKey}>
                  {/* Group header */}
                  <div className="text-[15px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent-light, #8B5CF6)' }} />
                    {groupKey}
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                      {groupedLearnings.groups[groupKey].length}
                    </span>
                  </div>

                  <Droppable droppableId={groupKey}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {groupedLearnings.groups[groupKey].map((item, index) => {
                          const isExpanded = expandedIds[item.id];
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => {
                                const style = {
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.9 : 1,
                                  zIndex: snapshot.isDragging ? 100 : 'auto',
                                };
                                if (style.transform) {
                                  style.transform = style.transform.replace(/translate\([^,]+,/, 'translate(0px,');
                                }

                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="glass-card p-4 cursor-pointer transition-all group"
                                    style={{
                                      ...style,
                                      borderColor: item.isFavorite ? 'rgba(245,158,11,0.25)' : undefined,
                                    }}
                                    onClick={() => toggleExpanded(item.id)}
                                  >
                                    <div className="flex gap-3">
                                      {/* Drag handle */}
                                      <div
                                        {...provided.dragHandleProps}
                                        className="flex items-start pt-0.5"
                                        style={{ cursor: 'grab', color: 'var(--text-muted)' }}
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <GripVertical size={16} />
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className="text-sm leading-relaxed"
                                          style={{
                                            color: 'var(--text-primary)',
                                            whiteSpace: 'pre-wrap',
                                            display: isExpanded ? 'block' : '-webkit-box',
                                            WebkitLineClamp: isExpanded ? 'unset' : 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                          }}
                                        >
                                          {item.content}
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                          <div className="mt-4 pt-3 flex flex-wrap gap-4 items-center text-[10px]"
                                            style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                            {item.source && <div><strong>Fonte:</strong> {item.source}</div>}
                                            {item.date && (
                                              <div><strong>Registrado em:</strong> {item.date.split('-').reverse().join('/')}</div>
                                            )}
                                            {item.tags && item.tags.length > 0 && (
                                              <div className="flex gap-1 flex-wrap">
                                                {item.tags.map(t => (
                                                  <span key={t} className="px-1.5 py-0.5 rounded"
                                                    style={{ background: 'var(--surface-hover)' }}>#{t}</span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Actions */}
                                      <div className="flex flex-col gap-1.5 items-center" onClick={e => e.stopPropagation()}>
                                        {!showTrash ? (
                                          <>
                                            <button
                                              className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                                              onClick={(e) => toggleFavorite(item.id, item.isFavorite, e)}
                                              style={{ color: item.isFavorite ? '#F59E0B' : 'var(--text-muted)' }}
                                            >
                                              <Star size={14} fill={item.isFavorite ? 'currentColor' : 'none'} />
                                            </button>
                                            {isExpanded && (
                                              <>
                                                <button className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                                                  onClick={(e) => handleEdit(item, e)}>
                                                  <Edit3 size={13} style={{ color: 'var(--text-muted)' }} />
                                                </button>
                                                <button className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                                                  onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}>
                                                  <Trash2 size={13} style={{ color: '#EF4444' }} />
                                                </button>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            <button className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                                              onClick={(e) => { e.stopPropagation(); restoreLearning(item.id); }}>
                                              <RotateCcw size={13} style={{ color: 'var(--text-muted)' }} />
                                            </button>
                                            <button className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                                              onClick={(e) => { e.stopPropagation(); setItemToPermanentlyDelete(item); }}>
                                              <Trash2 size={13} style={{ color: '#EF4444' }} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* ═══ MODAL ═══ */}
      {showModal && (
        <div className="overlay animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Editar Insight' : 'Novo Insight Estratégico'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {/* Conteúdo */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Insight / Conhecimento *</label>
                <textarea
                  className="textarea-field"
                  placeholder="Qual o aprendizado central? Seja direto e estruturado."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  style={{ minHeight: '120px' }}
                  autoFocus
                />
              </div>
              {/* Fonte */}
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Fonte (Opcional)</label>
                <input
                  className="input-field"
                  placeholder="Ex: Livro X, Vídeo Y, Reunião com Z"
                  value={form.source || ''}
                  onChange={e => setForm({ ...form, source: e.target.value })}
                />
              </div>
              {/* Tags */}
              <div style={{ position: 'relative' }}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Tags / Categorias (Pressione Enter para adicionar)
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg" style={{ background: 'var(--surface)', minHeight: '42px' }}>
                  {form.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded-md flex items-center gap-1"
                      style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)' }}>
                      {tag}
                      <X size={11} className="cursor-pointer" style={{ opacity: 0.5 }} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                  <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagInput}
                      onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                      onFocus={() => setShowTagSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                      onKeyDown={handleAddTag}
                      placeholder={form.tags.length === 0 ? 'Ex: marketing, operações...' : ''}
                      className="text-sm"
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', width: '100%', minHeight: '24px' }}
                    />
                    {showTagSuggestions && tagInput.trim() && (
                      <div className="absolute top-full left-0 mt-1 rounded-lg overflow-hidden z-50"
                        style={{
                          minWidth: '200px', background: 'var(--bg-secondary, var(--surface))',
                          border: '1px solid var(--border-color)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                          maxHeight: '200px', overflowY: 'auto',
                        }}>
                        {existingTags
                          .filter(t => t.includes(normalizeTag(tagInput)) && !form.tags.includes(t))
                          .slice(0, 8)
                          .map(tag => (
                            <div
                              key={tag}
                              className="px-3 py-2 text-sm cursor-pointer transition-colors"
                              style={{ borderBottom: '1px solid var(--border-color)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              onClick={() => {
                                setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                                setTagInput('');
                                setShowTagSuggestions(false);
                                tagInputRef.current?.focus();
                              }}
                            >
                              {tag}
                            </div>
                          ))
                        }
                        {existingTags.filter(t => t.includes(normalizeTag(tagInput)) && !form.tags.includes(t)).length === 0 && (
                          <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            Pressione Enter para criar a tag "{normalizeTag(tagInput)}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  A primeira tag definirá o grupo visual principal na lista.
                </p>
              </div>
              {/* Favorito */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fav-check"
                  checked={form.isFavorite}
                  onChange={e => setForm({ ...form, isFavorite: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="fav-check" className="text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                  Marcar como Favorito
                </label>
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-accent flex-1" onClick={handleSubmit}>
                  {editing ? 'Salvar Insight' : 'Adicionar Insight'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="overlay animate-fade-in" onClick={() => setItemToDelete(null)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2 text-white">Mover para a lixeira?</h3>
            <p className="text-xs mb-6 text-gray-400">Tem certeza que deseja mover este aprendizado para a lixeira?</p>
            <div className="flex gap-3">
              <button className="btn-ghost flex-1 text-sm py-2" onClick={() => setItemToDelete(null)}>Cancelar</button>
              <button className="flex-1 text-sm py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  onClick={(e) => handleDelete(itemToDelete.id, e)}>Excluir</button>
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
                  onClick={(e) => { e.stopPropagation(); permanentlyDeleteLearning(itemToPermanentlyDelete.id); setItemToPermanentlyDelete(null); }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
