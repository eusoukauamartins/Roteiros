import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import useSettingsStore from './stores/useSettingsStore';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import QuickCapture from './components/shared/QuickCapture';
import { ToastContainer } from './components/shared/Toast';
import DashboardPage from './pages/DashboardPage';
import VideosPage from './pages/VideosPage';
import FlowPage from './pages/FlowPage';
import HeadlinesPage from './pages/HeadlinesPage';
import ScriptsPage from './pages/ScriptsPage';
import AcervoPage from './pages/AcervoPage';
import MusicPage from './pages/MusicPage';
import TasksPage from './pages/TasksPage';
import AICenterPage from './pages/AICenterPage';
import SettingsPage from './pages/SettingsPage';
import ProdutosPage from './pages/ProdutosPage';
import BenchmarkPage from './pages/BenchmarkPage';
import PostadosPage from './pages/PostadosPage';
import LearningsPage from './pages/LearningsPage';

export default function App() {
  const initTheme = useSettingsStore((s) => s.initTheme);
  const [quickCapture, setQuickCapture] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Atalhos globais de teclado
  useEffect(() => {
    const handler = (e) => {
      // Não disparar atalhos se usuário está digitando em input/textarea/contenteditable
      const target = e.target;
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      // Ctrl/Cmd + N — nova ideia
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setQuickCapture(true);
        return;
      }
      // Ctrl/Cmd + K — busca global no topbar (foca o input se existir)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('header input[placeholder*="Buscar"]');
        if (searchInput) searchInput.focus();
        return;
      }
      // / — foca a primeira busca da página, se não estiver digitando em outro campo
      if (e.key === '/' && !isTyping) {
        const anySearch = document.querySelector('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
        if (anySearch) {
          e.preventDefault();
          anySearch.focus();
        }
        return;
      }
      // Esc — fecha QuickCapture
      if (e.key === 'Escape') {
        setQuickCapture(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <BrowserRouter>
      {/* Atmospheric Background */}
      <div className="atmospheric-container">
        <div className="atmospheric-glow-1"></div>
        <div className="atmospheric-glow-2"></div>
      </div>

      <div className="flex h-screen w-screen overflow-hidden relative z-10" style={{ background: 'transparent' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onQuickCapture={() => setQuickCapture(true)} />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/flow" element={<FlowPage />} />
              <Route path="/postados" element={<PostadosPage />} />
              <Route path="/headlines" element={<HeadlinesPage />} />
              <Route path="/scripts" element={<ScriptsPage />} />
              <Route path="/acervo" element={<AcervoPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/benchmark" element={<BenchmarkPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/ai" element={<AICenterPage />} />
              <Route path="/learnings" element={<LearningsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
      <QuickCapture isOpen={quickCapture} onClose={() => setQuickCapture(false)} />
      <ToastContainer />
    </BrowserRouter>
  );
}
