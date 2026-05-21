import useVideoStore, { FLOW_COLUMNS } from '../stores/useVideoStore';
import useHeadlineStore from '../stores/useHeadlineStore';
import useScriptStore from '../stores/useScriptStore';
import useTaskStore from '../stores/useTaskStore';
import {
  Video, TrendingUp, FileText, Type, CheckSquare,
  Target, Scissors, Send, BarChart3, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, isAfter, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const allCards = useVideoStore(s => s.cards);
  const cards = allCards.filter(c => !c.archived); // Apenas cards ativos no pipeline
  const headlines = useHeadlineStore(s => s.headlines);
  const scripts = useScriptStore(s => s.scripts);
  const tasks = useTaskStore(s => s.tasks);
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(today);

  const createdToday = (items) => items.filter(i => i.createdAt && format(new Date(i.createdAt), 'yyyy-MM-dd') === todayStr).length;
  const createdThisMonth = (items) => items.filter(i => i.createdAt && isAfter(new Date(i.createdAt), monthStart)).length;

  // Production-focused stats
  const stats = [
    { label: 'Vídeos hoje', value: createdToday(cards), icon: Video, accent: true },
    { label: 'Headlines hoje', value: createdToday(headlines), icon: Type },
    { label: 'Roteiros hoje', value: createdToday(scripts), icon: FileText },
    { label: 'Prontos p/ gravar', value: cards.filter(c => c.status === 'ready-to-record').length, icon: Target },
    { label: 'Fila de edição', value: cards.filter(c => c.status === 'editing').length, icon: Scissors },
    { label: 'Produção do mês', value: createdThisMonth(cards), icon: TrendingUp },
  ];

  // Flow pipeline
  const flowStats = FLOW_COLUMNS.map(col => ({
    ...col,
    count: cards.filter(c => c.status === col.id).length,
  }));

  // Last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      day: format(date, 'EEE', { locale: ptBR }),
      vídeos: cards.filter(c => c.createdAt && format(new Date(c.createdAt), 'yyyy-MM-dd') === dateStr).length,
      headlines: headlines.filter(h => h.createdAt && format(new Date(h.createdAt), 'yyyy-MM-dd') === dateStr).length,
    };
  });

  // Recent videos (apenas ativos, mais recentes primeiro)
  const recentVideos = [...cards].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  // Última coisa que mexi (campo único, em destaque)
  const lastEdited = recentVideos[0] || null;

  // Pending tasks
  const pendingTasks = tasks.filter(t => t.status !== 'done').slice(0, 4);

  const openCard = (id) => navigate(`/videos?id=${id}`);

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Visão geral da sua produção de conteúdo
        </p>
      </div>

      {/* Continuar de onde parou */}
      {lastEdited && (
        <div className="px-6 mb-5">
          <div
            className="glass-card p-4 cursor-pointer transition-all hover:border-[var(--accent)] group flex items-center gap-4"
            onClick={() => openCard(lastEdited.id)}
            style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--accent)' }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
              <Send size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-light)' }}>
                Continuar de onde parou
              </p>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {lastEdited.headline || 'Vídeo sem headline'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Última edição em {format(new Date(lastEdited.updatedAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-light)' }}>
              Abrir →
            </span>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}
                style={{
                  background: s.accent
                    ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                    : 'var(--accent-surface)',
                }}>
                <s.icon size={16} style={{ color: s.accent ? 'white' : 'var(--accent-light)' }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="px-6 mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          Pipeline de Produção
        </h2>
        <div className="grid grid-cols-6 gap-2">
          {flowStats.map((col) => (
            <div key={col.id} className="stat-card text-center cursor-pointer" onClick={() => navigate('/flow')}>
              <p className="text-lg mb-0.5">{col.emoji}</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{col.count}</p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{col.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Recent Videos Row */}
      <div className="px-6 mb-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart (3 cols) */}
        <div className="lg:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Produção — Últimos 7 dias
          </h2>
          <div className="stat-card" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="vídeos" name="Vídeos" fill="var(--accent)" radius={[4,4,0,0]} />
                <Bar dataKey="headlines" name="Headlines" fill="var(--accent-light)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Videos (2 cols) */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
            Vídeos Recentes
          </h2>
          <div className="space-y-2">
            {recentVideos.map(v => {
              const status = FLOW_COLUMNS.find(c => c.id === v.status);
              return (
                <div key={v.id} className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-[var(--accent)] transition-all" onClick={() => openCard(v.id)}>
                  <span className="text-base flex-shrink-0">{status?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {v.headline || 'Sem headline'}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      {status?.title} · {format(new Date(v.updatedAt), 'dd/MM')}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentVideos.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>Nenhum vídeo ainda</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending tasks */}
      <div className="px-6 pb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
          Tarefas Pendentes
        </h2>
        <div className="space-y-2">
          {pendingTasks.map(t => (
            <div key={t.id} className="glass-card p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: t.priority === 'high' ? '#EF4444' : t.priority === 'medium' ? '#F59E0B' : '#10B981'
              }} />
              <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{t.title}</span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {t.date ? format(new Date(t.date + 'T12:00:00'), 'dd/MM') : ''}
              </span>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Nenhuma tarefa pendente</p>
          )}
        </div>
      </div>
    </div>
  );
}
