import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const useHeadlineStore = create(
  persist(
    (set, get) => ({
      headlines: [],

      addHeadline: (data) => {
        const headline = {
          id: nanoid(),
          text: data.text || '',
          niche: data.niche || '',
          tags: data.tags || [],
          notes: data.notes || '',
          favorite: false,
          createdAt: getNowInSaoPauloISO(),
        };
        set({ headlines: [...get().headlines, headline] });
        return headline;
      },

      updateHeadline: (id, updates) => {
        set({
          headlines: get().headlines.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        });
      },

      deleteHeadline: (id) => {
        set({ headlines: get().headlines.filter((h) => h.id !== id) });
      },

      toggleFavorite: (id) => {
        set({
          headlines: get().headlines.map((h) =>
            h.id === id ? { ...h, favorite: !h.favorite } : h
          ),
        });
      },

      importHeadlines: (newHeadlines) => {
        set({ headlines: newHeadlines });
      },
    }),
    { name: 'otimizador-headlines' }
  )
);

export default useHeadlineStore;
