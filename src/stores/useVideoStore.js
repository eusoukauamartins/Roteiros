import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

/**
 * PIPELINE OPERACIONAL: apenas 4 estágios ativos.
 * Vídeos postados são arquivados (campo `archived: true`) e ficam fora do fluxo,
 * acessíveis pela página dedicada de Postados.
 */
export const FLOW_COLUMNS = [
  { id: 'creating', title: 'Em criação', emoji: '✏️' },
  { id: 'ready-to-record', title: 'Pronto p/ gravar', emoji: '🎯' },
  { id: 'recorded', title: 'Gravado', emoji: '🎬' },
  { id: 'editing', title: 'Em edição', emoji: '🎞️' },
  { id: 'programmed', title: 'Programado', emoji: '📅' },
];

// Status válidos no sistema (inclui postados/ideias para retrocompatibilidade)
export const ALL_VALID_STATUSES = ['creating', 'ready-to-record', 'recorded', 'editing', 'programmed', 'posted', 'ideas'];

// Performance qualitativa de um vídeo postado (preenchida manualmente após análise)
export const PERFORMANCE_LEVELS = [
  { id: '', label: 'Não avaliado', color: 'var(--text-muted)' },
  { id: 'flop', label: 'Não rendeu', color: '#EF4444' },
  { id: 'medium', label: 'Médio', color: '#F59E0B' },
  { id: 'viral', label: 'Viralizou', color: '#10B981' },
];

/**
 * Migra cards antigos para o novo schema:
 *  - status 'ideas' (legado) → 'creating'
 *  - status 'posted' → arquivado (archived: true, status mantido como 'posted')
 *  - garante presença dos novos campos
 */
function migrateCard(c) {
  const next = { ...c };
  // Status legado 'ideas' vira 'creating'
  if (next.status === 'ideas') next.status = 'creating';
  // Postado: arquiva mas mantém o status para histórico
  if (next.status === 'posted' && !next.archived) {
    next.archived = true;
    next.postedAt = next.postedAt || next.updatedAt || getNowInSaoPauloISO();
  }
  // Campos novos com defaults seguros
  if (next.archived === undefined) next.archived = false;
  if (!Array.isArray(next.basedOnBenchmarkIds)) next.basedOnBenchmarkIds = [];
  if (!Array.isArray(next.structureTags)) next.structureTags = [];
  if (next.productId === undefined) next.productId = null;
  if (next.cta === undefined) next.cta = '';
  if (next.performance === undefined) next.performance = '';
  if (next.performanceNotes === undefined) next.performanceNotes = '';
  return next;
}

const useVideoStore = create(
  persist(
    (set, get) => ({
      cards: [],
      trash: [],

      addCard: (cardData) => {
        const status = cardData.status || 'creating';
        const card = {
          id: nanoid(),
          headline: cardData.headline || '',
          script: cardData.script || '',
          cta: cardData.cta || '',
          niche: cardData.niche || '',
          status: ['ideas'].includes(status) ? 'creating' : status, // não aceita mais 'ideas'
          archived: false,
          images: cardData.images || [],
          music: cardData.music || [],
          productionLinks: cardData.productionLinks || [],
          externalLink: cardData.externalLink || '',
          recordedFilesLink: cardData.recordedFilesLink || '',
          notes: cardData.notes || '',
          tags: cardData.tags || [],
          structureTags: cardData.structureTags || [],
          basedOnBenchmarkIds: cardData.basedOnBenchmarkIds || [],
          productId: cardData.productId || null,
          performance: cardData.performance || '',
          performanceNotes: cardData.performanceNotes || '',
          postedAt: cardData.postedAt || null,
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
          plannedDate: cardData.plannedDate || null,
          plannedTime: cardData.plannedTime || null,
          order: get().cards.filter(c => c.status === status && !c.archived).length,
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

      // Soft delete — move to trash instead of destroying
      deleteCard: (id) => {
        const card = get().cards.find((c) => c.id === id);
        if (!card) return;
        const trashedCard = { ...card, deletedAt: getNowInSaoPauloISO() };
        set({
          cards: get().cards.filter((c) => c.id !== id),
          trash: [...(get().trash || []), trashedCard],
        });
      },

      restoreCard: (id) => {
        const card = (get().trash || []).find((c) => c.id === id);
        if (!card) return;
        const { deletedAt, ...restoredCard } = card;
        set({
          trash: get().trash.filter((c) => c.id !== id),
          cards: [...get().cards, { ...restoredCard, updatedAt: getNowInSaoPauloISO() }],
        });
      },

      permanentlyDeleteCard: (id) => {
        set({ trash: (get().trash || []).filter((c) => c.id !== id) });
      },

      emptyTrash: () => {
        set({ trash: [] });
      },

      duplicateCard: (id) => {
        const original = get().cards.find((c) => c.id === id);
        if (!original) return;
        const dup = {
          ...original,
          id: nanoid(),
          headline: `${original.headline} (cópia)`,
          archived: false,
          postedAt: null,
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
        if (idx >= 0 && idx < colIds.length - 1) {
          get().moveCard(id, colIds[idx + 1]);
        }
      },

      // Marca como postado: arquiva e tira do fluxo ativo
      markAsPosted: (id) => {
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: 'posted',
                  archived: true,
                  postedAt: getNowInSaoPauloISO(),
                  updatedAt: getNowInSaoPauloISO(),
                }
              : c
          ),
        });
      },

      // Desarquiva: traz de volta ao fluxo no status escolhido (default: editing)
      unarchiveCard: (id, backTo = 'editing') => {
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? { ...c, archived: false, status: backTo, postedAt: null, updatedAt: getNowInSaoPauloISO() }
              : c
          ),
        });
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

        if (overId !== overStatus) {
          const overIdx = cards.findIndex((c) => c.id === overId);
          if (overIdx !== -1 && activeIdx !== overIdx) {
            const [moved] = cards.splice(activeIdx, 1);
            const newOverIdx = cards.findIndex((c) => c.id === overId);
            cards.splice(newOverIdx, 0, moved);
          }
        }

        set({ cards });
      },

      getCardsByStatus: (status) => {
        return get().cards.filter((c) => c.status === status && !c.archived);
      },

      // Apenas vídeos ativos (não-arquivados)
      getActiveCards: () => get().cards.filter(c => !c.archived),

      // Apenas postados (arquivados)
      getArchivedCards: () => get().cards.filter(c => c.archived),

      importCards: (newCards) => {
        // Aplica migração no import também (caso o JSON tenha dados antigos)
        const migrated = (newCards || []).map(migrateCard);
        set({ cards: migrated });
      },
    }),
    {
      name: 'otimizador-flow',
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;
        // Aplica migração em todos os cards persistidos
        if (Array.isArray(persistedState.cards)) {
          persistedState.cards = persistedState.cards.map(migrateCard);
        }
        if (!Array.isArray(persistedState.trash)) {
          persistedState.trash = [];
        }
        return persistedState;
      },
    }
  )
);

export default useVideoStore;
