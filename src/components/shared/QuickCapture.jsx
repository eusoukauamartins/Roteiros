import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import useVideoStore from '../../stores/useVideoStore';
import useNicheStore from '../../stores/useNicheStore';
import { toast } from './Toast';

export default function QuickCapture({ isOpen, onClose }) {
  const addCard = useVideoStore((s) => s.addCard);
  const niches = useNicheStore((s) => s.niches);
  const navigate = useNavigate();
  const [headline, setHeadline] = useState('');
  const [niche, setNiche] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!headline.trim()) return;
    const card = addCard({ headline: headline.trim(), niche, notes, status: 'creating' });
    setHeadline('');
    setNiche('');
    setNotes('');
    onClose();
    toast.success('Ideia capturada em "Em criação"', {
      action: { label: 'Abrir', onClick: () => navigate(`/videos?id=${card.id}`) },
    });
  };

  return (
    <div className="overlay animate-fade-in" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl p-6 z-50 animate-scale-in glass-strong"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
              }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nova Ideia
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.target.style.background = 'var(--surface-hover)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Headline / Hook
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: 3 coisas que ninguém te conta sobre..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Nicho
            </label>
            <select
              className="input-field"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            >
              <option value="">Selecionar nicho</option>
              {niches.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Observações (opcional)
            </label>
            <textarea
              className="textarea-field"
              style={{ minHeight: '70px' }}
              placeholder="Alguma anotação rápida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-accent flex-1 flex items-center justify-center gap-2">
              <Zap size={14} />
              Criar na coluna Ideias
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
