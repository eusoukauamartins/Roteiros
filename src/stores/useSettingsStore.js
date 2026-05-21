import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyPalette, defaultPalette, defaultTheme } from '../themes/palettes';

const useSettingsStore = create(
  persist(
    (set, get) => ({
      palette: defaultPalette,
      theme: defaultTheme,
      sidebarCollapsed: false,

      // ===== VOZ DO CRIADOR =====
      // Descrição do estilo, tom, palavras preferidas/evitadas — usado em export pra IA.
      creatorVoice: {
        name: '',
        bio: '',         // quem sou, pra quem falo
        style: '',       // tom, ritmo, energia
        wordsToUse: '',  // palavras / expressões que uso muito
        wordsToAvoid: '',// palavras / expressões a evitar
        examples: '',    // 1-3 exemplos curtos de trechos do meu estilo
      },
      setCreatorVoice: (updates) => set(s => ({ creatorVoice: { ...s.creatorVoice, ...updates } })),

      setPalette: (palette) => {
        set({ palette });
        applyPalette(palette, get().theme);
      },
      setTheme: (theme) => {
        set({ theme });
        applyPalette(get().palette, theme);
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        applyPalette(get().palette, newTheme);
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      initTheme: () => {
        applyPalette(get().palette, get().theme);
      },
    }),
    {
      name: 'otimizador-settings',
      version: 2,
      migrate: (persisted, v) => {
        if (!persisted) return persisted;
        if (!persisted.creatorVoice) {
          persisted.creatorVoice = { name: '', bio: '', style: '', wordsToUse: '', wordsToAvoid: '', examples: '' };
        }
        return persisted;
      },
    }
  )
);

export default useSettingsStore;
