import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, Type, FileText,
  Archive, Music, CheckSquare, Bot, Settings,
  ChevronLeft, ChevronRight, Video, Package, Telescope, CheckCircle2, BookOpen
} from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';

/* Organic quill feather — elegant, recognizable silhouette of a bird feather.
   Beautifully curves from top-right to bottom-left, with classic quill separations. */
function QuillLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main feather silhouette */}
      <path d="M20.89 3.11C20.89 3.11 16.63 2.37 11.08 6.94C5.53 11.51 3.86 18.59 3.86 18.59C3.86 18.59 5.94 17.9 8.1 15.89C6.46 18.23 4.28 19.8 1.48 20C3.76 20.88 6.44 20.5 8.35 18.58C8.92 19.74 10 20.5 11.33 20.68C14 21 16.37 18.3 17.65 15C19.28 11.1 20.89 3.11 20.89 3.11Z" fill="url(#ql)"/>
      {/* Delicate center spine */}
      <path d="M20.89 3.11C18.5 7.5 14 12.5 8.35 18.58" stroke="white" strokeWidth="0.75" strokeOpacity="0.3" strokeLinecap="round"/>
      <defs>
        <linearGradient id="ql" x1="3" y1="3" x2="19" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--gradient-start, #818CF8)"/>
          <stop offset="1" stopColor="var(--gradient-end, #A78BFA)"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

const navGroups = [
  {
    label: '',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/videos', label: 'Vídeos', icon: Video },
      { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
    ],
  },
  {
    label: 'Criação',
    items: [
      { path: '/headlines', label: 'Headlines', icon: Type },
      { path: '/scripts', label: 'Roteiros', icon: FileText },
      { path: '/acervo', label: 'Acervo', icon: Archive },
      { path: '/music', label: 'Músicas', icon: Music },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { path: '/benchmark', label: 'Benchmark', icon: Telescope },
      { path: '/learnings', label: 'Aprendizados', icon: BookOpen },
    ],
  },
  {
    label: 'Negócios',
    items: [
      { path: '/produtos', label: 'Produtos', icon: Package },
    ],
  },
  {
    label: 'Organização',
    items: [
      { path: '/ai', label: 'Central de IA', icon: Bot },
    ],
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();

  return (
    <aside
      className={`h-full flex flex-col border-r transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Header: Logo (no container) + app name + collapse */}
      <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'} pt-6 pb-5`}>
        <div className="flex items-center gap-2">
          <QuillLogo size={sidebarCollapsed ? 24 : 28} />
          {!sidebarCollapsed && (
            <span className="text-[17px] font-bold gradient-text tracking-tight">Roteiros</span>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg transition-all hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
            title="Recolher"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {sidebarCollapsed && (
        <div className="px-3 pb-2 flex justify-center">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg transition-all hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
            title="Expandir"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto pb-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-4">
            {!sidebarCollapsed && group.label && (
              <div className="sidebar-section-label">{group.label}</div>
            )}
            {sidebarCollapsed && gi > 0 && (
              <div className="mx-3 my-2 border-t" style={{ borderColor: 'var(--border-color)', opacity: 0.5 }} />
            )}
            <div className={`px-3 space-y-0.5 ${sidebarCollapsed ? 'py-1' : ''}`}>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-3' : ''} ${gi === 0 && !sidebarCollapsed ? 'py-[11px]' : ''}`
                  }
                  title={item.label}
                >
                  <item.icon size={19} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Settings anchored */}
      <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''} ${sidebarCollapsed ? 'justify-center px-3' : ''}`
          }
          title="Configurações"
        >
          <Settings size={19} className="flex-shrink-0" />
          {!sidebarCollapsed && <span>Configurações</span>}
        </NavLink>
      </div>
    </aside>
  );
}
