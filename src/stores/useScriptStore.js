import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const useScriptStore = create(
  persist(
    (set, get) => ({
      scripts: [],

      addScript: (data) => {
        const script = {
          id: nanoid(),
          title: data.title || '',
          text: data.text || '',
          niche: data.niche || '',
          tags: data.tags || [],
          notes: data.notes || '',
          favorite: false,
          createdAt: getNowInSaoPauloISO(),
        };
        set({ scripts: [...get().scripts, script] });
        return script;
      },

      updateScript: (id, updates) => {
        set({
          scripts: get().scripts.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        });
      },

      deleteScript: (id) => {
        set({ scripts: get().scripts.filter((s) => s.id !== id) });
      },

      toggleFavorite: (id) => {
        set({
          scripts: get().scripts.map((s) =>
            s.id === id ? { ...s, favorite: !s.favorite } : s
          ),
        });
      },

      importScripts: (newScripts) => {
        set({ scripts: newScripts });
      },
    }),
    { name: 'otimizador-scripts' }
  )
);

export default useScriptStore;
