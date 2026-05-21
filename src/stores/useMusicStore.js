import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const useMusicStore = create(
  persist(
    (set, get) => ({
      musics: [],

      addMusic: (data) => {
        const music = {
          id: nanoid(),
          name: data.name || '',
          link: data.link || '',
          niche: data.niche || '',
          tags: data.tags || [],
          notes: data.notes || '',
          createdAt: getNowInSaoPauloISO(),
        };
        set({ musics: [...get().musics, music] });
        return music;
      },

      updateMusic: (id, updates) => {
        set({
          musics: get().musics.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        });
      },

      deleteMusic: (id) => {
        set({ musics: get().musics.filter((m) => m.id !== id) });
      },

      importMusics: (newMusics) => {
        set({ musics: newMusics });
      },
    }),
    { name: 'otimizador-musics' }
  )
);

export default useMusicStore;
