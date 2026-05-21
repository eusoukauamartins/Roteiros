import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

function toLocalISODate(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const useLearningStore = create(
  persist(
    (set, get) => ({
      learnings: [],

      createLearning: (data) => {
        const item = {
          id: nanoid(),
          content: data.content || '',
          source: data.source || '',
          tags: data.tags || [],
          isFavorite: data.isFavorite || false,
          date: data.date || toLocalISODate(new Date()),
          order: data.order ?? get().learnings.length,
          deletedAt: null,
          createdAt: getNowInSaoPauloISO(),
        };
        set({ learnings: [...get().learnings, item] });
        return item;
      },

      updateLearning: (id, updates) => {
        set({
          learnings: get().learnings.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        });
      },

      deleteLearning: (id) => {
        set({
          learnings: get().learnings.map((l) =>
            l.id === id ? { ...l, deletedAt: getNowInSaoPauloISO() } : l
          ),
        });
      },

      restoreLearning: (id) => {
        set({
          learnings: get().learnings.map((l) =>
            l.id === id ? { ...l, deletedAt: null } : l
          ),
        });
      },

      permanentlyDeleteLearning: (id) => {
        set({ learnings: get().learnings.filter((l) => l.id !== id) });
      },

      updateBatch: (updates) => {
        // updates = [{ id, changes: { ... } }]
        const learnings = [...get().learnings];
        updates.forEach(({ id, changes }) => {
          const idx = learnings.findIndex(l => l.id === id);
          if (idx !== -1) learnings[idx] = { ...learnings[idx], ...changes };
        });
        set({ learnings });
      },

      importLearnings: (newLearnings) => {
        set({ learnings: newLearnings });
      },
    }),
    { name: 'otimizador-learnings' }
  )
);

export default useLearningStore;
