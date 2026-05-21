import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, Copy, ArrowRight, Trash2, X, Edit3, Heart } from 'lucide-react';
import useHeadlineStore from '../stores/useHeadlineStore';
import useVideoStore from '../stores/useVideoStore';
import useNicheStore from '../stores/useNicheStore';
import { toast } from '../components/shared/Toast';
import { format } from 'date-fns';

export default function HeadlinesPage() {
  const { headlines, addHeadline, updateHeadline, deleteHeadline, toggleFavorite } = useHeadlineStore();
  const addCard = useVideoStore(s => s.addCard);
  const niches = useNicheStore(s => s.niches);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [form, setForm] = useState({ text: '', niche: '', tags: '', notes: '' });

  const filtered = headlines.filter(h => {
    if (search && !h.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNiche && h.niche !== filterNiche) return false;
    if (filterFav && !h.favorite) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const openCreate = () => {
    setForm({ text: '', niche: '', tags: '', notes: '' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (h) => {
    setForm({ text: h.text, niche: h.niche, tags: (h.tags || []).join(', '), notes: h.notes || '' });
    setEditing(h.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editing) {
      updateHeadline(editing, data);
    } else {
      addHeadline(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  const useInFlow = (h) => {
    const card = addCard({ headline: h.text, niche: h.niche, status: 'creating' });
    toast.success('Headline enviada pro fluxo (Em criação)', {
      action: {
        label: 'Abrir',
        onClick: () => navigate(`/videos?id=${card.id}`),
      },
    });
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copiado para a área de transferência');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Headlines</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {headlines.length} headlines na biblioteca
          </p>
        </div>
        <button className="btn-accent flex items-center gap-2" onClick={openCreate}>
          <Plus size={16} /> Nova Headline
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9 h-9 text-sm" placeholder="Buscar headline..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field h-9 text-sm w-40" value={filterNiche} onChange={e => setFilterNiche(e.target.value)}>
          <option value="">Todos os nichos</option>
          {niches.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button
          className={`btn-ghost h-9 text-sm flex items-center gap-1 ${filterFav ? 'border-yellow-500' : ''}`}
          style={filterFav ? { color: '#F59E0B', borderColor: '#F59E0B' } : {}}
          onClick={() => setFilterFav(!filterFav)}
        >
          <Star size={14} fill={filterFav ? '#F59E0B' : 'none'} /> Favoritas
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-2">
          {filtered.map(h => (
            <div key={h.id} className="glass-card p-4 flex items-start gap-3 group">
              <button onClick={() => toggleFavorite(h.id)} className="mt-0.5 flex-shrink-0">
                <Star size={16} fill={h.favorite ? '#F59E0B' : 'none'}
                  style={{ color: h.favorite ? '#F59E0B' : 'var(--text-muted)' }} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{h.text}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {h.niche && <span className="badge">{h.niche}</span>}
                  {h.tags?.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>#{t}</span>
                  ))}
                  <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(h.createdAt), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)]" onClick={() => copyText(h.text)}
                  title="Copiar"><Copy size={14} style={{ color: 'var(--text-muted)' }} /></button>
                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)]" onClick={() => useInFlow(h)}
                  title="Usar no Fluxo"><ArrowRight size={14} style={{ color: 'var(--text-muted)' }} /></button>
                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)]" onClick={() => openEdit(h)}
                  title="Editar"><Edit3 size={14} style={{ color: 'var(--text-muted)' }} /></button>
                <button className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)]" onClick={() => deleteHeadline(h.id)}
                  title="Excluir"><Trash2 size={14} style={{ color: '#EF4444' }} /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
              {search || filterNiche || filterFav ? 'Nenhuma headline encontrada com esses filtros' : 'Nenhuma headline ainda. Crie a primeira!'}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="overlay animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Editar Headline' : 'Nova Headline'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Texto</label>
                <textarea className="textarea-field" style={{ minHeight: '80px' }} value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Digite a headline..." autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Nicho</label>
                <select className="input-field" value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })}>
                  <option value="">Selecionar</option>
                  {niches.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tags (separadas por vírgula)</label>
                <input className="input-field" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="viral, tendência, polêmica" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Observações</label>
                <textarea className="textarea-field" style={{ minHeight: '60px' }} value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notas..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-ghost flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-accent flex-1" onClick={handleSave}>
                  {editing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
