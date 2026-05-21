import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const useBenchmarkStore = create(
  persist(
    (set, get) => ({
      benchmarks: [],

      addBenchmark: (data) => {
        const benchmark = {
          id: nanoid(),
          headline: data?.headline || '',
          script: data?.script || '',
          realDuration: data?.realDuration || 0,
          ctaType: data?.ctaType || '',
          ctaText: data?.ctaText || '',
          creator: data?.creator || '',
          niche: data?.niche || '',
          tags: data?.tags || [],
          structureTags: data?.structureTags || [],
          videoUrl: data?.videoUrl || '',
          sourceUrl: data?.sourceUrl || '',
          musicRefs: data?.musicRefs || [],
          visualRefs: data?.visualRefs || [],
          observations: data?.observations || '',
          deletedAt: null,
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ benchmarks: [...get().benchmarks, benchmark] });
        return benchmark;
      },

      updateBenchmark: (id, updates) => {
        set({
          benchmarks: get().benchmarks.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: getNowInSaoPauloISO() } : b
          ),
        });
      },

      deleteBenchmark: (id) => {
        set({
          benchmarks: get().benchmarks.map((b) =>
            b.id === id ? { ...b, deletedAt: getNowInSaoPauloISO(), updatedAt: getNowInSaoPauloISO() } : b
          ),
        });
      },

      restoreBenchmark: (id) => {
        set({
          benchmarks: get().benchmarks.map((b) =>
            b.id === id ? { ...b, deletedAt: null, updatedAt: getNowInSaoPauloISO() } : b
          ),
        });
      },

      permanentlyDeleteBenchmark: (id) => {
        set({ benchmarks: get().benchmarks.filter((b) => b.id !== id) });
      },

      duplicateBenchmark: (id) => {
        const orig = get().benchmarks.find((b) => b.id === id);
        if (!orig) return;
        const dup = {
          ...orig,
          id: nanoid(),
          headline: `${orig.headline} (Cópia)`,
          deletedAt: null,
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ benchmarks: [...get().benchmarks, dup] });
        return dup;
      },

      // Necessário para import/export
      importBenchmarks: (newBenchmarks) => {
        // Garante shape mínimo em dados antigos
        const safe = (newBenchmarks || []).map(b => ({
          id: b.id || nanoid(),
          headline: b.headline || '',
          script: b.script || '',
          realDuration: b.realDuration || 0,
          ctaType: b.ctaType || '',
          ctaText: b.ctaText || '',
          creator: b.creator || '',
          niche: b.niche || '',
          tags: Array.isArray(b.tags) ? b.tags : [],
          structureTags: Array.isArray(b.structureTags) ? b.structureTags : [],
          videoUrl: b.videoUrl || '',
          sourceUrl: b.sourceUrl || '',
          musicRefs: Array.isArray(b.musicRefs) ? b.musicRefs : [],
          visualRefs: Array.isArray(b.visualRefs) ? b.visualRefs : [],
          observations: b.observations || '',
          deletedAt: b.deletedAt || null,
          createdAt: b.createdAt || getNowInSaoPauloISO(),
          updatedAt: b.updatedAt || getNowInSaoPauloISO(),
        }));
        set({ benchmarks: safe });
      },
    }),
    { name: 'roteiros-benchmarks' }
  )
);

export default useBenchmarkStore;
