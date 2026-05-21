import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export const FLOW_COLUMNS = [
  { id: 'ideas', title: 'Ideias', emoji: '💡' },
  { id: 'creating', title: 'Em criação', emoji: '✏️' },
  { id: 'ready-to-record', title: 'Pronto p/ gravar', emoji: '🎯' },
  { id: 'recorded', title: 'Gravado', emoji: '🎬' },
  { id: 'editing', title: 'Em edição', emoji: '🎞️' },
  { id: 'posted', title: 'Postado', emoji: '✅' },
];

const useFlowStore = create(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (cardData) => {
        const card = {
          id: nanoid(),
          headline: cardData.headline || '',
          script: cardData.script || '',
          niche: cardData.niche || '',
          status: cardData.status || 'ideas',
          images: cardData.images || [],
          music: cardData.music || { name: '', link: '', notes: '' },
          externalLink: cardData.externalLink || '',
          recordedFilesLink: cardData.recordedFilesLink || '',
          notes: cardData.notes || '',
          tags: cardData.tags || [],
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
          plannedDate: cardData.plannedDate || null,
          order: get().cards.filter(c => c.status === (cardData.status || 'ideas')).length,
        };
        set({ cards: [...get().cards, card] });
        return card;
      },

      updateCard: (id, updates) => {
        set({
          cards: get().cards.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: getNowInSaoPauloISO() } : c
          ),
        });
      },

      deleteCard: (id) => {
        set({ cards: get().cards.filter((c) => c.id !== id) });
      },

      duplicateCard: (id) => {
        const original = get().cards.find((c) => c.id === id);
        if (!original) return;
        const dup = {
          ...original,
          id: nanoid(),
          headline: `${original.headline} (cópia)`,
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ cards: [...get().cards, dup] });
        return dup;
      },

      moveCard: (id, newStatus) => {
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? { ...c, status: newStatus, updatedAt: getNowInSaoPauloISO() }
              : c
          ),
        });
      },

      moveToNext: (id) => {
        const card = get().cards.find((c) => c.id === id);
        if (!card) return;
        const colIds = FLOW_COLUMNS.map((c) => c.id);
        const idx = colIds.indexOf(card.status);
        if (idx < colIds.length - 1) {
          get().moveCard(id, colIds[idx + 1]);
        }
      },

      reorderCards: (activeId, overId, overStatus) => {
        const cards = [...get().cards];
        const activeIdx = cards.findIndex((c) => c.id === activeId);
        if (activeIdx === -1) return;
        cards[activeIdx] = {
          ...cards[activeIdx],
          status: overStatus,
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ cards });
      },

      getCardsByStatus: (status) => {
        return get().cards.filter((c) => c.status === status);
      },

      importCards: (newCards) => {
        set({ cards: newCards });
      },
    }),
    { name: 'otimizador-flow' }
  )
);

export default useFlowStore;
