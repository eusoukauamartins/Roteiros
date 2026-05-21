import { useState } from 'react';
import { Plus, Search, Trash2, X, Edit3, Copy, Music as MusicIcon, ExternalLink } from 'lucide-react';
import useMusicStore from '../stores/useMusicStore';
import useNicheStore from '../stores/useNicheStore';
import { format } from 'date-fns';

export default function MusicPage() {
  const { musics, addMusic, updateMusic, deleteMusic } = useMusicStore();
  const niches = useNicheStore(s => s.niches);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [form, setForm] = useState({ name: '', link: '', niche: '', tags: '', notes: '' });

  const filtered = musics.filter(m => {
    if (search && !m.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNiche && m.niche !== filterNiche) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const openCreate = () => { setForm({ name: '', link: '', niche: '', tags: '', notes: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (m) => { setForm({ name: m.name, link: m.link, niche: m.niche, tags: (m.tags||[]).join(', '), notes: m.notes||'' }); setEditing(m.id); setShowForm(true); };

  const handleSave = () => {
    const data = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
    if (editing) updateMusic(editing, data); else addMusic(data);
    setShowForm(false); setEditing(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Músicas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{musics.length} músicas na biblioteca</p>
        </div>
        <button className="btn-accent flex items-center gap-2" onClick={openCreate}><Plus size={16}/> Nova Música</button>
      </div>
      <div className="px-6 pb-4 flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}/>
          <input className="input-field pl-9 h-9 text-sm" placeholder="Buscar música..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="input-field h-9 text-sm w-40" value={filterNiche} onChange={e=>setFilterNiche(e.target.value)}>
          <option value="">Todos</option>
          {niches.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="glass-card p-4 flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
                <MusicIcon size={18} className="text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{m.name || 'Sem nome'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {m.niche && <span className="badge">{m.niche}</span>}
                  {m.tags?.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{background:'var(--surface)',color:'var(--text-muted)'}}>#{t}</span>)}
                  <span className="text-[10px] ml-auto" style={{color:'var(--text-muted)'}}>{format(new Date(m.createdAt),'dd/MM/yyyy')}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {m.link && <>
                  <button className="p-1.5 rounded hover:bg-[var(--surface-hover)]" onClick={()=>navigator.clipboard.writeText(m.link)} title="Copiar link"><Copy size={13} style={{color:'var(--text-muted)'}}/></button>
                  <a href={m.link} target="_blank" rel="noopener" className="p-1.5 rounded hover:bg-[var(--surface-hover)]" title="Abrir"><ExternalLink size={13} style={{color:'var(--text-muted)'}}/></a>
                </>}
                <button className="p-1.5 rounded hover:bg-[var(--surface-hover)]" onClick={()=>openEdit(m)}><Edit3 size={13} style={{color:'var(--text-muted)'}}/></button>
                <button className="p-1.5 rounded hover:bg-[var(--surface-hover)]" onClick={()=>deleteMusic(m.id)}><Trash2 size={13} style={{color:'#EF4444'}}/></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-16 text-sm" style={{color:'var(--text-muted)'}}>Nenhuma música ainda</div>}
        </div>
      </div>
      {showForm && (
        <div className="overlay animate-fade-in" onClick={()=>setShowForm(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            style={{boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{color:'var(--text-primary)'}}>{editing?'Editar':'Nova'} Música</h2>
              <button onClick={()=>setShowForm(false)} style={{color:'var(--text-muted)'}}><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Nome</label>
                <input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome da música" autoFocus/></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Link</label>
                <input className="input-field" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://..."/></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Nicho / Contexto</label>
                <select className="input-field" value={form.niche} onChange={e=>setForm({...form,niche:e.target.value})}>
                  <option value="">Selecionar</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Tags</label>
                <input className="input-field" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="calma, energética, emotiva"/></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Observações</label>
                <textarea className="textarea-field" style={{minHeight:'60px'}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notas..."/></div>
              <div className="flex gap-3 pt-2">
                <button className="btn-ghost flex-1" onClick={()=>setShowForm(false)}>Cancelar</button>
                <button className="btn-accent flex-1" onClick={handleSave}>{editing?'Salvar':'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
