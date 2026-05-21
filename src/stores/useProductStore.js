import { getNowInSaoPauloISO } from '../utils/dateUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      projections: [],

      // ===== PRODUCTS =====
      addProduct: (data) => {
        const product = {
          id: nanoid(),
          name: data?.name || '',
          shortDescription: data?.shortDescription || '',
          ticketType: data?.ticketType || 'Medium Ticket',
          price: data?.price || 0,
          comparePrice: data?.comparePrice || 0,
          notes: data?.notes || '',
          cta: data?.cta || '',
          links: data?.links || [],
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ products: [...get().products, product] });
        return product;
      },
      updateProduct: (id, updates) => {
        set({
          products: get().products.map(p => p.id === id ? { ...p, ...updates, updatedAt: getNowInSaoPauloISO() } : p)
        });
      },
      deleteProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) });
      },

      // ===== PROJECTIONS =====
      addProjection: (data) => {
        const proj = {
          id: nanoid(),
          productId: data?.productId || null,
          name: data?.name || 'Nova Projeção',
          views: data?.views || 1000,
          conversionRate: data?.conversionRate || 1.5,
          // Fixed Costs
          employees: data?.employees || 0,
          tools: data?.tools || 0,
          software: data?.software || 0,
          monthlyExpenses: data?.monthlyExpenses || 0,
          // Variable Costs
          taxes: data?.taxes || 0,
          checkoutFees: data?.checkoutFees || 0,
          cpa: data?.cpa || 0,
          commissions: data?.commissions || 0,
          percentageCosts: data?.percentageCosts || 0,
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ projections: [...get().projections, proj] });
        return proj;
      },
      updateProjection: (id, updates) => {
        set({
          projections: get().projections.map(p => p.id === id ? { ...p, ...updates, updatedAt: getNowInSaoPauloISO() } : p)
        });
      },
      deleteProjection: (id) => {
        set({ projections: get().projections.filter(p => p.id !== id) });
      },
      duplicateProjection: (id) => {
        const orig = get().projections.find(p => p.id === id);
        if (!orig) return;
        const dup = {
          ...orig,
          id: nanoid(),
          name: `${orig.name} (cópia)`,
          createdAt: getNowInSaoPauloISO(),
          updatedAt: getNowInSaoPauloISO(),
        };
        set({ projections: [...get().projections, dup] });
        return dup;
      },

      // ===== IMPORT (necessário para backup/restore) =====
      importProducts: (newProducts) => {
        const safe = (newProducts || []).map(p => ({
          id: p.id || nanoid(),
          name: p.name || '',
          shortDescription: p.shortDescription || '',
          ticketType: p.ticketType || 'Medium Ticket',
          price: Number(p.price) || 0,
          comparePrice: Number(p.comparePrice) || 0,
          notes: p.notes || '',
          cta: p.cta || '',
          links: Array.isArray(p.links) ? p.links : [],
          createdAt: p.createdAt || getNowInSaoPauloISO(),
          updatedAt: p.updatedAt || getNowInSaoPauloISO(),
        }));
        set({ products: safe });
      },
      importProjections: (newProjections) => {
        const safe = (newProjections || []).map(p => ({
          id: p.id || nanoid(),
          productId: p.productId || null,
          name: p.name || 'Projeção sem nome',
          views: Number(p.views) || 0,
          conversionRate: Number(p.conversionRate) || 0,
          employees: Number(p.employees) || 0,
          tools: Number(p.tools) || 0,
          software: Number(p.software) || 0,
          monthlyExpenses: Number(p.monthlyExpenses) || 0,
          taxes: Number(p.taxes) || 0,
          checkoutFees: Number(p.checkoutFees) || 0,
          cpa: Number(p.cpa) || 0,
          commissions: Number(p.commissions) || 0,
          percentageCosts: Number(p.percentageCosts) || 0,
          createdAt: p.createdAt || getNowInSaoPauloISO(),
          updatedAt: p.updatedAt || getNowInSaoPauloISO(),
        }));
        set({ projections: safe });
      }
    }),
    { name: 'roteiros-products' }
  )
);

export default useProductStore;
