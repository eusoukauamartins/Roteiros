import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const useImageStore = create(
  persist(
    (set, get) => ({
      images: [],

      addImage: (data) => {
        const image = {
          id: nanoid(),
          title: data.title || '',
          niche: data.niche || '',
          tags: data.tags || [],
          link: data.link || '',
          description: data.description || '',
          notes: data.notes || '',
          createdAt: getNowInSaoPauloISO(),
        };
        set({ images: [...get().images, image] });
        return image;
      },

      updateImage: (id, updates) => {
        set({
          images: get().images.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        });
      },

      deleteImage: (id) => {
        set({ images: get().images.filter((i) => i.id !== id) });
      },

      importImages: (newImages) => {
        set({ images: newImages });
      },
    }),
    { name: 'otimizador-images' }
  )
);

export default useImageStore;
