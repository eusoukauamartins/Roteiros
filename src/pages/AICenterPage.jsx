import { Bot, Zap, FileText, Type, Eye, BarChart3, Lightbulb, Send, Webhook, Settings, Lock } from 'lucide-react';

const aiTools = [
  { icon: Type, label: 'Gerar headline', desc: 'Crie headlines virais com IA', color: '#F59E0B' },
  { icon: Zap, label: 'Melhorar headline', desc: 'Otimize suas headlines existentes', color: '#8B5CF6' },
  { icon: FileText, label: 'Criar roteiro', desc: 'Gere roteiros completos automaticamente', color: '#3B82F6' },
  { icon: Eye, label: 'Revisar humanização', desc: 'Verifique se o texto parece natural', color: '#EC4899' },
  { icon: BarChart3, label: 'Analisar conteúdos do dia', desc: 'Resumo inteligente da produção', color: '#10B981' },
  { icon: Lightbulb, label: 'Sugerir próximos vídeos', desc: 'Recomendações baseadas no seu nicho', color: '#F97316' },
  { icon: Send, label: 'Enviar seleção para IA', desc: 'Envie dados selecionados para processamento', color: '#6366F1' },
];

const integrations = [
  { name: 'OpenAI', desc: 'GPT-4, GPT-4o', status: 'Em breve' },
  { name: 'Claude (Anthropic)', desc: 'Claude 3.5 Sonnet', status: 'Em breve' },
  { name: 'n8n Webhook', desc: 'Automação via webhook', status: 'Em breve' },
  { name: 'Webhook Customizado', desc: 'Conecte qualquer API', status: 'Em breve' },
];

export default function AICenterPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-4">
        <h1 className="text-xl font-bold gradient-text">Central de IA</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Ferramentas de inteligência artificial para potencializar sua criação
        </p>
      </div>

      {/* Status Banner */}
      <div className="px-6 mb-6">
        <div className="glass-card p-4 flex items-center gap-4"
          style={{ borderColor: 'var(--accent)', boxShadow: '0 0 30px var(--glow)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
            <Bot size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Integrações de IA em preparação
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              As ferramentas abaixo serão ativadas quando você conectar uma API ou webhook.
              A estrutura já está pronta para futura integração com OpenAI, Claude e n8n.
            </p>
          </div>
          <Lock size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* AI Tools Grid */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
          Ferramentas de IA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiTools.map((tool, i) => (
            <button
              key={i}
              className="glass-card p-4 text-left opacity-70 cursor-not-allowed group"
              disabled
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${tool.color}15`, color: tool.color }}>
                  <tool.icon size={18} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {tool.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {tool.desc}
              </p>
              <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                Em breve
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Webhook Config (Future) */}
      <div className="px-6 mb-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
          Configuração de Webhook / API
        </h2>
        <div className="glass-card p-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                URL do Webhook (n8n, Make, etc.)
              </label>
              <input className="input-field" placeholder="https://seu-webhook.n8n.io/..." disabled />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                API Key (OpenAI / Claude)
              </label>
              <input className="input-field" type="password" placeholder="sk-..." disabled />
            </div>
            <button className="btn-accent opacity-50 cursor-not-allowed" disabled>
              Salvar Configuração (em breve)
            </button>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="px-6 pb-6">
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
          Integrações Planejadas
        </h2>
        <div className="space-y-2">
          {integrations.map((int, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <Webhook size={18} style={{ color: 'var(--accent)' }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{int.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{int.desc}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                {int.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
