import { useState, useMemo, useCallback } from 'react';
import {
  Package, Plus, Settings2, BarChart2, DollarSign,
  TrendingUp, LinkIcon, X, Maximize2, FileText, Target,
  ShoppingCart, Activity, Wallet, Percent, ChevronDown, Copy, Trash2,
  Code, CreditCard, Users
} from 'lucide-react';
import useProductStore from '../stores/useProductStore';

// Helper for formatting currency
const formatCurrency = (val) => {
  if (isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

// --- MULTIPLE LINKS ROW COMPONENT ---
function PageLinksEditor({ links, onChange }) {
  const addLink = () => onChange([...links, { id: Date.now().toString(), name: '', url: '', notes: '' }]);
  const updateLink = (idx, field, val) => {
    const newLinks = [...links];
    newLinks[idx][field] = val;
    onChange(newLinks);
  };
  const removeLink = (idx) => onChange(links.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {links.map((link, idx) => (
        <div key={link.id || idx} className="p-3 rounded-xl flex flex-col gap-2 relative group"
          style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-color)' }}>
          <div className="flex gap-2">
            <input className="input-field text-xs flex-1 h-8" placeholder="Nome (Ex: VSL, Checkout)"
              value={link.name} onChange={e => updateLink(idx, 'name', e.target.value)} />
            <input className="input-field text-xs flex-[2] h-8" placeholder="URL da página..."
              value={link.url} onChange={e => updateLink(idx, 'url', e.target.value)} />
            <button onClick={() => removeLink(idx)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
              <X size={14} />
            </button>
          </div>
          <input className="input-field text-xs h-7 bg-transparent border-none px-2 text-[var(--text-muted)]" placeholder="Observação opcional..."
            value={link.notes} onChange={e => updateLink(idx, 'notes', e.target.value)} />
        </div>
      ))}
      <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 mt-2" onClick={addLink}>
        <Plus size={13} /> Adicionar página
      </button>
    </div>
  );
}


// --- PRODUCTS TAB ---
function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [editingId, setEditingId] = useState(null);

  const editingProduct = products.find(p => p.id === editingId);

  const handleCreate = () => {
    const p = addProduct({ name: 'Novo Produto', price: 97 });
    setEditingId(p.id);
  };

  const getTicketColor = (type) => {
    if (type === 'Low Ticket') return '#10B981';
    if (type === 'Medium Ticket') return '#3B82F6';
    if (type === 'High Ticket') return '#8B5CF6';
    return 'var(--text-muted)';
  };

  if (editingId && editingProduct) {
    return (
      <div className="h-full overflow-y-auto px-6 py-6 animate-fade-in custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditingId(null)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]">
                <X size={18} style={{ color: 'var(--text-muted)' }} />
              </button>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Editar Produto</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mantenha as informações claras e objetivas</p>
              </div>
            </div>
            <button onClick={() => { if(window.confirm('Excluir produto?')) { deleteProduct(editingId); setEditingId(null); } }} 
              className="btn-ghost text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10">
              <Trash2 size={14} className="inline mr-1" /> Excluir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 sm:col-span-1">
              <label className="field-label">Nome do Produto</label>
              <input className="input-field font-semibold text-base" value={editingProduct.name} onChange={e => updateProduct(editingId, { name: e.target.value })} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="field-label">Tipo de Ticket</label>
              <select className="input-field" value={editingProduct.ticketType} onChange={e => updateProduct(editingId, { ticketType: e.target.value })}>
                <option value="Low Ticket">Low Ticket</option>
                <option value="Medium Ticket">Medium Ticket</option>
                <option value="High Ticket">High Ticket</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-1">
              <label className="field-label">Preço Atual (R$)</label>
              <input type="number" step="0.01" className="input-field" value={editingProduct.price} onChange={e => updateProduct(editingId, { price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="col-span-1">
              <label className="field-label">Preço "De" Comparativo (R$)</label>
              <input type="number" step="0.01" className="input-field" value={editingProduct.comparePrice} onChange={e => updateProduct(editingId, { comparePrice: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          <div>
            <label className="field-label">Descrição Curta</label>
            <input className="input-field" placeholder="Promessa principal do produto..." value={editingProduct.shortDescription} onChange={e => updateProduct(editingId, { shortDescription: e.target.value })} />
          </div>

          <div>
            <label className="field-label">CTA Principal</label>
            <input className="input-field" placeholder="Ex: Quero garantir minha vaga" value={editingProduct.cta} onChange={e => updateProduct(editingId, { cta: e.target.value })} />
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <label className="field-label flex items-center gap-2 mb-4"><LinkIcon size={14}/> Links e Páginas do Funil</label>
            <PageLinksEditor links={editingProduct.links || []} onChange={newLinks => updateProduct(editingId, { links: newLinks })} />
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <label className="field-label">Observações Estratégicas</label>
            <textarea className="textarea-field min-h-[100px]" placeholder="Anotações sobre a oferta, bônus, detalhes importantes..." value={editingProduct.notes} onChange={e => updateProduct(editingId, { notes: e.target.value })} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in custom-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Portfólio de Produtos</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gerencie suas ofertas e páginas</p>
        </div>
        <button className="btn-accent flex items-center gap-2 text-xs" onClick={handleCreate}>
          <Plus size={14} /> Novo Produto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <Package size={48} style={{ color: 'var(--border-color)' }} className="mb-4" />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nenhum produto cadastrado</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Cadastre seu primeiro produto para organizar seus links e fazer projeções.</p>
          <button className="btn-accent text-xs" onClick={handleCreate}>Cadastrar Produto</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="stat-card cursor-pointer group relative overflow-hidden" onClick={() => setEditingId(p.id)}
                 style={{ padding: '20px' }}>
              <div className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5" style={{ background: getTicketColor(p.ticketType) }} />
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-base leading-tight pr-4" style={{ color: 'var(--text-primary)' }}>{p.name || 'Sem nome'}</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap" 
                  style={{ background: 'var(--surface-hover)', color: getTicketColor(p.ticketType) }}>
                  {p.ticketType}
                </span>
              </div>
              <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-muted)', minHeight: '32px' }}>
                {p.shortDescription || 'Sem descrição'}
              </p>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  {p.comparePrice > p.price && (
                    <span className="text-[10px] line-through block mb-0.5" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                      {formatCurrency(p.comparePrice)}
                    </span>
                  )}
                  <span className="font-bold text-[15px]" style={{ color: 'var(--accent-light)' }}>
                    {formatCurrency(p.price)}
                  </span>
                </div>
                {p.links?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}>
                    <LinkIcon size={10} /> {p.links.length} páginas
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// Helper for sidebar previews
function getPreview(proj, products) {
  const prod = products.find(p => p.id === proj.productId);
  if (!prod) return null;
  const v = Number(proj.views) || 0;
  const cr = Number(proj.conversionRate) || 0;
  const p = Number(prod.price) || 0;
  const sales = Math.floor(v * (cr / 100));
  const rev = sales * p;
  const fx = (Number(proj.employees)||0) + (Number(proj.tools)||0) + (Number(proj.software)||0) + (Number(proj.monthlyExpenses)||0);
  const sumPerc = ((Number(proj.taxes)||0) + (Number(proj.checkoutFees)||0) + (Number(proj.commissions)||0) + (Number(proj.percentageCosts)||0)) / 100;
  const vc = (rev * sumPerc) + (sales * (Number(proj.cpa)||0));
  const profit = rev - fx - vc;
  const margin = rev > 0 ? (profit / rev) * 100 : 0;
  return { profit, margin };
}

// --- PROJECTIONS TAB ---
function ProjectionsTab() {
  const { products, projections, addProjection, updateProjection, deleteProjection, duplicateProjection } = useProductStore();
  const [activeId, setActiveId] = useState(null);

  const activeProj = projections.find(p => p.id === activeId);
  const activeProduct = activeProj ? products.find(p => p.id === activeProj.productId) : null;

  const handleCreate = () => {
    const p = addProjection({ name: `Cenário ${projections.length + 1}` });
    setActiveId(p.id);
  };

  const updateActive = (updates) => {
    if (activeId) updateProjection(activeId, updates);
  };

  // --- SMART CALCULATIONS ---
  const views = Number(activeProj?.views) || 0;
  const conversionRate = Number(activeProj?.conversionRate) || 0;
  const price = Number(activeProduct?.price) || 0;
  
  const sales = Math.floor(views * (conversionRate / 100));
  const revenue = sales * price;
  
  // Explicit Fixed Costs
  const fixedEmployees = Number(activeProj?.employees) || 0;
  const fixedTools = Number(activeProj?.tools) || 0;
  const fixedSoftware = Number(activeProj?.software) || 0;
  const fixedOther = Number(activeProj?.monthlyExpenses) || 0;
  const totalFixedCosts = fixedEmployees + fixedTools + fixedSoftware + fixedOther;

  // Explicit Variable Costs
  const varTaxes = revenue * ((Number(activeProj?.taxes) || 0) / 100);
  const varGateway = revenue * ((Number(activeProj?.checkoutFees) || 0) / 100);
  const varCommissions = revenue * ((Number(activeProj?.commissions) || 0) / 100);
  const varOtherPerc = revenue * ((Number(activeProj?.percentageCosts) || 0) / 100);
  const varTraffic = sales * (Number(activeProj?.cpa) || 0);
  
  const totalVariableCosts = varTaxes + varGateway + varCommissions + varOtherPerc + varTraffic;

  const netProfit = revenue - totalFixedCosts - totalVariableCosts;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  const roas = totalVariableCosts > 0 ? revenue / totalVariableCosts : 0;
  
  const sumPerc = ((Number(activeProj?.taxes) || 0) +
                   (Number(activeProj?.checkoutFees) || 0) +
                   (Number(activeProj?.commissions) || 0) +
                   (Number(activeProj?.percentageCosts) || 0)) / 100;
  const maxCpa = price - (price * sumPerc);

  // Status Logic
  let statusColor = '#10B981';
  let statusText = 'Escalável';
  if (margin < 0) {
    statusColor = '#EF4444';
    statusText = 'Prejuízo';
  } else if (margin < 20 || roas < 1.5) {
    statusColor = '#F59E0B';
    statusText = 'Atenção';
  }

  return (
    <div className="h-full flex animate-fade-in">
      
      {/* Sidebar: Scenarios List */}
      <div className="w-72 flex-shrink-0 border-r flex flex-col z-10" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', boxShadow: '4px 0 24px rgba(0,0,0,0.2)' }}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Cenários</span>
          <button className="btn-accent p-1.5 rounded-lg" onClick={handleCreate} title="Novo Cenário"><Plus size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {projections.length === 0 && (
            <p className="text-[11px] text-center p-6" style={{ color: 'var(--text-muted)' }}>Nenhum cenário salvo.</p>
          )}
          {projections.map(p => {
            const preview = getPreview(p, products);
            const isActive = activeId === p.id;
            
            let badgeColor = 'var(--surface-hover)';
            let badgeText = 'N/A';
            if (preview) {
              if (preview.margin < 0) { badgeColor = 'rgba(239, 68, 68, 0.15)'; badgeText = '🔴'; }
              else if (preview.margin < 20) { badgeColor = 'rgba(245, 158, 11, 0.15)'; badgeText = '🟡'; }
              else { badgeColor = 'rgba(16, 185, 129, 0.15)'; badgeText = '🟢'; }
            }

            return (
              <div key={p.id} className={`p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden ${isActive ? 'bg-[var(--surface-hover)] border-[var(--border-color)] shadow-md' : 'border-transparent hover:bg-[var(--surface)]'}`}
                onClick={() => setActiveId(p.id)}>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)]" />}
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm truncate pr-2" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {p.name || 'Sem nome'}
                  </div>
                  {preview && <span className="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: badgeColor }}>{badgeText}</span>}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider mb-3 truncate" style={{ color: 'var(--text-muted)' }}>
                  {products.find(prod => prod.id === p.productId)?.name || 'Sem produto'}
                </div>
                {preview && (
                  <div className="flex justify-between items-end border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="text-[11px] font-bold" style={{ color: preview.profit >= 0 ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(preview.profit)}
                    </div>
                    <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      M: {preview.margin.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-primary)] relative">
        {!activeProj ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <TrendingUp size={64} style={{ color: 'var(--border-color)' }} className="mb-6" />
            <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Simulador Estratégico</p>
            <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>Crie simulações financeiras executivas e teste o limite de escala dos seus produtos.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-6 md:p-10 pb-32">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex-1 mr-8">
                <input className="text-2xl font-black bg-transparent border-none outline-none w-full tracking-tight"
                  value={activeProj.name} onChange={e => updateActive({ name: e.target.value })}
                  style={{ color: 'var(--text-primary)' }} placeholder="Nome do Cenário..." />
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs px-4 py-2 flex items-center gap-2 font-bold" onClick={() => duplicateProjection(activeId)}>
                  <Copy size={14} /> Duplicar
                </button>
                <button className="btn-ghost text-xs px-4 py-2 flex items-center gap-2 font-bold text-red-500 hover:text-red-400" 
                  onClick={() => { if(window.confirm('Excluir cenário?')) { deleteProjection(activeId); setActiveId(null); } }}>
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>

            {/* Calculations Workspace Layout */}
            <div className="flex flex-col xl:flex-row gap-10 items-start relative">
              
              {/* Left Col: Inputs */}
              <div className="flex-1 w-full space-y-8 min-w-0">
                
                {/* Produto Vinculado */}
                <div className="p-6 rounded-3xl border bg-[var(--surface)] transition-all" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-5 text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                    <Package size={14} /> Produto Vinculado
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                      <select className="input-field w-full font-bold text-sm h-12" value={activeProj.productId || ''} onChange={e => updateActive({ productId: e.target.value })}>
                        <option value="">-- Selecione o Produto Base --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    {activeProduct && (
                      <div className="flex gap-8 items-center bg-[var(--bg-secondary)] px-6 py-3 rounded-2xl border flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Preço Atual</p>
                          <p className="font-black text-lg" style={{ color: 'var(--accent-light)' }}>{formatCurrency(activeProduct.price)}</p>
                        </div>
                        {activeProduct.comparePrice > activeProduct.price && (
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>De</p>
                            <p className="font-bold text-sm line-through" style={{ color: 'var(--text-muted)' }}>{formatCurrency(activeProduct.comparePrice)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {activeProduct && (
                  <>
                    {/* Traffic & Conversion (HIGH EMPHASIS) */}
                    <div className="p-6 rounded-2xl border relative overflow-hidden" style={{ background: 'linear-gradient(145deg, var(--surface) 0%, rgba(255,255,255,0.02) 100%)', borderColor: 'var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] opacity-50"></div>
                      <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-5 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                        <div className="p-2 rounded-lg bg-[var(--accent)] bg-opacity-20"><Target size={16} style={{ color: 'var(--accent-light)' }}/></div>
                        Tráfego & Conversão
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-5 rounded-xl border bg-[var(--bg-primary)] transition-all focus-within:border-[var(--accent)]" style={{ borderColor: 'var(--border-color)' }}>
                          <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Volume de Visitas (Qtd)</label>
                          <input type="number" className="bg-transparent border-none outline-none w-full text-2xl font-bold text-[var(--text-primary)]" value={activeProj.views ?? ''} onChange={e => updateActive({ views: e.target.value })} placeholder="0" />
                        </div>
                        <div className="p-5 rounded-xl border bg-[var(--bg-primary)] transition-all focus-within:border-[var(--accent)] relative" style={{ borderColor: 'var(--border-color)' }}>
                          <label className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Taxa de Conversão</label>
                          <input type="number" step="0.01" className="bg-transparent border-none outline-none w-full text-2xl font-bold text-[var(--text-primary)] pr-8" value={activeProj.conversionRate ?? ''} onChange={e => updateActive({ conversionRate: e.target.value })} placeholder="0.00" />
                          <Percent size={18} className="absolute right-5 top-[46px] text-[var(--text-muted)]" />
                        </div>
                      </div>
                    </div>

                    {/* Variable Costs (WARM) */}
                    <div className="p-6 rounded-2xl border transition-all" style={{ background: 'rgba(239, 68, 68, 0.02)', borderColor: 'rgba(239, 68, 68, 0.15)' }}>
                      <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-5 flex items-center gap-3 text-red-400">
                        <div className="p-2 rounded-lg bg-red-500 bg-opacity-10"><Activity size={16} /></div>
                        Custos Variáveis
                        <span className="normal-case font-semibold text-[10px] opacity-70 ml-2 tracking-normal">(Descontados por venda)</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                        <div>
                          <label className="text-[10px] font-bold block mb-1.5 opacity-70">Imposto (%)</label>
                          <input type="number" step="0.01" className="input-field h-10 text-sm font-bold w-full bg-[var(--bg-primary)]" value={activeProj.taxes ?? ''} onChange={e => updateActive({ taxes: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-1.5 opacity-70">Gateway (%)</label>
                          <input type="number" step="0.01" className="input-field h-10 text-sm font-bold w-full bg-[var(--bg-primary)]" value={activeProj.checkoutFees ?? ''} onChange={e => updateActive({ checkoutFees: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-1.5 opacity-70">Comissões (%)</label>
                          <input type="number" step="0.01" className="input-field h-10 text-sm font-bold w-full bg-[var(--bg-primary)]" value={activeProj.commissions ?? ''} onChange={e => updateActive({ commissions: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block mb-1.5 opacity-70">Outras Taxas (%)</label>
                          <input type="number" step="0.01" className="input-field h-10 text-sm font-bold w-full bg-[var(--bg-primary)]" value={activeProj.percentageCosts ?? ''} onChange={e => updateActive({ percentageCosts: e.target.value })} />
                        </div>
                      </div>
                      <div className="p-5 rounded-xl bg-[var(--bg-primary)] border" style={{ borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <label className="text-[11px] font-bold uppercase tracking-wider block mb-2 opacity-70">Tráfego / CPA Médio (R$ fixo por venda)</label>
                        <div className="relative">
                          <DollarSign size={18} className="absolute left-0 top-[4px] opacity-50" />
                          <input type="number" step="1" className="bg-transparent border-none outline-none w-full text-2xl font-bold pl-7" style={{ color: 'var(--text-primary)' }} value={activeProj.cpa ?? ''} onChange={e => updateActive({ cpa: e.target.value })} placeholder="0" />
                        </div>
                      </div>
                    </div>

                    {/* Fixed Costs (COOL) */}
                    <div className="p-6 rounded-2xl border transition-all" style={{ background: 'rgba(59, 130, 246, 0.02)', borderColor: 'rgba(59, 130, 246, 0.15)' }}>
                      <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-5 flex items-center gap-3 text-blue-400">
                        <div className="p-2 rounded-lg bg-blue-500 bg-opacity-10"><Settings2 size={16} /></div>
                        Custos Fixos Mensais
                        <span className="normal-case font-semibold text-[10px] opacity-70 ml-2 tracking-normal">(Despesas operacionais)</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 opacity-70">Equipe / Funcionários (R$)</label>
                          <input type="number" step="1" className="input-field h-10 text-base font-bold w-full bg-transparent border-none px-0" value={activeProj.employees ?? ''} onChange={e => updateActive({ employees: e.target.value })} placeholder="0" />
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 opacity-70">Ferramentas (R$)</label>
                          <input type="number" step="1" className="input-field h-10 text-base font-bold w-full bg-transparent border-none px-0" value={activeProj.tools ?? ''} onChange={e => updateActive({ tools: e.target.value })} placeholder="0" />
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 opacity-70">Software / APIs (R$)</label>
                          <input type="number" step="1" className="input-field h-10 text-base font-bold w-full bg-transparent border-none px-0" value={activeProj.software ?? ''} onChange={e => updateActive({ software: e.target.value })} placeholder="0" />
                        </div>
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border" style={{ borderColor: 'rgba(59, 130, 246, 0.1)' }}>
                          <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 opacity-70">Outras Despesas (R$)</label>
                          <input type="number" step="1" className="input-field h-10 text-base font-bold w-full bg-transparent border-none px-0" value={activeProj.monthlyExpenses ?? ''} onChange={e => updateActive({ monthlyExpenses: e.target.value })} placeholder="0" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Right Col: Smart Results (STICKY EXECUTIVE DASHBOARD) */}
              {activeProduct && (
                <div className="w-full xl:w-[380px] flex-shrink-0 sticky top-6 z-20">
                  <div className="p-6 lg:p-8 rounded-2xl border flex flex-col gap-6 shadow-2xl transition-all duration-500 overflow-hidden relative" 
                    style={{ background: 'linear-gradient(145deg, var(--surface) 0%, var(--bg-primary) 100%)', borderColor: statusColor }}>
                    
                    {/* Status Glow */}
                    <div className="absolute top-0 left-0 right-0 h-1 opacity-50" style={{ background: statusColor }}></div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
                        <BarChart2 size={14} style={{ color: statusColor }} /> RESULTADO
                      </div>
                      <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border" style={{ color: statusColor, borderColor: statusColor, background: `${statusColor}10` }}>
                        {statusText}
                      </div>
                    </div>

                    {/* 1. LUCRO LÍQUIDO (Huge Emphasis) */}
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Lucro Líquido Estimado</p>
                      <p className="font-black leading-none tracking-tighter" style={{ color: netProfit >= 0 ? '#10B981' : '#EF4444', fontSize: 'clamp(2rem, 3vw, 2.75rem)', wordBreak: 'break-word' }}>
                        {formatCurrency(netProfit)}
                      </p>
                    </div>

                    {/* 2. FATURAMENTO (Secondary Emphasis) */}
                    <div className="pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Faturamento Bruto</p>
                      <p className="font-bold tracking-tight" style={{ color: '#3B82F6', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', wordBreak: 'break-word' }}>
                        {formatCurrency(revenue)}
                      </p>
                    </div>

                    {/* 3. METRICS GRID */}
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Vendas</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{sales.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Margem</p>
                        <p className="text-2xl font-bold" style={{ color: margin >= 0 ? '#10B981' : '#EF4444' }}>{margin.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>ROAS Est.</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{roas.toFixed(2)}x</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Break-even CPA</p>
                        <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }} title={formatCurrency(maxCpa)}>{formatCurrency(maxCpa)}</p>
                      </div>
                    </div>

                    {/* Cost Breakdown Summary */}
                    <div className="pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      
                      {/* Custos Variáveis */}
                      <div className="mb-4">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Custos Variáveis</p>
                        <div className="space-y-1.5 mb-2">
                          {varTaxes > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Percent size={10} className="opacity-50" /> Impostos</span> <span className="text-red-400">-{formatCurrency(varTaxes)}</span></div>}
                          {varGateway > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><CreditCard size={10} className="opacity-50" /> Gateway</span> <span className="text-red-400">-{formatCurrency(varGateway)}</span></div>}
                          {varTraffic > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Target size={10} className="opacity-50" /> Tráfego / CPA</span> <span className="text-red-400">-{formatCurrency(varTraffic)}</span></div>}
                          {varCommissions > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Users size={10} className="opacity-50" /> Comissões</span> <span className="text-red-400">-{formatCurrency(varCommissions)}</span></div>}
                          {varOtherPerc > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Activity size={10} className="opacity-50" /> Outras Taxas</span> <span className="text-red-400">-{formatCurrency(varOtherPerc)}</span></div>}
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                          <span className="text-red-400">-{formatCurrency(totalVariableCosts)}</span>
                        </div>
                      </div>

                      {/* Custos Fixos */}
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2" style={{ color: 'var(--text-muted)' }}>Custos Fixos</p>
                        <div className="space-y-1.5 mb-2">
                          {fixedEmployees > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Users size={10} className="opacity-50" /> Funcionários</span> <span className="text-blue-400">-{formatCurrency(fixedEmployees)}</span></div>}
                          {fixedTools > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Settings2 size={10} className="opacity-50" /> Ferramentas</span> <span className="text-blue-400">-{formatCurrency(fixedTools)}</span></div>}
                          {fixedSoftware > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><Code size={10} className="opacity-50" /> Softwares</span> <span className="text-blue-400">-{formatCurrency(fixedSoftware)}</span></div>}
                          {fixedOther > 0 && <div className="flex justify-between items-center text-xs opacity-80"><span className="flex items-center gap-1.5"><FileText size={10} className="opacity-50" /> Outros</span> <span className="text-blue-400">-{formatCurrency(fixedOther)}</span></div>}
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                          <span className="text-blue-400">-{formatCurrency(totalFixedCosts)}</span>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function ProdutosPage() {
  const [activeTab, setActiveTab] = useState('produtos');

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 flex-shrink-0 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Produtos & Negócios</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Organize seu portfólio e projete cenários de escala</p>
        </div>
        
        <div className="flex bg-[var(--surface)] p-1 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={() => setActiveTab('produtos')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'produtos' ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
            <Package size={14} /> Produtos
          </button>
          <button onClick={() => setActiveTab('projeções')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'projeções' ? 'bg-[var(--surface-hover)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
            <BarChart2 size={14} /> Projeções
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[var(--bg-primary)]">
        {activeTab === 'produtos' ? <ProductsTab /> : <ProjectionsTab />}
      </div>
    </div>
  );
}
