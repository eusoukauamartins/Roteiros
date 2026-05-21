import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultNiches = [
  'Saúde', 'Beleza', 'Moda', 'Relacionamento',
  'Dinheiro', 'Curiosidades', 'Espiritualidade', 'Outros'
];

const useNicheStore = create(
  persist(
    (set, get) => ({
      niches: defaultNiches,
      addNiche: (niche) => {
        const current = get().niches;
        if (!current.includes(niche)) {
          set({ niches: [...current, niche] });
        }
      },
      removeNiche: (niche) => {
        set({ niches: get().niches.filter((n) => n !== niche) });
      },
    }),
    { name: 'otimizador-niches' }
  )
);

export default useNicheStore;
