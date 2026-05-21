import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Sistema de toast global.
 * Uso em qualquer componente:
 *   import { toast } from '../components/shared/Toast';
 *   toast.success('Adicionado ao fluxo');
 *   toast.info('Mensagem informativa');
 *   toast.error('Algo deu errado');
 *
 * E inclua <ToastContainer /> uma vez no App.jsx.
 */
const useToastStore = create((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = Date.now() + Math.random();
    const t = { id, type: 'info', duration: 3000, ...toast };
    set({ toasts: [...get().toasts, t] });
    if (t.duration > 0) {
      setTimeout(() => {
        set({ toasts: get().toasts.filter(x => x.id !== id) });
      }, t.duration);
    }
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));

export const toast = {
  success: (message, opts = {}) => useToastStore.getState().push({ ...opts, type: 'success', message }),
  error: (message, opts = {}) => useToastStore.getState().push({ ...opts, type: 'error', message }),
  info: (message, opts = {}) => useToastStore.getState().push({ ...opts, type: 'info', message }),
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};
const COLORS = {
  success: '#10B981',
  error: '#EF4444',
  info: 'var(--accent-light)',
};

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);
  const dismiss = useToastStore(s => s.dismiss);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[1000] pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.type] || Info;
        const color = COLORS[t.type] || COLORS.info;
        return (
          <div
            key={t.id}
            className="glass-strong rounded-xl px-4 py-3 flex items-center gap-3 min-w-[260px] max-w-md pointer-events-auto animate-fade-in"
            style={{
              borderLeft: `3px solid ${color}`,
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <Icon size={18} style={{ color, flexShrink: 0 }} />
            <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
              {t.message}
            </p>
            {t.action && (
              <button
                onClick={() => { t.action.onClick(); dismiss(t.id); }}
                className="text-xs font-semibold px-2 py-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                style={{ color }}
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
