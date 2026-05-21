import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, Copy, ArrowRight, Trash2, X, Edit3, Maximize2 } from 'lucide-react';
import useScriptStore from '../stores/useScriptStore';
import useVideoStore from '../stores/useVideoStore';
import useNicheStore from '../stores/useNicheStore';
import { toast } from '../components/shared/Toast';
import { format } from 'date-fns';

export default function ScriptsPage() {
  const { scripts, addScript, updateScript, deleteScript, toggleFavorite } = useScriptStore();
  const addCard = useVideoStore(s => s.addCard);
  const niches = useNicheStore(s => s.niches);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [focusMode, setFocusMode] = useState(null);
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [form, setForm] = useState({ title: '', text: '', niche: '', tags: '', notes: '' });

  const filtered = scripts.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNiche && s.niche !== filterNiche) return false;
    if (filterFav && !s.favorite) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const openCreate = () => {
    setForm({ title: '', text: '', niche: '', tags: '', notes: '' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({ title: s.title, text: s.text, niche: s.niche, tags: (s.tags || []).join(', '), notes: s.notes || '' });
    setEditing(s.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editing) updateScript(editing, data);
    else addScript(data);
    setShowForm(false);
    setEditing(null);
  };

  const useInFlow = (s) => {
    const card = addCard({ headline: s.title, script: s.text, niche: s.niche, status: 'creating' });
    toast.success('Roteiro enviado pro fluxo (Em criação)', {
      action: {
        label: 'Abrir',
        onClick: () => navigate(`/videos?id=${card.id}`),
      },
    });
  };

  // Focus Mode
  if (focusMode) {
    return (
      <div className="focus-mode animate-fade-in">
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <button className="btn-ghost text-sm" onClick={() => {
            updateScript(focusMode.id, { text: focusMode.text });
            setFocusMode(null);
          }}>
            Salvar & Sair
          </button>
          <button onClick={() => setFocusMode(null)} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="absolute top-6 left-6">
          <h3 className="text-sm font-medium gradient-text">{focusMode.title || 'Modo Foco'}</h3>
        </div>
        <textarea
          className="focus-editor px-8"
          value={focusMode.text}
          onChange={(e) => setFocusMode({ ...focusMode, text: e.target.value })}
          placeholder="Comece a escrever seu roteiro..."
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Roteiros</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {scripts.length} roteiros na biblioteca
          </p>
        </div>
        <button className="btn-accent flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Novo Roteiro
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9 h-9 text-sm" placeholder="Buscar roteiro..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-9 text-sm w-40" value={filterNiche} onChange={e => setFilterNiche(e.target.value)}>
          <option value="">Todos os nichos</option>
          {niches.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button
          className={`btn-ghost h-9 text-sm flex items-center gap-1`}
          style={filterFav ? { color: '#F59E0B', borderColor: '#F59E0B' } : {}}
          onClick={() => setFilterFav(!filterFav)}
        >
          <Star size={14} fill={filterFav ? '#F59E0B' : 'none'} /> Favoritos
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(s => (
            <div key={s.id} className="glass-card p-4 group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFavorite(s.id)}>
                    <Star size={14} fill={s.favorite ? '#F59E0B' : 'none'}
                      style={{ color: s.favorite ? '#F59E0B' : 'var(--text-muted)' }} />
                  </button>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {s.title || 'Sem título'}
                  </h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={() => setFocusMode(s)}
                    title="Modo Foco"><Maximize2 size={13} style={{ color: 'var(--text-muted)' }} /></button>
                  <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={() => useInFlow(s)}
                    title="Usar no Fluxo"><ArrowRight size={13} style={{ color: 'var(--text-muted)' }} /></button>
                  <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={() => openEdit(s)}
                    title="Editar"><Edit3 size={13} style={{ color: 'var(--text-muted)' }} /></button>
                  <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={() => deleteScript(s.id)}
                    title="Excluir"><Trash2 size={13} style={{ color: '#EF4444' }} /></button>
                </div>
              </div>
              <p className="text-xs line-clamp-3 mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {s.text || 'Sem conteúdo'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {s.niche && <span className="badge">{s.niche}</span>}
                {s.tags?.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>#{t}</span>
                ))}
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(s.createdAt), 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
              {search || filterNiche || filterFav ? 'Nenhum roteiro encontrado' : 'Nenhum roteiro ainda. Crie o primeiro!'}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="overlay animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Editar Roteiro' : 'Novo Roteiro'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Título</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Título do roteiro" autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Roteiro completo</label>
                <textarea className="textarea-field" style={{ minHeight: '200px' }} value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                  placeholder="Escreva o roteiro aqui... (CTAs, narrativa, desenvolvimento, finalização)" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Nicho</label>
                <select className="input-field" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })}>
                  <option value="">Selecionar</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tags</label>
                <input className="input-field" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="tutorial, avançado, série" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Observações</label>
                <textarea className="textarea-field" style={{ minHeight: '60px' }} value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notas..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-accent flex-1" onClick={handleSave}>{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
