import { useState } from 'react';
import { Plus, Search, Trash2, X, Edit3, Copy, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import useImageStore from '../stores/useImageStore';
import useNicheStore from '../stores/useNicheStore';
import { format } from 'date-fns';

export default function ImagesPage() {
  const { images, addImage, updateImage, deleteImage } = useImageStore();
  const niches = useNicheStore(s => s.niches);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [form, setForm] = useState({ title: '', niche: '', tags: '', link: '', description: '', notes: '' });

  const filtered = images.filter(i => {
    if (search && !i.title?.toLowerCase().includes(search.toLowerCase()) && !i.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNiche && i.niche !== filterNiche) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const openCreate = () => { setForm({ title: '', niche: '', tags: '', link: '', description: '', notes: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (i) => { setForm({ title: i.title, niche: i.niche, tags: (i.tags||[]).join(', '), link: i.link, description: i.description, notes: i.notes||'' }); setEditing(i.id); setShowForm(true); };

  const handleSave = () => {
    const data = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
    if (editing) updateImage(editing, data); else addImage(data);
    setShowForm(false); setEditing(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Imagens & Referências</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{images.length} referências visuais</p>
        </div>
        <button className="btn-accent flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Nova Referência</button>
      </div>
      <div className="px-6 pb-4 flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9 h-9 text-sm" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="input-field h-9 text-sm w-40" value={filterNiche} onChange={e=>setFilterNiche(e.target.value)}>
          <option value="">Todos</option>
          {niches.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(i => (
            <div key={i.id} className="glass-card p-4 group">
              <div className="w-full h-32 rounded-lg mb-3 flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                {i.link ? (
                  <img src={i.link} alt={i.title} className="w-full h-full object-cover rounded-lg"
                    onError={(e)=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null}
                <div className={`flex-col items-center gap-2 ${i.link ? 'hidden' : 'flex'}`}>
                  <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sem preview</span>
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{i.title || 'Sem título'}</h3>
              <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{i.description}</p>
              <div className="flex items-center gap-2">
                {i.niche && <span className="badge">{i.niche}</span>}
                <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>{format(new Date(i.createdAt), 'dd/MM')}</span>
              </div>
              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {i.link && <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={()=>navigator.clipboard.writeText(i.link)}><Copy size={12} style={{color:'var(--text-muted)'}}/></button>}
                <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={()=>openEdit(i)}><Edit3 size={12} style={{color:'var(--text-muted)'}}/></button>
                <button className="p-1 rounded hover:bg-[var(--surface-hover)]" onClick={()=>deleteImage(i.id)}><Trash2 size={12} style={{color:'#EF4444'}}/></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma referência visual ainda</div>
          )}
        </div>
      </div>
      {showForm && (
        <div className="overlay animate-fade-in" onClick={()=>setShowForm(false)}>
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl p-6 z-50 animate-scale-in glass-strong"
            style={{boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{color:'var(--text-primary)'}}>{editing?'Editar':'Nova'} Referência Visual</h2>
              <button onClick={()=>setShowForm(false)} style={{color:'var(--text-muted)'}}><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Título</label>
                <input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Nome da referência" autoFocus/></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Link da imagem</label>
                <input className="input-field" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://..."/></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Descrição</label>
                <textarea className="textarea-field" style={{minHeight:'60px'}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Descreva a referência"/></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Nicho</label>
                <select className="input-field" value={form.niche} onChange={e=>setForm({...form,niche:e.target.value})}>
                  <option value="">Selecionar</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{color:'var(--text-secondary)'}}>Tags</label>
                <input className="input-field" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="cenário, thumbnail"/></div>
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
