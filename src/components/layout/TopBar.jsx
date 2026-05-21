import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Sun, Moon, X } from 'lucide-react';
import useSettingsStore from '../../stores/useSettingsStore';
import { globalSearch } from '../../utils/searchUtils';

const typeLabels = {
  video: 'Vídeo',
  posted: 'Postado',
  headline: 'Headline',
  script: 'Roteiro',
  acervo: 'Acervo',
  music: 'Música',
  task: 'Tarefa',
  benchmark: 'Benchmark',
  product: 'Produto',
};

const typeColors = {
  video: 'var(--accent)',
  posted: '#10B981',
  headline: '#F59E0B',
  script: '#8B5CF6',
  acervo: '#EC4899',
  music: '#10B981',
  task: '#3B82F6',
  benchmark: '#A78BFA',
  product: '#F97316',
};

export default function TopBar({ onQuickCapture }) {
  const { theme, toggleTheme } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Páginas onde a busca global faz sentido (ideação/pipeline). Em outras, apenas o cabeçalho fica visível.
  const searchAllowedPaths = ['/', '/videos', '/flow', '/headlines', '/scripts', '/benchmark'];
  const showSearchBar = searchAllowedPaths.includes(location.pathname);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = globalSearch(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (result) => {
    setSearchQuery('');
    setShowSearch(false);
    switch (result.type) {
      case 'video': navigate(`/videos?id=${result.item.id}`); break;
      case 'posted': navigate('/postados'); break;
      case 'headline': navigate('/headlines'); break;
      case 'script': navigate('/scripts'); break;
      case 'acervo': navigate('/acervo'); break;
      case 'music': navigate('/music'); break;
      case 'task': navigate('/tasks'); break;
      case 'benchmark': navigate('/benchmark'); break;
      case 'product': navigate('/produtos'); break;
      default: break;
    }
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Search (apenas em páginas de ideação/pipeline) */}
      {showSearchBar ? (
      <div className="relative flex-1 max-w-lg" ref={searchRef}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar em tudo... (headlines, roteiros, cards...)"
            className="input-field pl-10 pr-4 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && searchResults.length > 0 && (
          <div
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50 glass-strong max-h-80 overflow-y-auto animate-scale-in"
            style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.5)' }}
          >
            {searchResults.slice(0, 15).map((r, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.target.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                onClick={() => handleResultClick(r)}
              >
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: `${typeColors[r.type]}20`,
                    color: typeColors[r.type],
                  }}
                >
                  {typeLabels[r.type]}
                </span>
                <span className="text-sm truncate">{r.title}</span>
              </button>
            ))}
            {searchResults.length > 15 && (
              <div className="px-4 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                +{searchResults.length - 15} resultados
              </div>
            )}
          </div>
        )}

        {showSearch && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div
            className="absolute top-full mt-2 left-0 right-0 rounded-xl p-4 z-50 glass-strong animate-scale-in text-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Nenhum resultado encontrado
          </div>
        )}
      </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Actions (Only on Flow) */}
      {location.pathname === '/flow' && (
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={onQuickCapture}
            className="btn-accent flex items-center gap-2 text-sm h-9"
          >
            <Plus size={16} />
            <span>Nova Ideia</span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      )}
    </header>
  );
}
