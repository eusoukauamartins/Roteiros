// =============================================
// OTIMIZADOR — SISTEMA DE PALETAS PREMIUM
// =============================================
// Visual philosophy:
// - Cinematic, atmospheric, premium
// - Rich dark surfaces with visible layer separation
// - Text always highly readable (off-white / warm grays)
// - Accents are elegant, never aggressive
// - Surfaces use visible luminance separation
// =============================================

// Neutral text — shared by ALL palettes
// Based on: #F5F7FA / #B6BDC9 / #7C8594 hierarchy
const NEUTRAL_TEXT_DARK = {
  '--text-primary': '#FFFFFF',       // pure white, maximum readability
  '--text-secondary': '#E2E8F0',     // light slate-200 — very bright secondary
  '--text-muted': '#A1A1AA',         // zinc-400 — much clearer muted text for labels/helpers
};

const NEUTRAL_TEXT_LIGHT = {
  '--text-primary': '#1A1A1F',
  '--text-secondary': '#4B5563',
  '--text-muted': '#6B7280',
};

export const palettes = {
  'midnight-purple': {
    name: 'Midnight Purple',
    dark: {
      '--bg-primary': '#0F0B1A', '--bg-secondary': '#1A1328',
      '--accent': '#8B5CF6', '--accent-light': '#A78BFA',
      '--accent-surface': 'rgba(139,92,246,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(139,92,246,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(139,92,246,0.20)',
      '--gradient-start': '#7C3AED', '--gradient-end': '#A78BFA',
    },
    light: {
      '--bg-primary': '#F8F7FF', '--bg-secondary': '#EEEAFF',
      '--accent': '#7C3AED', '--accent-light': '#8B5CF6',
      '--accent-surface': 'rgba(124,58,237,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(124,58,237,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(124,58,237,0.12)',
      '--gradient-start': '#7C3AED', '--gradient-end': '#A78BFA',
    },
  },

  'obsidian-gold': {
    name: 'Obsidian Gold',
    dark: {
      '--bg-primary': '#0D0B08', '--bg-secondary': '#1A1610',
      '--accent': '#D4A84B', '--accent-light': '#E8C56A',
      '--accent-surface': 'rgba(212,168,75,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(212,168,75,0.12)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(212,168,75,0.20)',
      '--gradient-start': '#B8942E', '--gradient-end': '#E8C56A',
    },
    light: {
      '--bg-primary': '#FFFCF5', '--bg-secondary': '#FFF8E8',
      '--accent': '#A6841F', '--accent-light': '#C9A033',
      '--accent-surface': 'rgba(201,160,51,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(201,160,51,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(201,160,51,0.15)',
      '--gradient-start': '#C9A033', '--gradient-end': '#E2BE5A',
    },
  },

  'deep-ocean': {
    name: 'Deep Ocean',
    dark: {
      '--bg-primary': '#0A101C', '--bg-secondary': '#141D30',
      '--accent': '#3B82F6', '--accent-light': '#60A5FA',
      '--accent-surface': 'rgba(59,130,246,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(59,130,246,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(59,130,246,0.20)',
      '--gradient-start': '#2563EB', '--gradient-end': '#60A5FA',
    },
    light: {
      '--bg-primary': '#F0F9FF', '--bg-secondary': '#E0F2FE',
      '--accent': '#2563EB', '--accent-light': '#3B82F6',
      '--accent-surface': 'rgba(37,99,235,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(37,99,235,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(37,99,235,0.12)',
      '--gradient-start': '#2563EB', '--gradient-end': '#60A5FA',
    },
  },

  'emerald-night': {
    name: 'Emerald Night',
    dark: {
      '--bg-primary': '#0A140F', '--bg-secondary': '#142420',
      '--accent': '#10B981', '--accent-light': '#34D399',
      '--accent-surface': 'rgba(16,185,129,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(16,185,129,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(16,185,129,0.20)',
      '--gradient-start': '#059669', '--gradient-end': '#34D399',
    },
    light: {
      '--bg-primary': '#F0FDF9', '--bg-secondary': '#ECFDF5',
      '--accent': '#059669', '--accent-light': '#10B981',
      '--accent-surface': 'rgba(16,185,129,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(16,185,129,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(16,185,129,0.12)',
      '--gradient-start': '#059669', '--gradient-end': '#34D399',
    },
  },

  'rose-neon': {
    name: 'Rose Velvet',
    dark: {
      '--bg-primary': '#140B12', '--bg-secondary': '#221620',
      '--accent': '#E11D7E', '--accent-light': '#F472B6',
      '--accent-surface': 'rgba(225,29,126,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(225,29,126,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(225,29,126,0.20)',
      '--gradient-start': '#BE185D', '--gradient-end': '#F472B6',
    },
    light: {
      '--bg-primary': '#FFF5F9', '--bg-secondary': '#FDF2F8',
      '--accent': '#DB2777', '--accent-light': '#EC4899',
      '--accent-surface': 'rgba(236,72,153,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(236,72,153,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(236,72,153,0.12)',
      '--gradient-start': '#DB2777', '--gradient-end': '#F472B6',
    },
  },

  'graphite': {
    name: 'Graphite',
    dark: {
      '--bg-primary': '#0E0E10', '--bg-secondary': '#1A1A1E',
      '--accent': '#71717A', '--accent-light': '#A1A1AA',
      '--accent-surface': 'rgba(113,113,122,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(255,255,255,0.10)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(161,161,170,0.10)',
      '--gradient-start': '#52525B', '--gradient-end': '#A1A1AA',
    },
    light: {
      '--bg-primary': '#FAFAFA', '--bg-secondary': '#F4F4F5',
      '--accent': '#52525B', '--accent-light': '#71717A',
      '--accent-surface': 'rgba(113,113,122,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(0,0,0,0.08)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(113,113,122,0.08)',
      '--gradient-start': '#71717A', '--gradient-end': '#A1A1AA',
    },
  },

  'royal-blue': {
    name: 'Royal Blue',
    dark: {
      '--bg-primary': '#0A0E1C', '--bg-secondary': '#151D35',
      '--accent': '#2563EB', '--accent-light': '#60A5FA',
      '--accent-surface': 'rgba(37,99,235,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(37,99,235,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(37,99,235,0.20)',
      '--gradient-start': '#1D4ED8', '--gradient-end': '#60A5FA',
    },
    light: {
      '--bg-primary': '#F0F5FF', '--bg-secondary': '#EFF6FF',
      '--accent': '#1D4ED8', '--accent-light': '#3B82F6',
      '--accent-surface': 'rgba(29,78,216,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(29,78,216,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(29,78,216,0.12)',
      '--gradient-start': '#1D4ED8', '--gradient-end': '#60A5FA',
    },
  },

  'deep-green-gold': {
    name: 'Forest Gold',
    dark: {
      '--bg-primary': '#0A140D', '--bg-secondary': '#16241A',
      '--accent': '#D4A84B', '--accent-light': '#22C55E',
      '--accent-surface': 'rgba(212,168,75,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(34,197,94,0.12)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(212,168,75,0.20)',
      '--gradient-start': '#B8942E', '--gradient-end': '#22C55E',
    },
    light: {
      '--bg-primary': '#F5FFF5', '--bg-secondary': '#ECFDF0',
      '--accent': '#A67C22', '--accent-light': '#16A34A',
      '--accent-surface': 'rgba(199,154,59,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(34,197,94,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(199,154,59,0.12)',
      '--gradient-start': '#C79A3B', '--gradient-end': '#22C55E',
    },
  },

  'crimson-eclipse': {
    name: 'Crimson Eclipse',
    dark: {
      '--bg-primary': '#100A0C', '--bg-secondary': '#1E1215',
      '--accent': '#DC2626', '--accent-light': '#F87171',
      '--accent-surface': 'rgba(220,38,38,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(220,38,38,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(220,38,38,0.20)',
      '--gradient-start': '#991B1B', '--gradient-end': '#EF4444',
    },
    light: {
      '--bg-primary': '#FFF5F5', '--bg-secondary': '#FEE2E2',
      '--accent': '#B91C1C', '--accent-light': '#DC2626',
      '--accent-surface': 'rgba(220,38,38,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(220,38,38,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(220,38,38,0.12)',
      '--gradient-start': '#7F1D1D', '--gradient-end': '#DC2626',
    },
  },

  'nebula-wine': {
    name: 'Nebula Wine',
    dark: {
      '--bg-primary': '#0E0A14', '--bg-secondary': '#1C1424',
      '--accent': '#C026D3', '--accent-light': '#E879F9',
      '--accent-surface': 'rgba(192,38,211,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(192,38,211,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(192,38,211,0.20)',
      '--gradient-start': '#86198F', '--gradient-end': '#D946EF',
    },
    light: {
      '--bg-primary': '#FDF4FF', '--bg-secondary': '#FAE8FF',
      '--accent': '#A21CAF', '--accent-light': '#C026D3',
      '--accent-surface': 'rgba(192,38,211,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(192,38,211,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(192,38,211,0.12)',
      '--gradient-start': '#86198F', '--gradient-end': '#D946EF',
    },
  },

  'lunar-silver': {
    name: 'Lunar Silver',
    dark: {
      '--bg-primary': '#0C0C0E', '--bg-secondary': '#18181C',
      '--accent': '#A1A1AA', '--accent-light': '#D4D4D8',
      '--accent-surface': 'rgba(161,161,170,0.08)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(255,255,255,0.10)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(212,212,216,0.08)',
      '--gradient-start': '#71717A', '--gradient-end': '#D4D4D8',
    },
    light: {
      '--bg-primary': '#FAFAFA', '--bg-secondary': '#F4F4F5',
      '--accent': '#52525B', '--accent-light': '#71717A',
      '--accent-surface': 'rgba(82,82,91,0.06)',
      '--surface': 'rgba(0,0,0,0.02)', '--surface-hover': 'rgba(0,0,0,0.04)',
      '--surface-active': 'rgba(0,0,0,0.07)',
      '--border-color': 'rgba(0,0,0,0.07)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(82,82,91,0.06)',
      '--gradient-start': '#71717A', '--gradient-end': '#A1A1AA',
    },
  },

  'solar-inferno': {
    name: 'Solar Inferno',
    dark: {
      '--bg-primary': '#0E0B08', '--bg-secondary': '#1C1510',
      '--accent': '#EA580C', '--accent-light': '#FB923C',
      '--accent-surface': 'rgba(234,88,12,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(234,88,12,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(234,88,12,0.20)',
      '--gradient-start': '#C2410C', '--gradient-end': '#FB923C',
    },
    light: {
      '--bg-primary': '#FFF7ED', '--bg-secondary': '#FFEDD5',
      '--accent': '#C2410C', '--accent-light': '#EA580C',
      '--accent-surface': 'rgba(234,88,12,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(234,88,12,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(234,88,12,0.12)',
      '--gradient-start': '#9A3412', '--gradient-end': '#EA580C',
    },
  },

  'cosmic-indigo': {
    name: 'Cosmic Indigo',
    dark: {
      '--bg-primary': '#0A0D1C', '--bg-secondary': '#151A30',
      '--accent': '#6366F1', '--accent-light': '#818CF8',
      '--accent-surface': 'rgba(99,102,241,0.10)',
      '--surface': 'rgba(255,255,255,0.05)', '--surface-hover': 'rgba(255,255,255,0.08)',
      '--surface-active': 'rgba(99,102,241,0.15)',
      '--border-color': 'rgba(255,255,255,0.08)',
      ...NEUTRAL_TEXT_DARK,
      '--glow': 'rgba(99,102,241,0.20)',
      '--gradient-start': '#4338CA', '--gradient-end': '#818CF8',
    },
    light: {
      '--bg-primary': '#EEF2FF', '--bg-secondary': '#E0E7FF',
      '--accent': '#3730A3', '--accent-light': '#4338CA',
      '--accent-surface': 'rgba(67,56,202,0.08)',
      '--surface': 'rgba(0,0,0,0.03)', '--surface-hover': 'rgba(0,0,0,0.05)',
      '--surface-active': 'rgba(67,56,202,0.1)',
      '--border-color': 'rgba(0,0,0,0.08)',
      ...NEUTRAL_TEXT_LIGHT,
      '--glow': 'rgba(67,56,202,0.12)',
      '--gradient-start': '#1E1B4B', '--gradient-end': '#4338CA',
    },
  },
};

export const defaultPalette = 'midnight-purple';
export const defaultTheme = 'dark';

export function applyPalette(paletteName, theme) {
  const palette = palettes[paletteName];
  if (!palette) return;
  const vars = palette[theme] || palette.dark;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
